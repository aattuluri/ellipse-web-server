var React = require('react');
var Html = require("../../shared/Html.jsx");
var LeftPanel = require("../LeftPanel/LeftPanel.jsx");
var FileUpload = require("../FileUpload/FileUpload.jsx");
var UIUtils = require("../../UIUtils");
var ModalPopup = require("../../shared/ModalPopup.jsx");
var Form = require("../Form/Form.jsx");
var FormField = require("../Form/FormField.jsx");
var Text = require("../Form/Text.jsx");
var Select = require("../Form/Select.jsx");
var TextArea = require("../Form/TextArea.jsx");
var TopNavbar = require('../TopNavbar.jsx');

var decimalValueRegexPattern = "[0-9]?[0-9]?[0-9]?[0-9]?[0-9]?(\.[0-9][0-9]?)?";

var commaSeparatedEmailsPattern = "";

var Chat = React.createClass({

  getInitialState: function () {
    return {title: ''};
  },

  render: function() {
    var trip = this.props.trip;
    var content =
      <div>
        <LeftPanel title={this.props.title} activeTab={this.props.activeTab}
          activeChat={this.props.activeChat} activeClients={this.props.activeClients}/>
        <div className="container">
          <TopNavbar />
          <NewMessageAudioNotification />
          <ChatHeader userName={trip.userName} origin={trip.origin} destination={trip.destination}
            days={trip.days} people={trip.people} status={trip.status}/>
          <ChatMessageList chat={trip.chat}/>
          <Itenerary trip={trip}/>
          { (trip.status == "created" || trip.status == "ended"
              || trip.status == "suspended" || trip.status == "declined")?
            '' :
            <div>
            <ChatBox tripStatus={trip.status}/>
            <ShareItinerary/>
            <FeeOptions/>
            <ServiceFee/>
            <TripFee/>
            <Refund/>
            <FileUpload title="Attach Files" formId="attachment-upload-form"
                panelClass="image-upload-panel" closePanelClass="close-image-upload-panel"
                actionBtnId="upload-image-btn" actionBtnLabel="SEND"/>

            <ModalPopup id="endChatConfirmationDialog"
              title="End chat" actionClass="end-chat-confirm"
              message="You are ending this chat. You can still view this chat. Please contant support in case you need help."
              actionLabel="Confirm">
              <Form id="endChatConfirmationForm">

                  <FormField id="endDeclineReason" label="Reason *"
                      labelClass="col-sm-3" fieldClass="col-sm-8">
                      <Select name="reason" id="chatEndReason"
                        className="chat-end-reason"
                          parsleyErrorMessage="Please select a reason.">
                         <option value="Traveler is not interested">Traveler is not interested</option>
                         <option value="Traveler hasn't responded">Traveler hasn't responded</option>
                         <option value="I cannot book Traveler's trip">I cannot book Traveler's trip</option>
                         <option value="Spam">Spam</option>
                         <option value="Other">Other</option>
                      </Select>
                  </FormField>
                  <FormField label="Description"
                    id="chatEndDescription" name="description"
                    labelClass="col-sm-3" fieldClass="col-sm-8">
                      <TextArea rows="4" cols="30" maxlen="300" id="chatEndDescription"
                        name="description" className="chat-end-description"
                        maxlenmsg="Description cannot exceed more than 300 characters."
                        placeholder="Briefly explain your reason"></TextArea>
                  </FormField>

              </Form>
            </ModalPopup>
            <ModalPopup id="completeChatConfirmationDialog"
              title="Job successfully completed" actionClass="complete-chat-confirm"
              actionLabel="Confirm">
              <div>You are marking this job as successfully completed.<br/>
              This means that you have closed the deal with the traveler.<br/><br/>
              You will still be able to chat with the traveler.</div>
            </ModalPopup>
          </div>
          }
        </div>

        <link href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/4.2.0/min/dropzone.min.css" rel="stylesheet"/>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/cropper/2.3.2/cropper.min.css" rel="stylesheet" />

        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.1/moment.min.js"></script>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.4/socket.io.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/parsley.js/2.2.0/parsley.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/dropzone/4.2.0/min/dropzone.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/cropper/2.3.2/cropper.min.js"></script>
        <script type="text/javascript" src="js/quill.js"></script>
        <script type="text/javascript" src="js/ckeditor.js"></script>
        <script type="text/javascript" src="js/editor.js"></script>
        <script src="js/chat-main.js"></script>
        <script src="js/chat_client.js"></script>
        <script src="js/chat-dropzone.js"></script>
        <script src="js/fetch-unread-message-count.js"></script>
        
      </div>;
    return (
        <Html pageTitle={this.props.pageTitle} rscript="chat.min.js" content={content} />
    );
  }
});

