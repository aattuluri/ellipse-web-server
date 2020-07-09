import React, { Component } from 'react';

import * as constants from '../../constants';

/* global styles for app */
import './styles/app.scss';

/* application components */
import { Header } from 'components/Header';

export class App extends Component {
  static propTypes = {
    children: React.PropTypes.any,
  };

  render() {
    return (
      <section>
        <Header />
        {this.props.children}
      </section>
    );
  }
}
