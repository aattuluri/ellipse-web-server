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

export class ForgotPassword extends Component {


  constructor(props) {
    super(props);
    this.resetPassword.bind(this);
    this.state = {

    };
  }

  componentDidMount() {
    $('#passwordResetForm').parsley();
  }

  resetPassword = (event) => {
     event.preventDefault();
     event.stopPropagation();
     var isFormValid = $('#passwordResetForm').parsley().isValid({force: true});
     if (!isFormValid) {
       $('#passwordResetForm').parsley().validate({force: true});
       return;
     }
     var prThis = this;
     request
       .post(constants.FORGOT_PASSWORD)
       .send($("#passwordResetForm").serialize())
       .set('Accept', 'application/json')
       .end(function(err, res) {
         var error;
         if (err || !res.ok) {
           error = constants.FORGOT_PASSWORD_ERR_MSG;
         } else {
           if (!res.body.success) {
             error = (!res.body.message)? constants.FORGOT_PASSWORD_ERR_MSG : res.body.message;
           }
         }
         if (!error) {
           prThis.setState({success: true});
         } else {
           prThis.setState({error: error});
         }
       });
  };

  render () {
    return (
      <div className={`${styles}`}>
        <Header back={constants.ABS_ROUTE_LOGIN} title="Forgot Password" showLogo="true"/>
        <div className="login text-center">
          { (this.state.success)?
            <div className="login-info">Instructions have been emailed to you to help you reset your password.</div> :
            <div>
              <div className="login-info">Please provide the email address you used for sign up</div>
              <br/>
              <form id="passwordResetForm">
                <input className="login-input" name= "email" id="email" type="email"
                    required data-parsley-trigger="blur" data-parsley-error-message="Not a valid email."
                      placeholder="Email"></input>
              </form>
            </div>
          }
          { (this.state.error)? <div className="error-msg">{this.state.error}</div> : ''}
          <br/>

          {
            (this.state.success)?
            <AaLink path={constants.ABS_ROUTE_LOGIN} label="Login"/> :
            <AaButton onClick={this.resetPassword} label="Submit"/>
          }
        </div>
      </div>
    );
  }
}
