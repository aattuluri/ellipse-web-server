import React, { Component } from 'react';
import update from 'react-addons-update';
import Sidebar from 'react-sidebar';
import cookie from 'react-cookie';

/* component styles */
import { styles } from './styles.scss';
import * as constants from '../../constants';
/* components */
import { Chat } from './Chat';
import { GetStarted } from './GetStarted';
import { StartChat } from './StartChat';

import request from 'superagent';

export class ChatPlugin extends Component {
  state = {
    apiKey: null,
    title: 'Chat with me to get advice',
    open: false,
    chatId: null
  }
  constructor(props) {
    super(props);
    this.getStarted.bind(this);
  };

  getStarted = (chatId, open) => {
    console.log('You can start from here.');
    this.setState({
      open: open,
      chatId: chatId
    });
  };

  onSetOpen = (open) => {
    this.setState({
      open: open
    });
  };

  toggleOpen = (ev) => {
    this.setState({
      open: !this.state.open
    });
    if (ev) {
      ev.preventDefault();
    }
  };I

  componentWillMount(){
    if (window.chatPluginSettings != undefined){
      const settings = window.chatPluginSettings;
      this.setState({
        apiKey: settings.APIKey,
        title: settings.chatTitle ? settings.chatTitle : this.state.title
      });
    }

    // Check if chat info is here or not.
    let chatInfo = cookie.load('chatInfo');
    if (chatInfo != undefined) {
      this.setState({
        chatId: chatInfo.chatId
      });
    }
  }

  render() {
    let { open, chatId, title } = this.state;
    const siderbarStyle = {
      position: 'fixed',
      top: 'auto',
      bottom: 30,
      background: '#212629',
      border: '1px solid #fff',
      borderRadius: '10px',
      boxShadow: open ? '#999 -1px 0 4px' : 'none',
      padding: 0,
      marginRight: open ? '5px' : 0,
      width: '35%',
      minWidth: '225px',
      overflow: 'hidden',
      zIndex: 120
    };
    const chatStyle = {
      top: '50%',
      bottom: 0,
      height: '50%'
    };

    let chatHTML = <Chat chatId={this.state.chatId} start={this.getStarted} action={this.toggleOpen} apiKey={this.state.apiKey} />
    let getStartedHTML = <GetStarted start={this.getStarted} action={this.toggleOpen} apiKey={this.state.apiKey} />
    const sidebarProps = {
      sidebar: (!chatId ? getStartedHTML : chatHTML),
      open: open,
      // sidebarClassName: (!chatId ? 'col-xs-9 col-sm-4 col-md-3 col-lg-3' : 'col-xs-11 col-sm-11 col-md-6 col-lg-3'),
      // onSetOpen: this.onSetOpen,
      shadow: false,
      pullRight: true,
      styles: {sidebar: (!chatId ? siderbarStyle : Object.assign(siderbarStyle, chatStyle))}
    };

    return (
      <div className={`${styles}`}>
        <Sidebar {...sidebarProps}>
          <p></p>
        </Sidebar>
        <StartChat title={title} action={this.toggleOpen} open={open} />
      </div>
    );
  }
}
