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

import { AaLink } from '../../components/AaLink';
import { AaButton } from '../../components/AaButton';

/* component styles */
import { styles } from './styles.scss';

const ItemizedFee = React.createClass({
  render() {
    var feeInfo = this.props.info;
    var amount = feeInfo.amount;
    var amountStr = "" + amount;
    var content;
    if (amountStr && amountStr != "0.00" &&
        amountStr != "0.0" && amountStr != "0") {
      content =
        <div>
          <tr>
            <td className="info-row info-title">{feeInfo.title}</td>
            <td>${amount}</td>
            <td>&nbsp;</td>
          </tr>
        </div>;
    }
    return (
      <div>
        {content}
      </div>
    )
  }
})

const HourlyFee = React.createClass({
  render() {
    var feeInfo = this.props.info;
    var amount = feeInfo.hourlyFee;

    var hours = "hours";
    if (feeInfo.hours == 1) {
      hours = "hour";
    }
    var amountStr = "" + amount;
    var content;
    if (amountStr && amountStr != "0.00" &&
        amountStr != "0.0" && amountStr != "0") {
      content =
        <div>
          <tr>
            <td className="info-row info-title">{feeInfo.title}</td>
            <td>${amount}</td>
            <td>per hour</td>
          </tr>

          <tr >
            <td>&nbsp;</td>
            <td>{feeInfo.hours}</td>
            <td>{hours}</td>
          </tr>
        </div>;
    }
    return (
      <div className="info-fee">
        {content}
      </div>
      )
  }
})

const ItemizedList = React.createClass({

  // checks to see if component should re-render
  shouldComponentUpdate: function(nextProps, nextState) {
    return (!!nextProps.list);
  },

  render() {
    var list = this.props.list;
    var returnList = [];
    var other;
    for (var i = 0; i < list.length; i++) {
      if (list[i].title == "Hourly Fee") {
        returnList.push(
          <HourlyFee info={list[i]}/>
        );
      } else if (list[i].title == "Other") {
        other = list[i];
      } else {
        returnList.push(
          <ItemizedFee info={list[i]}/>
        )
      }
    }

    if (!!other) {
      returnList.push(
      <ItemizedFee info={other}/>
      )
    };

    return (
      <div>
        <table className="info-body">
          {returnList}
        </table>
      </div>
    )
  }
})


export const InfoPopup = React.createClass({

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
    request
        .get('/trippayment/' + this.props.title)
        .withCredentials()
        .end((err, res={}) => {
          if (!err) {
            let trippayment = JSON.parse(res.text).trippayment;
            this.setState({
              showModal: true,
              data: trippayment
            });

          } else {
            //TBD: show error?
            console.log(err, res);
          }
        });
  },

  closeMe() {
  	this.setState({
      showModal: false,
      data: {}
    });
  },

  render() {
    var feeList = this.state.data.itemization;
    var feeType = 'Fee';
    if (this.state.data.type === 0) {
      feeType = 'Service Fee'
    } else if (this.state.data.type === 1) {
      feeType = 'Trip Fee'
    }
    var description = this.linkify(this.state.data.description);
    var total = this.state.data.amount;

    return (
      <div>
        <div>
          <AaLink
            label="View"
            onClick={this.openMe}/>
        </div>

        <div className="info-popup">
          <Modal
            show={this.state.showModal}
            onHide={this.closeMe}>
            <Modal.Header closeButton>
              <Modal.Title
              className="fee-header"
              >{feeType}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ItemizedList list={feeList} modal={this.state.showModal}/>
              <div className="info-description info-row">
              <div className="desc-font" dangerouslySetInnerHTML={{__html:description}}/>
              </div>

              <div className="close-container">
                <p className="info-total">Total: ${total}</p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div className="close-container">
                <AaButton
                  className="close-btn"
                  onClick={this.closeMe}
                  label="CLOSE"
                />
              </div>
            </Modal.Footer>
          </Modal>

        </div>
      </div>
    );
  }
});