var NewMessageAudioNotification = React.createClass({
  getInitialState: function () {
    return {};
  },
  render: function() {
    return (
      <audio style={{display: 'none'}} id="new-message-notification" preload src="/sounds/new_message.mp3" />
    );
  }
});

var ChatHeader = React.createClass({

  getInitialState: function () {
    return {};
  },

  render: function() {
    var originDestination =
      (this.props.origin)? <span><span className="icon icon-aircraft"></span><span className="icon-label">{
      ((this.props.origin)? 'From ' + this.props.origin : '')
      + ((this.props.destination)? ' to ' + this.props.destination : '')}</span></span> : '';
    var days = <span><span className="icon icon-briefcase"></span><span className="icon-label">{this.props.days} days</span></span>;
    var people = <span><span className="icon icon-briefcase"></span><span className="icon-label">{this.props.people} people</span></span>;
    var jobMarkedSuccesful = (this.props.status == "completed")?
        <div className="row job-item"><span><span className="icon icon-check"></span><span className="icon-label">This job has been completed successfully!</span></span></div> : '';
    return (
      <div className="ChatHeader">
        <div className="ChatHeader-clientInfo">
          <div className="row job-item">
            <h1>{this.props.userName}</h1>
            {originDestination}
            {(this.props.days)? days : ''}
            {(this.props.people)? people : ''}
          </div>
          {jobMarkedSuccesful}
        </div>
        <div className="ChatHeader-itinerary">
            <a title="Create/Edit the itinerary" href="#0" className="cd-btn btn btn-primary-aa">ITINERARY</a>
        </div>
      </div>
    );
  }
});


var ChatMessage = React.createClass({

  getInitialState: function () {
    return {};
  },

  render: function() {
    var chatMessage = this.props.chatMessage;
    var msg = <div className="chat-message">{chatMessage.m}</div>
    if (chatMessage.sf) {
      msg = <div className="chat-message agent-fee">Service Fee:
          <span className="bold"> ${chatMessage.sf} </span>.
          { (chatMessage.sfp)? 'Paid' : '&nbsp;&nbsp;&nbsp;' + <a className="fee-btn" href="">edit</a>}
        </div>;
    }
    else if (chatMessage.tf) {
      msg = <div className="chat-message agent-fee">Trip Fee:
        <span className="bold"> ${chatMessage.tf} </span>.
          { (chatMessage.tfp)? 'Paid' : '&nbsp;&nbsp;&nbsp;' + <a className="fee-btn" href="">edit</a>}
        </div>;
    }
    else if (chatMessage.r) {
      msg = <div className="chat-message agent-fee">Refund:
        <span className="bold"> ${chatMessage.r} </span>.
          { (chatMessage.rc)? 'Completed' : '&nbsp;&nbsp;&nbsp;' + <a className="fee-btn" href="">edit</a>}
        </div>;
    }
    return (
      <div className="chat-item">
        <span><img className="chat-image" src={chatMessage.img}/></span>
        <span className="user-name"> {chatMessage.u} </span>
        <span> {chatMessage.time} </span>
        {msg}
      </div>
    );
  }
});

var ChatMessageList = React.createClass({
  getInitialState: function () {
    return {chat: []};
  },

  render: function() {
    var msgs;
    return (
      <div className="chat">
        {msgs}
      </div>
    );
  }
});

