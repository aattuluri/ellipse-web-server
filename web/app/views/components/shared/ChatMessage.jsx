const React = require('react');
const moment = require('moment');

module.exports = function ChatMessage(props) {
  const message = props.chatMessage;
  const timeString = moment(message.t).format('HH:mm:ss A');
  const imageUrl = '/img/user_profile.png';

  return (
    <div className="chat-item">
      <span><img className="chat-image" src={imageUrl}/></span>
      <span className="user-name">{message.u}</span>
      <span>{timeString}</span>
      <div className="chat-message">
        <div className="chat-message">
          {message.m}
        </div>
      </div>
    </div>
  );
}
