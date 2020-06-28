import React, { Component } from 'react';

/* component styles */
import { styles } from './styles.scss';


export class AaLink extends Component {
  static propTypes = {
    label: React.PropTypes.string.isRequired
  };

  render() {
    return (
      <div className={`${styles}`}>
        <a className={`aa-link`} href={this.props.path} onClick={this.props.onClick}>
          { this.props.label }
        </a>
      </div>
    );
  }
}