var ChatBox = React.createClass({

    getInitialState: function() {
      return {text: ''};
    },
    _handleTextChange: function(e) {
      this.setState({text: e.target.value});
    },
    _handleKeyPress: function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var text = this.state.text.trim();
        if (!text) {
          return;
        }
        // TODO: Publish the message
        //clear the form
        var msg = {
            timestamp: new Date(),
            html: text
        }
        this.setState({text: ''});
      }
    },
    render: function() {
        return (
          <div>
            <div className="chatbox">
              <div id="typing"></div>
              <div className="flextable">
                <div className="flextable-item flextable-primary">
                  <input id="chatbox" type="text" className="form-control" placeholder="Type a message..."
                    value={this.state.text}
                    onChange={this._handleTextChange} onKeyPress = {this._handleKeyPress}/>
                </div>
                <div className="flextable-item">
                  <div className="btn-group">
                    {
                    /*
                    <button type="button" className="btn btn-primary-outline image-btn">
                      <span className="icon icon-image"></span>
                    </button>
                    */
                    }
                    <button title="Add images and files to the chat" type="button" className="btn btn-primary-outline attachement-btn">
                      <span className="icon icon-attachment"></span>
                    </button>
                    <button title="Create service fee or trip fee" type="button" className="btn btn-primary-outline">
                      <span className="icon icon-credit fee-btn"></span>
                    </button>
                    {
                      (this.props.tripStatus == "completed")? '' : <button id="end-chat" title="End this chat"
                          data-toggle="modal"
                          data-target="#endChatConfirmationDialog"
                          target="_blank" type="button" className="btn btn-primary-outline">
                        <span className="icon icon-circle-with-cross"></span>
                      </button>
                    }
                    {
                      (this.props.tripStatus == "completed")? '' : <button id="complete-chat" title="Mark this job as successful"
                          data-toggle="modal"
                          data-target="#completeChatConfirmationDialog"
                          target="_blank" type="button" className="btn btn-primary-outline">
                        <span className="icon icon-check"></span>
                      </button>
                    }
                  </div>
                </div>
              </div>
              <div className="enable-or-disable-sound-div"><a
                  className="enable-or-disable-sound"></a></div>
            </div>
          </div>
        );
    }
});

var Itenerary = React.createClass({
    render: function() {

        return (
          <div className="cd-panel itenerary-panel from-right">
            <div className="cd-panel-container">
              <div className="cd-panel-content">
               <h1>Itinerary</h1>
              <a href="#0" className="cd-panel-close"><span className="ti-close"></span></a>

              <br/>
              <div id="buildItinerary">
                <div>Build your client's itinerary here.</div>
                <div id="saveStatus" className="aa-success-text"></div>
                <form>
                      <textarea name="itineraryEditor" id="itineraryEditor" rows="100" cols="200"></textarea>
                </form>
                <br/>
                <span><a href="#" id="send-btn" className="cd-btn btn btn-primary-aa">SEND</a></span>
              </div>

              <div id="sentItinerary">
                <h4><span className="icon icon-check success-icon"></span><span>This itinerary has been emailed to your client.</span></h4>
                <br/>
                <span><a href="#" id="edit-btn" className="cd-btn btn btn-primary-aa">EDIT</a></span>
                &nbsp;&nbsp;
                {
                  /*
                  <span><a href="#" id="share-btn" className="cd-btn btn btn-primary-aa"
                  data-toggle="modal" data-target="#shareItineraryModel" data-tripid={this.props.trip._id}
                  data-fromemail={this.props.trip.agentEmail}>SHARE</a></span>
                  */
                }
                <div className="sent-itinerary">
                   <div className="row job-item">
                     <h1>Itinerary for {this.props.trip.userName}</h1>
                      <span className="icon icon-aircraft"></span><span className="icon-label">{this.props.trip.origin} to {this.props.trip.destination}</span>
                      <span className="icon icon-briefcase"></span><span className="icon-label">{this.props.trip.days} days</span>
                      <span className="icon icon-users"></span><span className="icon-label">{this.props.trip.people} people</span>
                      <br/><br/>
                      <div id="showItenerary">{this.props.trip.itenerary}</div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        );
    }
});

