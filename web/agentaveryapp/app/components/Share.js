import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ShareActions from '../actions/share';
import moment from 'moment';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import Geosuggest from 'react-geosuggest';
import dateRangePickerStyles from '../css/daterangepicker.css';
import geosuggestStyles from '../css/geosuggest.css';
import shareSyles from '../css/share.css';
import FBshare from './FBshare';

const defaultInputValue = "Type your comments here."
const defaultDateRange = "Select your trip date"
const averyDefaultMessage = "AgentAvery.com | This trip has been booked via Agent Avery.\n\n\n Book your trips on your own or with human assistance on Facebook Messenger - as easy as texting a friend.";

export class Share extends Component {
  constructor() {
    super();
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleSelectCity = this.handleSelectCity.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.formValidation = this.formValidation.bind(this);
  }

  componentDidMount() {
    var tripid = null;
    if ( this.props.params )
      tripid = this.props.params.tripid;
    else if ( this.props.location && this.props.location.query )
      tripid = this.props.location.query.tripid;
    if ( tripid ) {
      this.props.getAgent(tripid);
    }
  }

  formValidation() {
    var formValid = true;
    var msg = "";
    if ( this.props.share.start == "Select your trip date" ){
        document.getElementById('dateRange').style.borderColor = "red";
        msg += "Missing trip dates, ";
        formValid = false;
    }else{
        document.getElementById('dateRange').style.borderColor = "green";
    }

    if ( this.props.share.destination == "Search Places" ){
        msg += "Missing destination, "
        document.getElementById('destination').style.borderColor = "red";
        formValid = false;
    }else{
        document.getElementById('destination').style.borderColor = "green";
    }

    var element=document.getElementById('comments').value;
    if(element == "" || element == defaultInputValue ){
        document.getElementById('comments').style.borderColor = "red";
        msg += "Missing comments, "
        formValid = false;
    }else{
        document.getElementById('comments').style.borderColor = "green";
    }
    if ( !formValid )
      alert(msg);

    return formValid;
  }

  handleDateChange(event, picker) {
    var start = picker.startDate.format('LL');
    var end = picker.endDate.format('LL');
    this.props.updateDate(start, end);
  }

  handleSelectCity(suggest) {
    this.props.updateDestination(suggest.label);
    this.props.getPlaceDetail(suggest.placeId);
  }

  handleInputFocus(event) {
    var text = event.target;
    if ( text.value == defaultInputValue )
      text.value = "";
    }

  handleInputChange(event) {
    this.props.updateForm(event);
  }

render() {
  var dateRange = this.props.share.start + " - " + this.props.share.end + "    ";
  return (
    <div>
      <link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/bootstrap.daterangepicker/2/daterangepicker.css" />

      <div className="row section-txt1">
        <div className="col-xs-10 col-xs-offset-1 col-sm-6 col-sm-offset-3">
            <p className="section-txt2">Share your Itinerary.</p>
            <div className="about-text">

            <DateRangePicker autoApply={true} onApply={this.handleDateChange}
              startDate={moment('8/13/2016')} endDate={moment('9/23/2016')}
             >
                <button id="dateRange" className="btn btn-primary btn-block dropdown-toggle" size="45" type="button"  >
                  { dateRange }
                  <span className="caret"></span>
                </button>
            </DateRangePicker>
            <br />

            <img width="400" src={ this.props.share.picture } />
            <br /><br />

            <Geosuggest
              id="destination"
              types={["(cities)"]}
              onSuggestSelect={ this.handleSelectCity }
              placeholder={ this.props.share.destination }
            />

            <br />
            <textarea
              rows="6" cols="48"
              id="comments"
              name="comments"
              onChange={ this.handleInputChange }
              onFocus={ this.handleInputFocus }
              defaultValue={ defaultInputValue }
            />
            <br />

            <FBshare
              formValidation={ this.formValidation }
              start={ this.props.share.start }
              end={ this.props.share.end }
              message={ "Check out this trip that I booked with Agent Avery!\n" + this.props.share.data.comments }
              picture={ this.props.share.picture }
              title={ "Agent Avery | Trip to " + this.props.share.destination + " in " + this.props.share.start }
              description={ averyDefaultMessage }
              caption={ 'A trip to ' + this.props.share.destination }
              link={ "https://agentavery.com/profile/" + this.props.share.agentId }
              />

            </div>

        </div>
      </div>
      <br /><br /><br />
    </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
	console.dir(dispatch);
	return bindActionCreators(ShareActions, dispatch)
}

function mapStateToProps(state) {
	console.dir( state.share)
	return {
		share: state.share
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Share)
