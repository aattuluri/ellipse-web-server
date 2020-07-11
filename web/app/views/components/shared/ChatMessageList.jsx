const _ = require('lodash');
const React = require('react');
const ChatMessage = require('./ChatMessage.jsx');

module.exports = function ChatMessageList(props) {
  return (
    <div className="chat">
      {
        // TODO(ivan): use mesage ID as key.
        _.map(props.chat, message => (
          <ChatMessage key={message.t} chatMessage={message} />
        ))
      }
    </div>
  );
}
