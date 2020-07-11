import React, { Component } from 'react';
import request from 'superagent';
import * as constants from '../../constants';
import { setCookie } from '../../utils/CommonUtils';
import { AaButton } from '../../components/AaButton';
import { Header } from './Header';
import { ChatError, getAjaxError } from './ChatError';

export class GetStarted extends Component {
  state = {
    error: null,
    disable: false
  }
  constructor(props) {
    super(props);
  }

  getStarted = (ev) => {
    this.setState({disable: true});
    let userInfo = {
      email: this.refs.email.value,
      firstName: this.refs.firstname.value,
      lastName: this.refs.lastname.value
    }

    let error = this.validate(userInfo);
    if (error) {
      this.setState({disable: false});
      return;
    }

    request
    .put(constants.SERVER_URL + '/p/user')
    .set('apikey', this.props.apiKey)
    .send(userInfo)
    .end((err, res={}) => {
      this.setState({disable: false});
      const { body } = res;
      if (err || !res.ok) {
        let error = getAjaxError(err, body);
        this.setState({ error: error });
        return;
      }
      this.setState({ error: null });
      // Set cookies for chat info.
      setCookie('chatInfo', JSON.stringify(Object.assign(body, userInfo)), 30*24);
      this.props.start(body.chatId, true);
    })

    if (ev) {
      ev.preventDefault();
    }
  };

  validate(user) {
    let error = null;
    if (!user.email || !user.firstName || !user.lastName) {
      error = 'Please input valid info...';
    } else if (!/^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(user.email)) {
      error = 'Invalid email address';
    }

    this.setState({
      error: error
    });
    return error;
  }

  render () {
    return (
      <div className="chat-container get-started text-center">
        <Header title="Get Started" showLogo="true" action={this.props.action}/>
        <div className='get-started-inner'>
          <ChatError error={this.state.error} />
          <form id="aaStartForm">
            <input className="login-input" name= "email" id="email" type="email" ref="email" placeholder="Email" />
            <br/>
            <input className="login-input" name= "firstname" id="firstname" type="text" ref="firstname" placeholder="Firstname" />
            <br/>
            <input className="login-input" name= "lastname" id="lastname" type="text" ref="lastname" placeholder="Lastname" />
          </form>
          <AaButton onClick={this.getStarted.bind(this)} label="Start" disable={this.state.disable}/>
        </div>
      </div>
    )
  }
}
