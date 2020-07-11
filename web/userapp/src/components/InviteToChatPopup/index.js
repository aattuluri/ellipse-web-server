import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { Modal } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import { Input } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { OverlayTrigger } from 'react-bootstrap';
import { OverlayMixin } from 'react-bootstrap';

import request from 'superagent';
import * as constants from '../../constants';

import { AaButton } from '../../components/AaButton';

/* component styles */
import { styles } from './styles.scss';

export const InviteToChatPopup = React.createClass({

  getInitialState() {
    return {
      showModal: false
    };
  },

  componentDidMount() {
    $('#itc-form').parsley();
  },

  openMe() {
  	this.setState({
  		showModal: true
  	});
    $('#itc-form').parsley();
  },

  closeMe() {
    this.setState({
      showModal: false
    });
  },

  sendResponse (event) {
    event.preventDefault();
    event.stopPropagation();
    var isFormValid = $('#itc-form').parsley().isValid({force: true});
    if (!isFormValid) {
      $('#itc-form').parsley().validate({force: true});
      return;
    }
    var basePath = "/trip/" + this.props.chatId + "/invite";
  	var payload = {
  		email: $("#itc-email").val(),
  		message: $("#itc-message").val(),
  	};
    var that = this;
  	$.ajax({
  		url: basePath,
  		type: "POST",
  		dataType: "json",
  		contentType: 'application/json; charset=utf-8',
  		data: JSON.stringify(payload),
  		success: function(response, textStatus, jqXHR) {
  			if (response.success) {
  				that.closeMe();
  			} else {
  				console.log('Invite to chat error: data not submitted');
  			}
  		},
  		error: function(jqXHR, textStatus, errorThrown) {
  			//TBD: show UI error
  		}
  	});
  },

  render() {

    return (
      <div className={`${styles}`}>
        <div>
          <i className='fa fa-user-plus fa-2x'
          	style={this.props.styling}
            onClick={this.openMe}>
          </i>
        </div>
        <div className="invite-to-chat-popup">
          <Modal
            show={this.state.showModal}
            onHide={this.closeMe}
            dialogClassName="chatbox"
            >
            <div className="innn-popup">
              <Modal.Header closeButton>
                <Modal.Title
                className="fee-header"
                >Invite to Chat</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form id="itc-form">
                	<Input type="email" label="Email" placeholder="Email" id="itc-email"
                    data-parsley-type="email" data-parsley-trigger="change"
                    data-parsley-error-message="Enter a valid email address"/>
                  <Input type="textarea" label="Invitation message" rows="3" placeholder="Enter a message for your invitee"
                      id="itc-message"/>
                </form>
              </Modal.Body>
              <Modal.Footer>
                <div className="close-container">
                  <AaButton
                    className="aa-btn submit-btn"
                    onClick={this.sendResponse}
                    label="SUBMIT"/>
                  <AaButton
                    className="aa-btn close-btn"
                    onClick={this.closeMe}
                    label="CLOSE"/>
                </div>
              </Modal.Footer>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
});
