var FluxConstant = require('flux-constant');

module.exports = {

  ActionTypes: FluxConstant.set([
    'CLICK_THREAD',
    'CREATE_MESSAGE',
    'RECEIVE_NEW_MESSAGE',
    'RECEIVE_MESSAGES',
    'RECEIVE_TYPING_ACTION',
    'RECEIVE_JOIN_MESSAGE',
    'RECEIVE_LEAVE_MESSAGE'
  ])

};
