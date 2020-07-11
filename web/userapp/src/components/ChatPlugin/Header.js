import React, { Component } from 'react';
import * as constants from '../../constants';

export class Header extends Component {

  render() {
    return (
      <div className="chat-header">
        <div className="nav">
          <span className="header-center-section">
            { (this.props.showLogo)? <img src={`${constants.SERVER_URL}/dist/logo-small.png`} className="header-logo"/>: ''}
            <a >
                <span>{this.props.title}</span>
            </a>
          </span>
          {
            (this.props.action)?
            <a onClick={this.props.action}>
               <i className="header-right-section nav-icon fa fa-minus fa-x5 pull-right "></i>
            </a> : ''
          }
        </div>
      </div>
    );
  }
}
