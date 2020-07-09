import React, { Component } from 'react';

/* component styles */
import { styles } from './styles.scss';
import request from 'superagent';

import * as constants from '../../constants';
import * as CommonUtils from '../../utils/CommonUtils';

import { Header } from '../../components/Header';
import { AaButton } from '../../components/AaButton';

export class ShortSignUp extends Component {


  constructor(props) {
    super(props);
    this.aaSignup.bind(this);
    this.state = {

    };
  }

  componentDidMount() {
    $('#aaSignupForm').parsley();
  }

  aaSignup (event) {
     event.preventDefault();
     event.stopPropagation();
     var isFormValid = $('#aaSignupForm').parsley().isValid({force: true});
     if (!isFormValid) {
       $('#aaSignupForm').parsley().validate({force: true});
       return;
     }
     var signupThis = this;
     request
       .post(constants.AA_SIGNUP)
       .send($("#aaSignupForm").serialize())
       .set('Accept', 'application/json')
       .end(function(err, res) {
         if (err || !res.ok) {
           signupThis.setState ({error: constants.SIGNUP_ERR_MSG});
         } else {
           //redirect to login
           var source = CommonUtils.getParameterByName ('s');
           ga('send', 'event', 'NewUserRegistered', 'Traveler', source);
           window.location = constants.ABS_ROUTE_WELCOME;
         }
       });
  }

  render () {
    var phoneNumberRegexPattern = "\\+?[1-9]\\d{1,14}";
    return (
      <div className={`${styles}`}>
        <Header back="/" title="Let's get started!" showLogo="true" enableLogin="yes"/>
        { (this.props.error)? <div className="error-msg">{this.props.error}</div> : ''}
        <div className="signup text-center">
          <form id="aaSignupForm">
            <input className="login-input" name= "firstName" id="firstName" type="text"
              required data-parsley-trigger="blur" data-parsley-error-message="Enter your Firstname"
              placeholder="* Firstname"></input><br/>
            <input className="login-input" name= "lastName" id="firstName" type="text"
              required data-parsley-trigger="blur" data-parsley-error-message="Enter your Lastname"
              placeholder="* Lastname"></input><br/>
            <input className="login-input" name= "email" id="email" type="email"
              data-parsley-type="email" data-parsley-trigger="change"
              data-parsley-remote="/email-not-duplicate"
              data-parsley-remote-options='{ "type": "get", "data" : { "email": function() {return $("#email").val(); } }}'
              data-parsley-remote-message="Email already used"
              required placeholder="* Email"></input><br/>
            <input className="login-input" name= "password" id="password" type="password"
              required data-parsley-trigger="blur" data-parsley-error-message="Enter a password"
              placeholder="* Password"></input><br/>
            <input className="login-input" name= "mobileNumber" id="mobile" type="text"
              required data-parsley-trigger="blur" data-parsley-error-message="Enter a mobile number"
              data-parsley-pattern={phoneNumberRegexPattern}
              data-parsley-pattern-message="Please enter a valid phone number"
              data-parsley-trigger="blur" placeholder="* Mobile number, Ex: +15555555555"></input>
            <AaButton onClick={this.aaSignup} label="Finish up!"/>
          </form>
        </div>
      </div>
    );
  }
}
