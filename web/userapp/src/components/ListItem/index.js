import React, { Component } from 'react';
import moment from 'moment';
import * as constants from '../../constants';

/* component styles */
import { styles } from './styles.scss';

export class ListItem extends Component {

  static propTypes = {
    chatid: React.PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.openChat.bind(this);
  };

  openChat = (ev) => {
    if (!this.props.action) { return; }
    let chatid = this.refs.chat.dataset.id;
    this.props.action(chatid);
    if (ev) {
      ev.preventDefault();
    }
  }

  render() {
    const { highlight, img, text, chatid } = this.props;

    var imgSrc = img || "/img/agent_profile.png";
    var introText = text || "Hey there! I can help you plan your trip!!";

    return (
      <div className={`${styles}`}>
        <a href={(this.props.action)? "javascript:void(0)" : ("#/chat/" + chatid)} onClick={this.openChat.bind(this)} data-id={chatid} ref='chat'>
          <div className={highlight}>
              <div className="img">
                <img src={imgSrc}></img>
              </div>
              <div className="text">{introText}</div>
              <div className="link nav-icon fa fa-arrow-right"></div>
          </div>
        </a>
      </div>
    );
  }
}
