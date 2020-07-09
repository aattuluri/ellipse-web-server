import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { Modal } from 'react-bootstrap';
import { Popover } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { OverlayTrigger } from 'react-bootstrap';
import { OverlayMixin } from 'react-bootstrap';

import request from 'superagent';
import * as constants from '../../constants';

import { AaButton } from '../../components/AaButton';

/* component styles */
import { styles } from './styles.scss';


export class AuthCheck extends Component {

  constructor(props) {
    super(props);
    this.state = {
        showModal: false
    };
    this.openMe.bind(this);
    this.closeMe.bind(this);
    this.check.bind(this);
  }

  getInitialState() {
    return {
      showModal: false
    };
  }

  openMe = () => {
    window.location = constants.ABS_ROUTE_LOGIN;
  }

  closeMe = () => {
  	this.setState({
      showModal: false
    });
  }

  componentDidMount  = () => {
    this.check();
    this.timer = setInterval(this.check, 15000);
  }

  componentWillUnmount  = () => {
    clearInterval(this.timer);
  }

  check  = () => {
    var authThis = this;
    request
        .get('/wassup')
        .withCredentials()
        .end((err, res={}) => {
          if (!err) {
            let s = res.text;
            if (s == 1) {
              authThis.setState({
                showModal: true
              });
            }
          } else {
            console.log(err, res);
          }
        });
  }

  render() {
    return (
      <div>
        <div className="session-expired-popup">
          <Modal
            show={this.state.showModal}
            onHide={this.closeMe} keyboard="false" backdrop="static">
            <Modal.Header>
              <Modal.Title
              className="session-expired-header">Session expired</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="close-container">
                <p>Your session has expired. Please login to continue.</p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div className="close-container">
                <AaButton
                  className="aa-btn submit-btn"
                  onClick={this.openMe}
                  label="LOGIN"/>
              </div>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    );
  }
}
