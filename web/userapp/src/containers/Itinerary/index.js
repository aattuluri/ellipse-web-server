import React, { Component } from 'react';
import update from 'react-addons-update';

/* component styles */
import { styles } from './styles.scss';

/* components */
import Sidebar from 'react-sidebar';
import { AuthCheck } from '../../components/AuthCheck';
import { Header } from '../../components/Header';

import request from 'superagent';

export class Itinerary extends Component {

  state = {
    docked: false,
    open: false
  };

  constructor(props) {
    super(props);
    this.itineraryId = this.props.routeParams.itineraryId;
    this.state = {
      docked: false,
      open: false,
      itinerary: {__html: ''}
    };
    this.fetchItinerary.bind(this);
    this.fetchItinerary ();
  };

  onSetOpen = (open) => {
    // console.log('THIS: ', this);
    this.setState({
      open: open});
  };

  toggleOpen = (ev) => {
    this.setState({
      open: !this.state.open
    });
    // console.log('THIS STATE SIDEBAR: ', this.state.open);

    if (ev) {
      ev.preventDefault();
    }
  };

  fetchItinerary = () => {
    var fiThis = this;
    request
    .get('/trip/' + this.itineraryId + '/getItinerary')
    .end((err, res={}) => {
      console.log(res);
      const { body } = res;
      if (!body) {
        //TBD: show error
        return;
      }
      if (body.success) {
        fiThis.setState({itinerary: {__html: body.itinerary}});
      } else {
        //TBD: show error
        fiThis.setState({error: 'Failed to fetch the itinerary.'});
      }
    });
  }


  render() {

    var itineraryContainer = <div>
      <div className={`${styles} col-xs-12 col-sm-12 col-md-8 col-lg-6 col-md-offset-2 col-lg-offset-3`}>
        <div className="itineraryDiv" dangerouslySetInnerHTML={this.state.itinerary}/>
      </div>
    </div>;

    let iconStyle = {
      display: 'block',
      color: '#33eebb',
      textAlign: 'center',
      textDecoration: 'none',
      opacity: 1
    };

    let sidebar =
      <div>
        <div className='sidebar-content'>
          <div className='divider'></div><br/>
            <a href={"/userapp#/chat/" + this.itineraryId} style={iconStyle}><i className='fa fa-arrow-left fa-2x'></i></a><br/>
            {
              //TBD:
              //<a style={iconStyle}><i className='fa fa-share fa-2x'></i></a><br/>
            }
        </div>
      </div>

    const sidebarProps = {
      sidebar: sidebar,
      docked: this.state.docked,
      open: this.state.open,
      onSetOpen: this.onSetOpen,
      pullRight: true,
      styles: {sidebar: {top: 75, bottom: 73, backgroundColor: '#212629', opacity: .75, width: 65, textAlign: 'center'}}
    };

    return (
      <Sidebar {...sidebarProps}>
        <AuthCheck />
        <Header title="Itinerary" action={this.toggleOpen} />
        {itineraryContainer}
      </Sidebar>
    );
  }
}
