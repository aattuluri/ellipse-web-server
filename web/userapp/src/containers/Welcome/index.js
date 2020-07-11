import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as constants from '../../constants';

import { AaLink } from '../../components/AaLink';
import { SimplePage } from '../../components/SimplePage';

export class Welcome extends Component {

  constructor(props) {
    super(props);
    this.u = this.props.location.query.u;
  }

  componentDidMount() {
    //placeholder
  }

  render () {
    return (
      <SimplePage showLogo="yes" title="Welcome!" heading={"Hello " + ((this.u)? this.u : 'there') + ", Congratulations!"}>
        We are delighted that you have decided to let us help you plan your trips and vacations. Some of the best travel agents who can help you plan your trip will soon be in touch with you.
        You will receive text and email alerts when an agent is ready to talk to you. We look forward to serving you!
        <br/><br/>Thanks & Regards,
        <br/>Team Agent Avery
        <br/><br/><br/>
        <AaLink path="#/login" label="Login" />
      </SimplePage>
    );
  }
}
