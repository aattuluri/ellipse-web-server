import React, { Component } from 'react';

/* component styles */
import { styles } from './styles.scss';


export class SocialLoginButton extends Component {
  static propTypes = {
    link: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired
  };

  render() {
    return (
      <div className={`${styles}`}>
        <a href={this.props.link} className={"btn btn-social btn-lg btn-" + this.props.type + " custom-social-btns"}>
          <span className={"fa fa-" + this.props.type}></span>{this.props.label}
        </a>
      </div>
    );
  }
}
