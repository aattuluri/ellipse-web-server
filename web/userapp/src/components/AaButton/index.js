import React, { Component } from 'react';

/* component styles */
import { styles } from './styles.scss';

export class AaButton extends Component {
  static propTypes = {
    label: React.PropTypes.string.isRequired
  };

  render() {
    return (
      <div className={`${styles}`}>
        <a className={`aa-btn ${this.props.disable ? 'disable' : ''}`} href={this.props.path} onClick={this.props.onClick} tripID={this.props.tripID}>
          { this.props.label }
        </a>
      </div>
    );
  }
}
