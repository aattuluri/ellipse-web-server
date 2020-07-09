import React, { Component } from 'react';

/* component styles */
import { styles } from './styles.scss';
import request from 'superagent';

import * as constants from '../../constants';
import * as CommonUtils from '../../utils/CommonUtils';

import { Header } from '../../components/Header';
import { AaButton } from '../../components/AaButton';

export class SignUp extends Component {


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
           window.location = constants.ABS_ROUTE_WELCOME + '?u=' + $('#firstName').val();
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
              required data-parsley-trigger="blur" data-parsley-error-message="Enter your full name"
              placeholder="* Full name"></input><br/>
            {
            /*
            <input className="login-input" name= "lastName" id="firstName" type="text"
              required data-parsley-trigger="blur" data-parsley-error-message="Enter your Lastname"
              placeholder="* Lastname"></input><br/>
            */
            }
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
              data-parsley-trigger="blur" data-parsley-error-message="Enter a mobile number"
              data-parsley-pattern={phoneNumberRegexPattern}
              data-parsley-pattern-message="Please enter a US phone number with no spaces"
              placeholder="5558901234 (Optional for text alerts)"></input><br/>
            {/*
            <input className="login-input" name= "city" id="city" type="text"
              required data-parsley-trigger="blur" data-parsley-error-message="Enter a city name"
              placeholder="* Where are you from? Ex: San Diego"></input><br/>
            <input className="login-input" name= "destination" id="destination" type="text"
              required data-parsley-trigger="blur" data-parsley-error-message="Enter a destination"
              placeholder="* Where do you want to go? Ex: Carribean"></input><br/>
            <input className="login-input" name= "occasion" id="occasion" type="text"
              placeholder="What's the occasion?"></input><br/>
            */
            }
            <textarea className="login-input" name= "tripDetails" id="tripDetails"
              rows="4" required data-parsley-trigger="blur" data-parsley-error-message="Please provide some trip details"
              placeholder="* Tell us about your trip!                                     Ex: My wife & I are going to Rome from May 1 to May 9. From NYC. Budget of $4,000."></textarea><br/>
            <AaButton onClick={this.aaSignup} label="Finish up!"/>
          </form>
        </div>
      </div>
    );
  }
}
