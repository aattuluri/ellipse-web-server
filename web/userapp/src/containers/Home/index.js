import React, { Component } from 'react';
import update from 'react-addons-update';

/* component styles */
import { styles } from './styles.scss';
import * as constants from '../../constants';
/* components */
import Sidebar from 'react-sidebar';
import { AuthCheck } from '../../components/AuthCheck';
import { Header } from '../../components/Header';
import { Bubble } from '../../components/Bubble';
import { ListItem } from '../../components/ListItem';
import { AaButton } from '../../components/AaButton';

import request from 'superagent';

export class Home extends Component {

  state = {
    sidebarOpen: false,
    newChats: [],
    activeChats: [],
    invitedChats: []
  };

  constructor(props) {
    super(props);
    this.state = {
        sidebarOpen: false,
        newChats: [],
        activeChats: [],
        invitedChats: []
    };
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    this.loadNewChats.bind(this);
    this.loadActiveChats.bind(this);
    this.loadInvitedChats.bind(this);
    this.addNewChat.bind(this);
    this.addActiveChat.bind(this);
    this.addInvitedChat.bind(this);
    this.loadNewChats ();
    this.loadActiveChats ();
    this.loadInvitedChats ();
  };

  loadNewChats = () => {
    request
    .get('/user/newchats')
    .end((err, res={}) => {
      const { body } = res;
      if (!body) {
        //TBD: show error
        return;
      }
      var nThis = this;
      body.map(function(newChat){
          nThis.addNewChat(newChat);
      });
    });
  }

  addNewChat = (newChat) => {
    let { newChats } = this.state;
    newChats.push(newChat);
    this.setState({newChats});
  }

  loadActiveChats = () => {
    request
    .get('/user/activechats')
    .end((err, res={}) => {
      const { body } = res;
      if (!body) {
        //TBD: show error
        return;
      }
      var nThis = this;
      body.map(function(activeChat){
          nThis.addActiveChat(activeChat);
      });
    });
  }

  addActiveChat = (activeChat) => {
    let { activeChats } = this.state;
    activeChats.push(activeChat);
    this.setState({activeChats});
  }

  loadInvitedChats = () => {
    request
    .get('/user/invitedchats')
    .end((err, res={}) => {
      const { body } = res;
      if (err || !body) {
        //TBD: show error
        return;
      }
      var nThis = this;
      body.map(function(invitedChat){
          nThis.addInvitedChat(invitedChat);
      });
    });
  }

  addInvitedChat = (invitedChat) => {
    let { invitedChats } = this.state;
    invitedChats.push(invitedChat);
    this.setState({invitedChats});
  }

  onSetSidebarOpen (open) {
    this.setState ({sidebarOpen: open});
  }

  render() {
    let {newChats, activeChats, invitedChats} = this.state;
    var sidebarContent = <div><b>Sidebar content</b><br/><b>Sidebar content</b><br/><b>Sidebar content</b></div>;
    var m = "We are matching you with travel agents! You will receive an email and a text alert when an agent is ready to talk to you.";
    if (newChats.length > 0) {
      m = "Here are your newly matched travel agents!";
    }
    var msg = {
      u: "you",
      m: m
    };
    var newChatsLinks = newChats.map(function(newChat) {
      return (
        <ListItem img={newChat.image} text={newChat.message} chatid={newChat.id} />
      );
    });
    var aCMsg = {
        u: "you",
        m: "Here are your ongoing chats!"
    };
    var activeChatsLinks = activeChats.map(function(activeChat) {
      return (
        <ListItem img={activeChat.image} text={activeChat.message} chatid={activeChat.id} highlight="highlight"/>
      );
    });
    var iCMsg = {
        u: "you",
        m: "Here are your invited chats!"
    };
    var invitedChatsLinks = invitedChats.map(function(invitedChat) {
      return (
        <ListItem img={invitedChat.image} text={invitedChat.message} chatid={invitedChat.id} highlight="highlight"/>
      );
    });
    var open = false;

    return (
      <div>
        <AuthCheck />
        <Header title="Agent Avery" showLogo="true" enableLogout="true"/>
        <div className={`${styles} col-xs-12 col-sm-12 col-md-8 col-lg-6 col-md-offset-2 col-lg-offset-3`}>*
            <section>
              <div className="home-body">
                  {
                    (activeChats.length > 0 || newChats.length > 0)? '' :
                    <div className="info-message">
                        <Bubble cssClass="you" msg={msg}/>
                    </div>
                  }
                  {
                    <div className="new-chats-list">
                       {newChatsLinks}
                    </div>
                  }
                  {
                  (activeChats.length > 0)?
                    <div className="info-message">
                      <Bubble cssClass="you" msg={aCMsg}/>
                    </div> : ''
                  }
                  <div className="new-chats-list">
                     {activeChatsLinks}
                  </div>
                  {(invitedChats.length > 0)?
                    <div className="info-message">
                      <Bubble cssClass="you" msg={iCMsg}/>
                    </div> : ''
                  }
                  <div className="invited-chats-list">
                     {invitedChatsLinks}
                  </div>
              </div>
            </section>
        </div>
      </div>
    );
  }
}
