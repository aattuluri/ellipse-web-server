import React from 'react';

const FAQ_URL = "https://docs.google.com/document/d/1c-oCPRkSmqw8Wh8jiFJIsEZndnQrkt-U9iwe05bFK4Y";

module.exports = function TopNavbar(props) {
  return (
    <div className="TopNavbar">
      <a href={FAQ_URL} target="blank">
        Travel Agent & Tour Operator FAQ
      </a>
      <a href="/logout" className="TopNavbar-logout btn btn-default">
        Log Out
      </a>
    </div>
  );
};
