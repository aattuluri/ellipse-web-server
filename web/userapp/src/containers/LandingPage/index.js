 import React, { Component } from 'react';
 import $ from 'jquery';


/* component styles */
import { styles } from './styles.scss';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as constants from '../../constants';
import * as CommonUtils from '../../utils/CommonUtils';

import { Header } from '../../components/Header';
import { AaLink } from '../../components/AaLink';
import { AaButton } from '../../components/AaButton';
import { InfoPopup } from '../../components/InfoPopup';

export class LandingPage extends Component {

  constructor(props) {
    super(props);
    this.letsGetStarted.bind(this);
  }

  componentDidMount() {
    var source = CommonUtils.getParameterByName('s');
    ga('send', 'event', 'PageView', 'LandingPage', source);
  }

  letsGetStarted (event) {
    var sourceParam = "";
    var source = CommonUtils.getParameterByName('s');
    if (source) {
      sourceParam = "?s=" + source;
    }
    ga('send', 'event', 'ButtonClick', 'LetsGetStarted', source);
    window.location = "/userapp" + sourceParam + "#/signup";
  }

  clickHandler (i, props) {
    console.log('CLICK CLICK');
  }


  render () {
    return (
      <div className={`${styles}`}>
        <Header showLogo="yes" title={constants.TITLE} enableLogin="yes"/>
        <div className="top-section">
          <center>
          <div className="top-background">
          </div>

          <div className="top-bg">
            <div className="heading">Welcome!</div>
            <div className="caption">Customized honeymoon, safari, cruises<br/>and much more in just a few taps!</div>

            <div className="v-space-m"></div>
            <div className="v-space-ssm"></div>
            <AaLink onClick={this.letsGetStarted} label="Let's get started!" />
            <div>or read more below</div>
            <div className="v-space-ssssm"></div>
            <i className="nav-icon fa fa-arrow-down"></i>
          </div>
          </center>
        </div>

        <div className="bg-color how-it-works">
          <div className="heading">How it works</div>
          <div className="caption">Customized vacation planning<br/>- as easy as texting a friend!</div>
          <div className="v-space-ssm"></div>
          <div className="how-it-works-img"></div>
        </div>
        <div className="bg-color">
          <div className="icon-container"><span className="feature-icon nav-icon fa fa-paper-plane-o fa-2x"></span></div>
          <div className="bg-color v-space-sssm"></div>
          <div className="features-desc">Don't know where to go? Our travel agents search hotspots ideal for your unforgettable vacation.</div>
        </div>
        <div className="bg-color v-space-ssm"></div>
        <div className="bg-color">
            <div className="icon-container"><span className="feature-icon nav-icon fa fa-user fa-2x"></span></div>
            <div className="bg-color v-space-sssm"></div>
            <div className="features-desc">Our global network of travel consultants can arrange all aspects of your trip. From A to Z.</div>
        </div>
        <div className="bg-color v-space-ssm"></div>
        <div className="bg-color">
            <div className="icon-container"><span className="feature-icon nav-icon fa fa-crosshairs fa-2x"></span></div>
            <div className="bg-color v-space-sssm"></div>
            <div className="features-desc">We keep our finger on the pulse of all the hotspots so that you can stop taking generic trips. Be different!</div>
        </div>
        <div className="bg-color v-space-ssm"></div>
        <div className="bg-color">
            <div className="icon-container"><span className="feature-icon nav-icon fa fa-dollar fa-2x"></span></div>
            <div className="bg-color v-space-sssm"></div>
            <div className="features-desc">We get you the most bang for your buck. We do the time-consuming price comparison for you. </div>
        </div>
        <div className="bg-color v-space-ssm"></div>
        <div className="bg-color">
          <AaButton onClick={this.letsGetStarted} label="Let's get started!" />
          <div className="v-space-ssm"></div>
          <AaLink path="/agent-signup" label="Agent Signup" />
          <div className="v-space-ssm"></div>
        </div>
      </div>
    );
  }
}
