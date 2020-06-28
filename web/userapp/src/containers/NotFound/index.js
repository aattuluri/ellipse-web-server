import React, { Component } from 'react';

/* component styles */
import { styles } from './styles.scss';
import * as constants from '../../constants';
import { Header } from '../../components/Header';

export class NotFound extends Component {

  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div className={`${styles}`}>
        <Header back="#home" title="Not Found"/>
      </div>
    );
  }
}
