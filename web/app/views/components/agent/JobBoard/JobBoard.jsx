var React = require('react');
var moment = require('moment');
var Html = require("../../shared/Html.jsx");
var LeftPanel = require("../LeftPanel/LeftPanel.jsx");
var ConfirmationPopup = require("../ConfirmationPopup/ConfirmationPopup.jsx");
var ModalPopup = require("../../shared/ModalPopup.jsx");
var Form = require("../Form/Form.jsx");
var FormField = require("../Form/FormField.jsx");
var Text = require("../Form/Text.jsx");
var Select = require("../Form/Select.jsx");
var TextArea = require("../Form/TextArea.jsx");
var TopNavbar = require('../TopNavbar.jsx');

var JobBoard = React.createClass({

  getInitialState: function() {
    return {name: '', jobs: [], affiliateJobs: []};
  },

  render: function() {
    var content = <div>
        <LeftPanel title={this.props.title} activeTab={this.props.activeTab}
            activeChat={this.props.activeChat} activeClients={this.props.activeClients}/>
        <div className="container">
          <TopNavbar />
          <h1>Job Board</h1>
          <JobSearch />
          <AffiliateJobList affiliateJobs={this.props.affiliateJobs}/>
          <JobList
            jobs={this.props.jobs}
            activeChats={this.props.activeChats}
          />
        </div>
        <ModalPopup id="startChatConfirmationDialog"
          title="Confirm your action" actionClass="start-chat-confirm"
          message="You are about to start the chat with the user."
          actionLabel="Continue">
          <Form id="startChatConfirmationForm">
            <FormField label="Message"
                id="startChatIntro" name="startChatIntro"
                labelClass="col-sm-3" fieldClass="col-sm-8">
                  <TextArea rows="4" cols="30" maxlen="100" id="startChatIntro"
                    name="startChatIntro" className="chat-start-intro"
                    maxlenmsg="Introduction message cannot exceed more than 100 characters."
                    placeholder="Enter your introduction message to the traveler."></TextArea>
            </FormField>
          </Form>
        </ModalPopup>
        {
        <ModalPopup id="declineChatConfirmationDialog"
            title="Decline chat" actionClass="decline-chat-confirm"
            message="This will permanently remove this job from your job list."
            actionLabel="Confirm">
            <Form id="declineChatConfirmationForm">

                <FormField id="chatDeclineReason" label="Reason *"
                    labelClass="col-sm-3" fieldClass="col-sm-8">
                    <Select name="reason" id="chatDeclineReason"
                      className="chat-decline-reason"
                        parsleyErrorMessage="Please select a reason.">
                       <option value="Not a fit for me">Not a fit for me</option>
                       <option value="I am busy">I am busy</option>
                       <option value="I am not working now">I am not working now</option>
                       <option value="Not interested">Not interested</option>
                       <option value="Other">Other</option>
                    </Select>
                </FormField>
                <FormField label="Description"
                  id="chatDeclineDescription" name="description"
                  labelClass="col-sm-3" fieldClass="col-sm-8">
                    <TextArea rows="4" cols="30" maxlen="300" id="chatDeclineDescription"
                      name="description" className="chat-decline-description"
                      maxlenmsg="Description cannot exceed more than 300 characters."
                      placeholder="Briefly explain your reason"></TextArea>
                </FormField>

            </Form>
        </ModalPopup>
        }
        <script src="js/job-main.js"></script>
        <script src="js/fetch-unread-message-count.js"></script>
      </div>;
    return (
        <Html pageTitle={this.props.pageTitle} content={content} />
    );
  }
});

var JobSearch = React.createClass({

    getInitialState: function() {
      return {text: ''};
    },
    handleTextChange: function(e) {
      this.setState({text: e.target.value});
    },

    render: function() {

        return (
          <div className="search">
                 <form className="sidebar-form">
                     <input id="job-search-box" className="form-control" type="text" placeholder="Search..."
                       value={this.state.text}
                       onChange={this.handleTextChange}
                     />
                   <button id="job-search-submit" type="submit" className="btn-link">
                       <span className="icon icon-magnifying-glass"></span>
                     </button>
                 </form>
           </div>
        );
    }
});

