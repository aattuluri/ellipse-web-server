const React = require('react');
const UIUtils = require('../../UIUtils');
const Html = require('../../shared/Html.jsx');
const ChatHeader = require('../../shared/ChatHeader.jsx');
const ChatMessageList = require('../../shared/ChatMessageList.jsx');

module.exports = function Chat(props) {
  const trip = props.trip;
  const content = (
    <div className="container">
      <ChatHeader
        userName={trip.userName}
        origin={trip.origin}
        destination={trip.destination}
        days={trip.days}
        people={trip.people}
        status={trip.status}
      />
      <ChatMessageList chat={props.chat} />
    </div>
  );

  return (
    <Html pageTitle={`AA admin - trip ${props.trip._id}`} content={content} />
  );
}
