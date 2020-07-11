import React, { Component } from 'react'
import * as constants from '../../constants';
/* components */
import { AaButton } from '../../components/AaButton';

export class StartChat extends Component {
  render () {
    return (
      <div className={`chat-container start-chat ${this.props.open ? '' : 'active'}`}>
        <div className='start-chat-inner'>
          <a className="aa-collapse-btn" onClick={this.props.action}>
            <span>{this.props.title}</span>
            <img src={`${constants.SERVER_URL}/dist/logo-small-notitle.png`} className="header-logo"/>
          </a>
        </div>
      </div>
    )
  }
}