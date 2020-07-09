import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as constants from '../../constants';

import { AaLink } from '../../components/AaLink';
import { SimplePage } from '../../components/SimplePage';


export class Verified extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    //redirect to login page
    setTimeout (function () {
      window.location = constants.ABS_ROUTE_LOGIN;
    }, 6000);
  }

  render () {
    return (
      <SimplePage showLogo="yes" title="Verified" heading="You are a verified user!">
        You will be shortly redirected to the login page..
      </SimplePage>
    );
  }
}
