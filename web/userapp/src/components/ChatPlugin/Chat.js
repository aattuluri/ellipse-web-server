import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { sendMessage } from '../../actions';
import * as constants from '../../constants';
import request from 'superagent';
import cookie from 'react-cookie';

import { Header } from './Header';
import { ChatError, getAjaxError } from './ChatError';
import { Bubble } from '../../components/Bubble';
import { ConfirmationPopup } from '../../components/ConfirmationPopup';
import { InviteToChatPopup } from '../../components/InviteToChatPopup';

@connect(
  state => ({messages: state.messages}),
  dispatch => bindActionCreators({
    sendMessage
  }, dispatch)
)
export class Chat extends Component {
  state = {
    messages: [],
    status: '',
    connected: true,
    numUsers: 0,
    error: null,
    isOwnerOfChat: false
  };

  constructor(props) {
    super(props);

    this.chatId = this.props.chatId;
    let socket = io.connect(constants.SERVER_URL);
    this.socket = socket;
    this.userName = 'Client';
    this.agentName = 'Agent';
    this.agentImg = 'img';
    this.timerId = '';

    //bind all functions
    this.loadChat.bind(this);

    socket.on('connect', () => {
      this.setState({
        connected: true,
        status: '',
        numUsers: 0,
        isOwnerOfChat: false
      });

      // this.loadChat(this.chatId);

      let chatInfo = cookie.load('chatInfo');
      this.userId = chatInfo.userId;
      this.userName = `${chatInfo.firstName} ${chatInfo.lastName}`;
      this.email = chatInfo.email;
      socket.emit('io:join', {c: this.chatId, u: this.userName, uid: this.userId});
    });

    socket.on('io:msg:welcome', (welcome) => {
      //console.log(welcome);
      //TBD: We need to save the other user's details here, not required right now
    });

    //subscribe to get the latest messages
    socket.on('io:msg:latest', (msg) => {
      this.addMessage(msg);
      this.scrollToBottom();
    });

    //subscribe to the user typing event
    socket.on('io:typing', (msg) => {
      var newMsgUser = msg.u;
      if (msg.uid &&
            msg.uid != this.userId) {
        newMsgUser = this.state.usersInfoMap[msg.uid + ""].firstName;
        clearTimeout(this.timerId);
        this.setState({
          status: newMsgUser + ' is typing...'
        });
        this.timerId = setTimeout(() => {
          this.setState({
            status: ''
          });
        }, 1000);
      }
    });

    //subscribe to the user typing event
    socket.on('io:usersinfo', (msg) => {
      var origUsersInfoMap = this.state.usersInfoMap;
      let usersInfoMap = {};
      if (msg && msg.usersinfo) {
        var usersinfo = msg.usersinfo;
        for (var i = 0; i < usersinfo.length; i++) {
          var userinfo = usersinfo[i];
          var uid = userinfo._id;
          userinfo.color = constants.CHAT_COLORS[i % constants.CHAT_COLORS.length];
          usersInfoMap["" + uid] = userinfo;
        }
        var currState = this.state;
        currState.usersInfoMap = usersInfoMap;
        currState.numUsers = usersinfo.length;
        this.setState(currState);
        //load the chat history if this is the first time we got the usersinfo message
        if (!origUsersInfoMap) {
          this.loadChat(this.chatId);
        }
      }
    });

    //on socket error
    socket.on('error', function(err) {
      //TBD: Handle errors
    });

    //on connect errors
    socket.on('connect_error', (err) => {
      this.setState({
        status: 'Disconnected from server...',
        connected: false
      });
    });
  };

  markChatAsStarted = (chatId) => {
    request
    .get('/chat/' + chatId + '/start')
    .end((err, res={}) => {

    });
  };

  /**
    * @desc Instance Methods
  */
  loadChat = (chatId) => {
    request
    .get(constants.SERVER_URL + '/p/loadChat/' + chatId)
    .set('apikey', this.props.apiKey)
    .end((err, res={}) => {
      const { body } = res;
      if (err || !res.ok) {
        let error = getAjaxError(err, body);
        this.setState({ error: error });
        return;
      }
      this.setState({ error: null });
      this.addMessage(body);
    });
  };

  getAgentInfo = (chatId) => {
    request
    .get('/agentinfo/' + chatId)
    .end((err, res={}) => {
      const { body } = res;
      if (err || !body) {
        return;
      }
      this.agentName = body.name;
      this.agentImage = body.image;
    });
  };

  addMessage = (message) => {
    let { messages } = this.state;
    if (message instanceof Array) {
      message = message.map(JSON.parse)
      messages = messages.concat(message)
    } else {
      messages.push(message);
    }
    this.setState({
      messages
    });
  }

  scrollToBottom = () => {
    const historyBox = this.refs.historyBox;
    historyBox.scrollTop = historyBox.scrollHeight;
  }

  /**
    * @desc Event Handlers
  */
  textAreaAdjustHandler = (e) => {
    if (e && e.which == constants.ENTER_KEY_CODE) {
      this.sendMessageHandler(e);
      return;
    }

    this.socket.emit('io:typing', {c: this.chatId, u: this.userName});

    const inputBox = this.refs.inputBox;
    inputBox.style.height = "1px";
    inputBox.style.height = (7+inputBox.scrollHeight)+"px";
    this.scrollToBottom();
  };

  sendMessageHandler = (e) => {
    e.preventDefault();

    //do not send messages if server is not reachable
    const { connected } = this.state;
    if (!connected) {
      return;
    }
    const inputBox = this.refs.inputBox;

    //if input is empty or white space do not send message
    if (inputBox.value.match(/^[\s]*$/) == null) {
      this.socket.emit('io:msg', {c: this.chatId, m: inputBox.value});
    }

    inputBox.value = '';
    this.textAreaAdjustHandler();
  };

  /**
    * @desc React Lifecycle Methods
  */
  componentWillUpdate(nextProps, nextState) {
    if ( nextState.error ) {
      cookie.remove('chatInfo', { path: '/' });
      this.props.start(null, false);
    }
  }

  render() {
    const { messages, status, connected, numUsers, usersInfoMap} = this.state;
    const statusStyle = !connected && status != '' ? 'red' : 'white' ;

    let messageHistory =
      <div className='history-box' ref='historyBox'>
        <p>Loading chat...</p>
      </div>

    if (usersInfoMap) {
      messageHistory =
        <div className='history-box' ref='historyBox'>
          {
            messages.map ((m, index) => {
              let img = null;
              if (m.uid && this.state.usersInfoMap["" + m.uid]) {
                let uim = this.state.usersInfoMap["" + m.uid];
                m.img = uim.image;
                m.c = uim.color;
                m.u = uim.firstName;
              }
              return (<Bubble key={index} msg={m} u={this.userName} me={this.userId} multi={(numUsers > 2)? true : false}/>);
            })
          }
        </div>
    }

    return (
      <div className="chat">
        <Header title="Agent Avery" showLogo="true" action={this.props.action}/>
        <div className="chat-inner">
          <ChatError error={this.state.error} />
          {messageHistory}
          <div className='bottom-row'>
            <textarea onKeyUp={ this.textAreaAdjustHandler } className='input-box' type='text' placeholder='Type a message' ref='inputBox'/>
            <a onClick={ this.sendMessageHandler } className='send-button'><i className="fa fa-paper-plane" /></a>
          </div>
          <div className={`status-row ${statusStyle}`}>
            { status }
          </div>
        </div>

      </div>
    );
  }
};
