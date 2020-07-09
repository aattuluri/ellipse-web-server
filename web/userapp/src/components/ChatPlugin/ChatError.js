import React, { Component } from 'react';

export class ChatError extends Component {

  render() {
    return (
      <div className="chat-error">
        {this.props.error}
      </div>
    );
  }
}

//TODO: parse ajax error
export function getAjaxError(err, body){
  let error = null;
  if (body) {
    error = body.message || body.error;
  } else {
    error = err.message;
  }
  return error;
}