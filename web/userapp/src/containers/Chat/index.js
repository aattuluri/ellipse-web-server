import React, { Component } from 'react';
import Sidebar from 'react-sidebar';

/* component styles */
import { styles } from './styles.scss';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { sendMessage } from '../../actions';
import * as constants from '../../constants';
import request from 'superagent';

import { AuthCheck } from '../../components/AuthCheck';
import { Header } from '../../components/Header';
import { Bubble } from '../../components/Bubble';
import { ConfirmationPopup } from '../../components/ConfirmationPopup';
import { InviteToChatPopup } from '../../components/InviteToChatPopup';

// import SidebarContent from '../../components/SidebarContent';

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
    docked: false,
    open: false,
    numUsers: 0,
    isOwnerOfChat: false
  };

  constructor(props) {
    super(props);

    this.chatId = this.props.routeParams.chatId;
    let socket = io.connect();
    this.socket = socket;
    this.userName = 'Client';
    this.agentName = 'Agent';
    this.agentImg = 'img';
    this.timerId = '';

    //bind all functions
    this.loadChat.bind(this);
    this.getAgentInfo.bind(this);
    this.markChatAsStarted.bind(this);
    this.clearUnreadMessageCount.bind(this);

    this.markChatAsStarted (this.chatId);

    this.getAgentInfo (this.chatId);

    socket.on('connect', () => {
        this.setState({
          connected: true,
          status: '',
          docked: false,
          open: false,
          numUsers: 0,
          isOwnerOfChat: false
        });

        request
        .get('/userinfo')
        .end((err, res={}) => {
          const { body } = res;
          if (!err && body && body.email
              && body.name) {
            this.userId = body.id;
            this.userName = body.name;
            this.email = body.email;
            //load the chat history
            //this.loadChat(this.chatId);
            //join the chat
            socket.emit('io:join', {c: this.chatId, u: this.userName, uid: this.userId});

          } else {
            //TBD: show error?
          }
        });

        request
        .get('/trip/' + this.chatId + '/isowner')
        .end((err, res={}) => {
          const { body } = res;
          if (!err && body && body.success) {
            this.setState ({isOwnerOfChat: body.success});
          } else {
            //TBD: show error?
          }
        });

    });

    socket.on('io:msg:welcome', (welcome) => {
      //console.log(welcome);
      //TBD: We need to save the other user's details here, not required right now
    });

    //subscribe to get the latest messages
    socket.on('io:msg:latest', (msg) => {
      this.addMessage(msg);
      this.scrollToBottom();
      this.clearUnreadMessageCount(this.chatId);
    });

    //subscribe to the user typing event
    socket.on('io:typing', (msg) => {
      var newMsgUser = msg.u;
      if (msg.uid) {
        newMsgUser = this.state.usersInfoMap[msg.uid + ""].firstName;
      }
      if (newMsgUser != this.userName) {
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
          this.loadChat (this.chatId);
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

  clearUnreadMessageCount = (chatId) => {
  		var basePath = "/chat/" + chatId + "/clear-unread";
  		$.ajax({
  			url: basePath,
  			type: "DELETE",
  			success: function(response, textStatus, jqXHR) {
  				//do nothing
  			},
  			error: function(jqXHR, textStatus, errorThrown){
  				//do nothing
  			}
  		});
	}

  /**
    * @desc Instance Methods
  */
  loadChat = (chatId) => {
    request
    .get('/loadChat/' + chatId)
    .end((err, res={}) => {
      const { body } = res;
      if (!body) {
        //TBD: show error
        return;
      }
      var chatThis = this;
      body.map(function(msg){
          msg = JSON.parse(msg);
          chatThis.addMessage(msg);
      });
      chatThis.clearUnreadMessageCount(chatId);
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
    messages.push(message);
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

  componentWillMount() {
    const mql = window.matchMedia(`(min-width: 800px)`);
    mql.addListener(this.mediaQueryChanged);
    this.setState({mql: mql, docked: mql.matches});
  };

  componentWillUnmount() {
    this.state.mql.removeListener(this.mediaQueryChanged);
  };

  onSetOpen = (open) => {
    this.setState({
      open: open});
  };

  mediaQueryChanged() {
    this.setState({docked: this.state.mql.matches});
  };

  toggleOpen = (ev) => {
    this.setState({
      open: !this.state.open
    });
    if (ev) {
      ev.preventDefault();
    }
  };

  /**
    * @desc React Lifecycle Methods
  */
  render() {
    const { messages, status, connected, numUsers} = this.state;
    const statusStyle = !connected && status != '' ? 'red' : 'white' ;
    let messageHistory =
      <div className={`${styles} col-xs-12 col-sm-12 col-md-8 col-lg-6 col-md-offset-2 col-lg-offset-3`}>
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
        <div className={`status-row ${statusStyle}`}>
          { status }
        </div>
        <div className='bottom-row'>
          <textarea onKeyUp={ this.textAreaAdjustHandler } className='input-box' type='text' placeholder='Type a message' ref='inputBox'/>
          <a onClick={ this.sendMessageHandler } className='send-button'><i className="fa fa-paper-plane" /></a>
        </div>
      </div>

      let iconStyle = {
        display: 'block',
        color: '#33eebb',
        textAlign: 'center',
        textDecoration: 'none',
        opacity: 1
      };

      let sidebar =
        <div>
          <div className='sidebar-content'>
            <div className='divider'></div><br/>
              <a href={constants.ABS_ROUTE_HOME} style={iconStyle}><i className='fa fa-arrow-left fa-2x'></i></a><br/>
              <a href={"/userapp#/itinerary/" + this.chatId} style={iconStyle}><i className='fa fa-list-alt fa-2x'></i></a><br/>
              {(this.state.isOwnerOfChat)? <InviteToChatPopup chatId={this.chatId} styling={iconStyle}/> : '' }
              <br/>
              {(this.state.isOwnerOfChat)? <ConfirmationPopup title={this.chatId} styling={iconStyle}/> : '' }
          </div>
        </div>

    const sidebarProps = {
      sidebar: sidebar,
      docked: this.state.docked,
      open: this.state.open,
      onSetOpen: this.onSetOpen,
      pullRight: true,
      styles: {sidebar: {top: 75, bottom: 73, backgroundColor: '#212629', opacity: .75, width: 65, textAlign: 'center'}}
    };

    return (
        <Sidebar {...sidebarProps}>
          <AuthCheck />
          <Header title={this.agentName} leftImage={this.agentImage} action={this.toggleOpen} />
          {messageHistory}
        </Sidebar>
    );
  }
};
