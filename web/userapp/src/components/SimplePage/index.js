import React, { Component } from 'react';

/* component styles */
import { styles } from './styles.scss';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as constants from '../../constants';

import { Header } from '../Header';

export class SimplePage extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    //placeholder
  }

  render () {
    return (
      <div className={`${styles}`}>
        <Header showLogo={this.props.showLogo} title={this.props.title}/>
        <div className="top-section">
          <center>
            <div className="top-background">
            </div>
            <div className="top-bg">
              <div className="heading">{this.props.heading}</div>
              <div className="v-space-ssssm"></div>
              <div className="caption">
                <div className="v-space-sssm"></div>
                {this.props.children}
              </div>
            </div>
          </center>
        </div>
      </div>
    );
  }
}
