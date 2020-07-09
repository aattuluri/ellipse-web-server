import React, { Component } from 'react';
import { Link } from 'react-router';

/* component styles */
import { styles } from './styles.scss';

import * as constants from '../../constants';

export class Header extends Component {

  render() {

    let leftIcon = '';

    if (this.props.back) {
      leftIcon =
      <a href={this.props.back}>
        <i className="nav-icon fa fa-arrow-left pull-left"></i>
       </a>
    } else if (this.props.leftImage) {
      leftIcon =
      <div className="header-options-icon pull-left nav-icon">
        <img src={this.props.leftImage} className="header-left-image-circle"></img>
      </div>
    }

    return (
      <div className={`${styles}`}>
        <div className="nav">

          {
            leftIcon
          }

          {
            (this.props.doBack)?
            <a onClick={this.props.doBack}>
               <i className="header-right-section nav-icon fa fa-chevron-left fa-x5 pull-left "></i>
            </a> : ''
          }

          {
            //TBD: enable options if present
          }
          <span className="header-center-section">
            { (this.props.showLogo)? <img src={require("../../static/img/logo-small.png")} className="header-logo"/>: ''}
            <a >
                <span>{this.props.title}</span>
            </a>
          </span>
          {
            (this.props.options)?
            <div className="dropdown pull-right">
              <a type="button" id="menu1" data-toggle="dropdown">
                <i className="nav-icon fa fa-chevron-circle-down pull-right"></i>
              </a>
              <ul className="dropdown-menu pull-right"aria-labelledby="menu1">
                <li><a href="#/home">Home</a></li>
              </ul>
            </div> : ''
          }
          {
            (this.props.action)?
            <a onClick={this.props.action}>
               <i className="header-right-section nav-icon fa fa-navicon fa-x5 pull-right "></i>
            </a> : ''
          }

          {
            (this.props.enableLogin)?
            <div className="dropdown pull-right right-side-option">
              <a href="#/login">Login</a>
            </div> : ''
          }
          {
            (this.props.enableLogout)?
            <div className="dropdown pull-right right-side-option">
              <a href="/logout">Logout</a>
            </div> : ''
          }
        </div>
      </div>
    );
  }
}
