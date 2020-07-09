var ChatAppDispatcher = require('../Dispatchers/ChatDispatcher');
var ChatConstants = require('../Constants/ChatConstants');
var ChatMessageUtils = require('../Utils/ChatMessageUtils');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = ChatConstants.ActionTypes;
var CHANGE_EVENT = 'change';

var _currentID = null;
var _threads = {};

var ChatGroupStore = assign({}, EventEmitter.prototype, {

  init: function(rawMessages) {
    rawMessages.forEach(function(message) {
      var threadID = message.c;
      var thread = _threads[threadID];
      if (thread && thread.lastMessage.t > message.t) {
        return;
      }
      _threads[threadID] = {
        id: threadID,
        name: threadID,
        lastMessage: ChatMessageUtils.convertRawMessage(message, _currentID)
      };
    }, this);

    if (!_currentID) {
      var allChrono = this.getAllChrono();
      _currentID = allChrono[allChrono.length - 1].id;
    }

    _threads[_currentID].lastMessage.isRead = true;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  /**
   * @param {string} id
   */
  get: function(id) {
    return _threads[id];
  },

  getAll: function() {
    return _threads;
  },

  getAllChrono: function() {
    var orderedThreads = [];
    for (var id in _threads) {
      var thread = _threads[id];
      orderedThreads.push(thread);
    }
    orderedThreads.sort(function(a, b) {
      if (a.lastMessage.date < b.lastMessage.date) {
        return -1;
      } else if (a.lastMessage.date > b.lastMessage.date) {
        return 1;
      }
      return 0;
    });
    return orderedThreads;
  },

  getCurrentID: function() {
    return _currentID;
  },

  getCurrent: function() {
    return this.get(this.getCurrentID());
  }

});

ChatGroupStore.dispatchToken = ChatDispatcher.register(function(action) {

  switch(action.type) {

    case ActionTypes.CLICK_CHAT_THREAD:
      _currentID = action.chatId;
      _threads[_currentID].lastMessage.isRead = true;
      ChatGroupStore.emitChange();
      break;

    case ActionTypes.RECEIVE_MESSAGES:
      ChatGroupStore.init(action.rawMessages);
      ChatGroupStore.emitChange();
      break;

    default:
      // do nothing
  }

});

module.exports = ChatGroupStore;
