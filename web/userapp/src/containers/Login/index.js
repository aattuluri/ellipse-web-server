import React, { Component } from 'react';

/* component styles */
import { styles } from './styles.scss';
import request from 'superagent';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { sendMesssage } from '../../actions';
import * as constants from '../../constants';

import { Header } from '../../components/Header';
import { AaLink } from '../../components/AaLink';
import { AaButton } from '../../components/AaButton';
import { SocialLoginButton } from '../../components/SocialLoginButton';

export class Login extends Component {


  constructor(props) {
    super(props);
    this.aaLogin.bind(this);
    this.state = {

    };
  }

  componentDidMount() {
    $('#aaLoginForm').parsley();
  }

  aaLogin = (event) => {
     event.preventDefault();
     event.stopPropagation();
     var isFormValid = $('#aaLoginForm').parsley().isValid({force: true});
     if (!isFormValid) {
       $('#aaLoginForm').parsley().validate({force: true});
       return;
     }
     var loginThis = this;
     request
       .post(constants.AA_AUTH)
       .send($("#aaLoginForm").serialize())
       .set('Accept', 'application/json')
       .end(function(err, res) {
         var error;
         if (err || !res.ok) {
           error = constants.LOGIN_ERR_MSG;
         } else {
           if (!res.body.success) {
             error = (!res.body.message)? constants.LOGIN_ERR_MSG : res.body.message;
           }
         }
         if (!error) {
           window.location = constants.ABS_ROUTE_HOME;
         } else {
           loginThis.setState({error: error});
         }
       });
  };

  render () {
    return (
      <div className={`${styles}`}>
        <Header back="/" title="Login" showLogo="true"/>
        <div className="login text-center">
          {
            /*
            <div className="social-btns">
              <SocialLoginButton link={constants.FACEBOOK_AUTH}
                  type="facebook" label="Login with Facebook" />
              <br/>
              <br/>
              <SocialLoginButton link={constants.GOOGLE_AUTH}
                  type="google" label="Login with Google" />
            </div>
            <br/>
            <hr />
            */
          }
          {
            <div>
              <div className="login-header-div"><img className="login-header-logo"></img></div>
              <div className="login-header">Agent Avery</div>
            </div>
          }
          <form id="aaLoginForm">
            <input className="login-input" name= "email" id="email" type="email"
                required data-parsley-trigger="blur" data-parsley-error-message="Not a valid email."
                  placeholder="Email"></input>
            <br/>
            <input className="login-input" name= "password" id="password" type="password"
                required data-parsley-trigger="blur" data-parsley-error-message="Enter a password"
                  placeholder="Password"></input>
          </form>
          <AaLink path={constants.ABS_ROUTE_FORGOT_PASSWORD} label="Forgot password?"/>
          { (this.state.error)? <div className="error-msg">{this.state.error}</div> : ''}
          <br/>
          <AaButton onClick={this.aaLogin} label="Login"/>
          <br/>
          <AaLink path={constants.ABS_ROUTE_SIGNUP} label="New user?"/>
          </div>
      </div>
    );
  }
}
