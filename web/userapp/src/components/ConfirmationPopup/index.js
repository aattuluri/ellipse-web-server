import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { Modal } from 'react-bootstrap';
import { Input } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { OverlayTrigger } from 'react-bootstrap';
import { OverlayMixin } from 'react-bootstrap';

import request from 'superagent';
import * as constants from '../../constants';

import { AaLink } from '../../components/AaLink';
import { AaButton } from '../../components/AaButton';

/* component styles */
import { styles } from './styles.scss';

export const ConfirmationPopup = React.createClass({

  getInitialState() {
    return {
      showModal: false,
      data: {}
    };
  },

  linkify (inputText) {
      if (!inputText) return inputText;
      var replacedText, replacePattern1, replacePattern2, replacePattern3;

      //URLs starting with http://, https://, or ftp://
      replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

      //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
      replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

      //Change email addresses to mailto:: links.
      replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
      replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

      return replacedText;
  },

  openMe() {
  	this.setState({
  		showModal: true
  	})
  },

  closeMe() {
    this.setState({
      showModal: false,
      data: {}
    });
  },

  sendResponse() {
  	var basePath = "/chat/" + this.props.title + "/end";
  	var payload = {
  		reason: $("#chatEndReason").val(),
  		description: $("#chatEndDescription").val().trim()
  	};
    var that = this;

  	$.ajax({
  		url: basePath,
  		type: "POST",
  		dataType: "json",
  		contentType: 'application/json; charset=utf-8',
  		data: JSON.stringify(payload),
  		success: function(response, textStatus, jqXHR) {
  			//send a chat message
  			if (response.status &&
  				response.status == "success") {
  				//TBD: remove chat box by setting the redux state
  				$('.bottom-row').remove();
          that.closeMe();
  				// $('#endChatConfirmationDialog').modal('hide');
  			} else {
  				//TBD: show UI error
          console.log('Error: data not submitted');
  			}
  		},
  		error: function(jqXHR, textStatus, errorThrown) {
  			//TBD: show UI error
  		}
  	});




  },

  // shouldComponentUpdate: function(nextProps, nextState) {
  // 	// console.log("props: ", this.props, "next: ", nextProps);
  // 	return (!!nextState.showModal);
  // },

  render() {
    var description = this.linkify(this.state.data.description);

    var popupStyle = {
      top: 100
    }

    return (
      <div>
        <div>
          <i className='fa fa-times fa-2x'
          	style={this.props.styling }
            onClick={this.openMe}>
          </i>
        </div>

        <div className="end-popup">
          <Modal
            show={this.state.showModal}
            onHide={this.closeMe}
            dialogClassName="chatbox"
            >
            <div className="innn-popup">
              <Modal.Header closeButton>
                <Modal.Title
                className="fee-header"
                >End Chat</Modal.Title>
              </Modal.Header>
              <Modal.Body>
              	<Input type="select" label="Reason" placeholder="Select" id="chatEndReason">
  					      <option value="select">Select</option>
                  <option value="Agent is slow in responding">Agent is slow in responding</option>
                  <option value="Booked my trip already">Booked my trip already</option>
                  <option value="I dont like the options">I don't like the options</option>
                  <option value="I found better options elsewhere">I found better options elsewhere</option>
  					      <option value="I don't want to take the trip anymore">I don't want to take the trip anymore</option>
                  <option value="Other">Other</option>
  				    	</Input>
  				    	<Input type="textarea" label="Description" rows="3" placeholder="Briefly explain your reason" id="chatEndDescription"/>
                <div className="info-description info-row">
                <div className="desc-font" dangerouslySetInnerHTML={{__html:description}}/>
                </div>

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