var JobItem = React.createClass({
  render: function() {
      return (
          <div className="row job-item">
            <div className="col-md-9">
              <h3>{this.props.userName}
              {/*
              <span className="reccomended"> RECOMMENDED</span>
              */}
              </h3>
              <div className="info"><span className="icon icon-clock"></span>
                    <span className="icon-label">{this.props.dateCreated}</span>
              </div>
              {
                (this.props.website)?
                <div className="info"><span className="icon icon-globe"></span>
                    <span className="icon-label">{this.props.website}</span>
                </div> : ''
              }
              {
                (this.props.origin && this.props.destination)?
                <div className="info"><span className="icon icon-aircraft"></span>
                    <span className="icon-label">{this.props.origin} to {this.props.destination}</span>
                </div> : ''
              }
              {
                (this.props.days)?
                <div className="info"><span className="icon icon-briefcase"></span>
                    <span className="icon-label">{this.props.days} days</span>
                </div> : ''
              }
              {
                (this.props.people)?
                <div className="info"><span className="icon icon-users"></span>
                    <span className="icon-label">{this.props.people} people</span>
                </div> : ''
              }
              {
                (this.props.description)?
                <div className="description"><span className="icon icon-message"></span>
                    <span className="icon-label">{this.props.description}</span>
                </div> : ''
              }
            </div>
            <div>
              {
                (this.props.activeChats)?
                <div className="col-md-3 num-active-chats action-column">
                      <span title={'Currently talking to ' + this.props.activeChats + ' agent'
                          +((this.props.activeChats > 1)? 's' : '')+'.'} className="icon icon-message icon-lg"></span>
                      <span className="icon-label">{this.props.activeChats}</span>
                </div> : ''
              }
              <div className="col-md-3 action-column">
                    <a title="Start chatting with the client"
                        data-toggle="modal"
                        data-target="#startChatConfirmationDialog" href="#"
                        target="_blank" data-chatid={this.props.id}
                        className="btn btn-primary-aa start-chat">START CHAT</a>
              </div>
              <div className="col-md-3 action-column vspace"></div>
              <div className="col-md-3 action-column">
                    <a title="Decline the job" data-toggle="modal"
                        data-target="#declineChatConfirmationDialog" href="#"
                        target="_blank" data-chatid={this.props.id}
                        className="btn btn-primary-outline decline-chat">DECLINE</a>
              </div>
            </div>
          </div>
      );
  }
});

var JobList = React.createClass({
  render: function() {
    var jobItems = this.props.jobs.map(function(job) {
      var dateCreated = moment(job.dateCreated.getTime()).format("MMM Do HH:mm:ss A z");
      return (
        <div className={"job-" + job._id}>
          <JobItem key={job._id} userName={job.userName} origin={job.origin} destination={job.destination} days={job.days}
            people={job.people} description={job.description} id={job._id} dateCreated={dateCreated}
            activeChats={job.activeChats}>
          </JobItem>
          <hr className="m-t"/>
        </div>
      );
    });
    return (
      <div className="job-list">
          {jobItems}
      </div>
    );
  }
});

var AffiliateJobList = React.createClass({
  render: function() {
    var jobItems = this.props.affiliateJobs.map(function(job) {
      var dateCreated = moment(job.dateCreated.getTime()).format("MMM Do HH:mm:ss A z");
      return (
        <div className={"job-" + job._id}>
          <JobItem key={job._id} website={job.website} userName={job.userName} id={job._id} dateCreated={dateCreated}
            activeChats={job.activeChats}>
          </JobItem>
          <hr className="m-t"/>
        </div>
      );
    });
    return (
      <div className="job-list">
          {jobItems}
      </div>
    );
  }
});

module.exports = JobBoard;