var FeeOptions = React.createClass({
    render: function() {

        return (
          <div className="cd-panel fee-options-panel from-right">
            <div className="cd-panel-container">
              <div className="cd-panel-content">
                 <h1>Select the type of Fee</h1>
                 <a href="#0" className="cd-panel-close close-fee-options-panel close-fee-panel"><span className="ti-close"></span></a>
                 <br/>
                 <br/>
                 <div id="feeOptions">
                    <div className="col-sm-4"></div>
                    <div className="col-sm-8">
                      <a id="service-fee-btn" className="cd-btn-fee btn btn-primary-aa">SERVICE FEE</a>
                    </div>
                    <br></br>
                    <div className="col-sm-4"></div>
                    <div className="col-sm-8">
                      <a id="trip-fee-btn" className="cd-btn-fee btn btn-primary-aa">TRIP FEE</a>
                    </div>
                    {
                    /*
                    <br></br>
                    <div className="col-sm-4"> </div>
                    <div className="col-sm-8">
                      <a id="refund-fee-btn" className="cd-btn-fee btn btn-primary-aa">REFUND</a>
                    </div>
                    */
                    }
                 </div>
              </div>
            </div>
          </div>
        );
    }
});

var ServiceFee = React.createClass({

    render: function() {
        return (
          <div className="cd-panel service-fee-panel from-right">
            <div className="cd-panel-container">
              <div className="cd-panel-content">
                 <h1>Service Fee</h1>
                 <a href="#0" className="cd-panel-close close-service-fee-panel close-fee-panel"><span className="ti-close"></span></a>
                 <br/>
                 <div id="serviceFees">
                 <div id="service-fee-notes"></div>
                 <div id="service-fee-server-message" className="bold"></div>
                 <form id="serviceFeeForm" className="form-horizontal sign-up-content">

                  <div className="form-group">
                    <label htmlFor="name" className="col-sm-2 control-label price-field-lbl">One-Time Fee</label>
                    <div className="col-sm-10">
                      <span className="bold">$&nbsp;&nbsp;&nbsp;</span>
                      <input type="text" className="form-control sm-field service-fee-item" id="service-fee-onetime"
                        data-parsley-trigger="blur" data-parsley-pattern={decimalValueRegexPattern}
                        data-parsley-pattern-message="Enter a valid value. Examples: 12, 9.99"
                        placeholder="0.00"/>
                    </div>
                  </div>
                   <div className="form-group">
                    <label htmlFor="name" className="col-sm-2 control-label price-field-lbl">Hourly Fee</label>
                    <div className="col-sm-10">
                      <span className="bold">$&nbsp;&nbsp;&nbsp;</span>
                      <input type="text" className="form-control sm-field service-fee-hourly" id="service-fee-hourly"
                        data-parsley-trigger="blur" data-parsley-pattern={decimalValueRegexPattern}
                        data-parsley-pattern-message="Enter a valid value. Examples: 12, 9.99"
                        placeholder="0.00"/> <span className="bold">&nbsp;&nbsp;&nbsp; per hour</span>
                    </div>
                  </div>
                  <div className="form-group">
                   <label htmlFor="name" className="col-sm-2 control-label"></label>
                   <div className="col-sm-10">
                     <span className="bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                     <input type="text" className="form-control sm-field service-fee-hourly" id="service-fee-hours"
                         data-parsley-trigger="blur" data-parsley-pattern={decimalValueRegexPattern}
                         data-parsley-pattern-message="Enter a valid value. Examples: 1, 2.25"
                         placeholder="0.00"/> <span className="bold">&nbsp;&nbsp;&nbsp; hours</span>
                   </div>
                 </div>
                  <div className="form-group">
                    <label htmlFor="name" className="col-sm-2 control-label price-field-lbl">Other</label>
                    <div className="col-sm-10">
                      <span className="bold">$&nbsp;&nbsp;&nbsp;</span>
                      <input type="text" className="form-control sm-field service-fee-item" id="service-fee-other"
                        data-parsley-trigger="blur" data-parsley-pattern={decimalValueRegexPattern}
                        data-parsley-pattern-message="Enter a valid value. Examples: 12, 9.99"
                        placeholder="0.00"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="description" className="col-sm-2 control-label price-field-lbl">Description</label>
                    <div className="col-sm-10">
                      <textarea id="service-fee-description" className="form-control price-description"
                        data-parsley-trigger="keyup"
                        data-parsley-maxlength="1000" data-parsley-maxlength-message="Description cannot exceed 1000 characters."
                        rows="4" cols="25" name="description" form="usrform">
                     </textarea>
                    </div>
                  </div>
                </form>

                <div className="col-sm-2"> </div>
                <div className="col-sm-10 total">Total: $<span id="service-fee-total" className="service-fee-total">0.00</span><br/>
                <a id="service-fee-submit-btn" className="cd-btn-fee btn btn-primary-aa">SUBMIT</a></div>
                <div className="col-sm-2"> </div>
                <div className="col-sm-10">
                  <a id="service-fee-refund-btn" className="cd-btn-fee btn btn-primary-aa">REFUND THIS FEE</a>
                </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
});

var TripFee = React.createClass({
    render: function() {

        return (
          <div className="cd-panel trip-fee-panel from-right">
            <div className="cd-panel-container">
              <div className="cd-panel-content">
               <h1>Trip Fee</h1>
                <a href="#0" className="cd-panel-close close-trip-fee-panel"><span className="ti-close"></span></a>
                <br/>
                <div id="tripFees">
                <div id="trip-fee-notes"></div>
                <div id="trip-fee-server-message" className="bold"></div>
                <form id="tripFeeForm" className="form-horizontal sign-up-content">
                  <div className="form-group">
                    <label htmlFor="trip-fee-package-total" className="col-sm-2 control-label price-field-lbl">Package Total</label>
                    <div className="col-sm-10">
                      <span className="bold">$&nbsp;&nbsp;&nbsp;</span>
                      <input type="text" className="form-control sm-field trip-fee-item" id="trip-fee-package-total"
                        data-parsley-trigger="blur" data-parsley-pattern={decimalValueRegexPattern}
                        data-parsley-pattern-message="Enter a valid value. Examples: 1200.00, 1999.99"
                        placeholder="0.00"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="trip-fee-flight" className="col-sm-2 control-label price-field-lbl">Flight</label>
                    <div className="col-sm-10">
                      <span className="bold">$&nbsp;&nbsp;&nbsp;</span>
                      <input type="text" className="form-control sm-field trip-fee-item" id="trip-fee-flight"
                        data-parsley-trigger="blur" data-parsley-pattern={decimalValueRegexPattern}
                        data-parsley-pattern-message="Enter a valid value. Examples: 12, 9.99"
                        placeholder="0.00"/>
                    </div>
                  </div>
                   <div className="form-group">
                    <label htmlFor="trip-fee-hotel" className="col-sm-2 control-label price-field-lbl">Hotel</label>
                    <div className="col-sm-10">
                      <span className="bold">$&nbsp;&nbsp;&nbsp;</span>
                      <input type="text" className="form-control sm-field trip-fee-item" id="trip-fee-hotel"
                        data-parsley-trigger="blur" data-parsley-pattern={decimalValueRegexPattern}
                        data-parsley-pattern-message="Enter a valid value. Examples: 12, 9.99"
                        placeholder="0.00"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="trip-fee-rental-car" className="col-sm-2 control-label price-field-lbl">Rental Car</label>
                    <div className="col-sm-10">
                      <span className="bold">$&nbsp;&nbsp;&nbsp;</span>
                      <input type="text" className="form-control sm-field trip-fee-item" id="trip-fee-rental-car"
                        data-parsley-trigger="blur" data-parsley-pattern={decimalValueRegexPattern}
                        data-parsley-pattern-message="Enter a valid value. Examples: 12, 9.99"
                        placeholder="0.00"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="trip-fee-activities" className="col-sm-2 control-label price-field-lbl">Activities</label>
                    <div className="col-sm-10">
                      <span className="bold">$&nbsp;&nbsp;&nbsp;</span>
                      <input type="text" className="form-control sm-field trip-fee-item" id="trip-fee-activities"
                        data-parsley-trigger="blur" data-parsley-pattern={decimalValueRegexPattern}
                        data-parsley-pattern-message="Enter a valid value. Examples: 12, 9.99"
                        placeholder="0.00"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="trip-fee-others" className="col-sm-2 control-label price-field-lbl">Others</label>
                    <div className="col-sm-10">
                      <span className="bold">$&nbsp;&nbsp;&nbsp;</span>
                      <input type="text" className="form-control sm-field trip-fee-item" id="trip-fee-others"
                        data-parsley-trigger="blur" data-parsley-pattern={decimalValueRegexPattern}
                        data-parsley-pattern-message="Enter a valid value. Examples: 12, 9.99"
                        placeholder="0.00"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="description" className="col-sm-2 control-label price-field-lbl">Description</label>
                    <div className="col-sm-10">
                      <textarea id="trip-fee-description" className="form-control price-description"
                        data-parsley-trigger="keyup"
                        data-parsley-maxlength="1000" data-parsley-maxlength-message="Description cannot exceed 1000 characters."
                        rows="4" cols="25" name="description" form="usrform">
                     </textarea>
                    </div>
                  </div>
                </form>
                <div className="col-sm-2"> </div>
                <div className="col-sm-10 total">Total: $<span id="trip-fee-total" className="trip-fee-total">0.00</span><br/>
                  <a id="trip-fee-submit-btn" className="cd-btn-fee btn btn-primary-aa">SUBMIT</a>
                </div>
                <div className="col-sm-2"> </div>
                <div className="col-sm-10">
                  <a id="trip-fee-refund-btn" className="cd-btn-fee btn btn-primary-aa">REFUND THIS FEE</a>
                </div>
              </div>
            </div>
          </div>
         </div>
        );
    }
});

var ShareItinerary = React.createClass({
  render: function() {
     return (
       <div className="cd-panel itenerary-share-panel from-right">
         <div className="cd-panel-container">
           <div className="cd-panel-content">
            <h1>Share Itinerary</h1>
            <a href="#0" className="cd-panel-close close-itenerary-share-panel"><span className="ti-close"></span></a>
            <br/>
            <div id="shareStatus" className="aa-success-text"></div>
            <div>
              <form className="form-horizontal sign-up-content" id="shareItineraryForm" >
                <div className="form-group">
                  <label htmlFor="itinerary-share-email" className="col-sm-2 control-label">Recipient</label>
                  <div className="col-sm-10">
                    <input name="email" type="email" className="form-control"
                      id="itinerary-share-email" data-parsley-type="email" data-parsley-trigger="blur"
                      placeholder="jonathan@agentvery.com,anil@agentavery.com"
                      required=""/>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="itinerary-share-notes" className="col-sm-2 control-label">Message</label>
                  <div className="col-sm-10">
                    <textarea name="notes" id="itinerary-share-notes" className="form-control"
                      data-parsley-trigger="keyup"
                      data-parsley-maxlength="1000" data-parsley-maxlength-message="Message should be limted to 300 characters."
                      rows="4" cols="25" form="shareItineraryForm">
                   </textarea>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <a id="itenerary-share-submit-btn" className="btn btn-primary-aa">SUBMIT</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var Refund = React.createClass({
    render: function() {
      return (
        <div className="cd-panel refund-panel from-right">
          <div className="cd-panel-container">
            <div className="cd-panel-content">
             <h1>Refund</h1>
              <a href="#0" className="cd-panel-close close-refund-panel"><span className="ti-close"></span></a>
              <br/>
              <div id="refund">
              <form className="form-horizontal sign-up-content">
                <div className="form-group">
                  <label htmlFor="name" className="col-sm-2 control-label price-field-lbl">Flight</label>
                  <div className="col-sm-10">
                    <span className="bold">$&nbsp;&nbsp;&nbsp;</span><input type="text" className="form-control sm-field" id="name" placeholder="0.00"/>
                  </div>
                </div>
                 <div className="form-group">
                  <label htmlFor="name" className="col-sm-2 control-label price-field-lbl">Hotel</label>
                  <div className="col-sm-10">
                    <span className="bold">$&nbsp;&nbsp;&nbsp;</span><input type="text" className="form-control sm-field" id="name" placeholder="0.00"/>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="name" className="col-sm-2 control-label price-field-lbl">Activities</label>
                  <div className="col-sm-10">
                    <span className="bold">$&nbsp;&nbsp;&nbsp;</span><input type="text" className="form-control sm-field" id="name" placeholder="0.00"/>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="name" className="col-sm-2 control-label price-field-lbl">Others</label>
                  <div className="col-sm-10">
                    <span className="bold">$&nbsp;&nbsp;&nbsp;</span><input type="text" className="form-control sm-field" id="name" placeholder="0.00"/>
                  </div>
                </div>
              </form>
              <div className="col-sm-2"> </div>
              <div className="col-sm-10 total">Total: $320.00<br/><br/>
              <a id="refund-fee-submit-btn" className="cd-btn-fee btn btn-primary-aa">SUBMIT</a>
              </div>
            </div>
          </div>
        </div>
       </div>
      );
    }
});

module.exports = Chat;
