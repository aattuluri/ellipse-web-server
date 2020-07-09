var React = require('react');

var ModalPopup = require("./ModalPopup.jsx");

var SessionExpired = React.createClass({

  render: function() {
    return(
      <ModalPopup id="session-expired-popup" keyboard="false" backdrop="static"
          title="Session expired" actionClass="session-expired-btn-ok"
          message="You session has exired. Please login to continue."
          actionLabel="Continue to Login" doNotShowClose="1"></ModalPopup>
    );
  }
});

module.exports = SessionExpired;
