var React = require('react');
var moment = require('moment');

var User = require("../../../../models/user").User;
var ModalPopup = require("../../shared/ModalPopup.jsx");
var FBAgentMatcher = require('./FBAgentMatcher.jsx');

var AgentInfo = React.createClass({
  render: function() {
    var agent = this.props;
    return (
      <div className="agent-info-row">
        <span className="agent-info-val small">{agent.firstName}</span>
        <span className="agent-info-val small">{agent.lastName}</span>
        <span className="agent-info-val large">{agent.email}</span>
        {
        (agent.pending)?
          '' : <span className="agent-info-val small">{agent.status}</span>
        }
        <span className="agent-info-val">{agent.destinations}</span>
        <span className="agent-info-val">{agent.specialities}</span>
        <span className="agent-info-val">{agent.dateCreated}</span>
        <span className="agent-info-val">{agent.agreementAcceptedDate}</span>
        {
          (agent.pending)?
          <span className="agent-info-val">
            <a title="View details about the agent"
                data-toggle="modal"
                data-target="#agentDetailsDialog" href="#"
                target="_blank" className="agent-details-btn btn btn-primary"
                data-details={agent.details}>MORE DETAILS</a>
          </span> : ''
        }
        {
          (agent.pending)?
          <span className="agent-info-val small">
            <a className="approve-agent-btn btn btn-primary" data-agentid={agent._id}>APPROVE</a>
          </span> : ''
        }
        {
          (agent.pending)?
          <span className="agent-info-val small">
            <a title="Resend the agent agreement email" className="resend-agent-agreement-email-btn btn btn-primary" data-agentid={agent._id}>REMIND</a>
          </span> : ''
        }
      </div>
    );
  }
});

var ClearChat = React.createClass({
  render: function() {
    return (
      <div className="chat">
        <span><input className="chat-id-input" type="text" placeholder="Chat Id"/></span>
        <span>
            <a className="chat-clear-btn btn btn-primary">CLEAR CHAT</a>
        </span>
      </div>
    );
  }
});

var Home = React.createClass({

  getInitialState: function () {
    return {meta: {
              author: 'Agent Avery, Inc.',
              description: 'Agent Avery - Admin',
              keywords: 'Agent Avery',
            },
            pageTitle: 'Agent Avery - Admin'};
  },

  render: function() {
    //build pending agents list
    var pendingApprovalAgents = this.props.pendingApprovalAgents.map(function(paa) {
      var dateCreated = moment(paa.dateCreated.getTime()).format("MMM Do HH:mm:ss A z");
      var agreementAcceptedDate;
      var details = {};
      var moreDetails = "Hello!";
      if (paa.agreementAcceptedDate) {
        agreementAcceptedDate = moment(paa.agreementAcceptedDate.getTime()).format("MMM Do HH:mm:ss A z");
        details["agreement"] = paa.agreementAcceptedDetails;
      }
      moreDetails = JSON.stringify(details, null, 2);
      return (
          <AgentInfo
              key={'paa-' + paa._id}
              _id={paa._id}
              firstName={paa.firstName}
              lastName={paa.lastName}
              email={paa.email}
              destinations={paa.destinations}
              specialities={paa.specialities}
              status={paa.status}
              dateCreated={dateCreated}
              agreementAcceptedDate={agreementAcceptedDate}
              details={moreDetails}
              pending="true">
          </AgentInfo>
      );
    });
    //build all agents list
    var allAgents = this.props.allAgents.map(function(a) {

      var dateCreated = moment(a.dateCreated.getTime()).format("MMM Do HH:mm:ss A z");
      var agreementAcceptedDate;
      if (a.agreementAcceptedDate) {
        agreementAcceptedDate = moment(a.agreementAcceptedDate.getTime()).format("MMM Do HH:mm:ss A z");
      }

      return (
          <AgentInfo
              key={'aa-' + a._id}
              _id={a._id}
              firstName={a.firstName}
              lastName={a.lastName}
              email={a.email}
              destinations={a.destinations} specialities={a.specialities}
              status={a.status} dateCreated={dateCreated}
              agreementAcceptedDate={agreementAcceptedDate}>
          </AgentInfo>
      );
    });
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8"/>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <meta name="description" content=""/>
          <meta name="keywords" content=""/>
          <meta name="author" content=""/>
          <title>{this.props.pageTitle}</title>
          <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic" rel="stylesheet"/>
          <link href="theme-dashboard/docs/assets/css/toolkit-light.css" rel="stylesheet"/>
          <link href="/css/agent-UI-style.css" rel="stylesheet"/>
          <link href="/css/themify-icons.css" rel="stylesheet"/>
          <link href="/css/parsley.css" rel="stylesheet"/>
          <link href="/css/common.css" rel="stylesheet"/>
          <link href="/css/admin-home.css" rel="stylesheet"/>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
          <script src="/js/parsley.min.js"></script>
          <script src="/js/utils.js"></script>
          <script src="/js/admin-home.js"></script>
          <script src="/js/bootstrap.min.js"></script>
        </head>
      <body>
          <a href="/logout" className="btn btn-danger admin-logout">Logout</a>

          <FBAgentMatcher
              trips={this.props.facebookTrips}
              agents={this.props.allAgents.filter(agent => agent.status === User.STATUS.ACTIVE)}
          />
          <hr className="m-t" />

          <h4>Agents (PENDING APPROVAL)</h4>
          <div className="agent-list">
            <div className="pending-approval-agent-list">
              {pendingApprovalAgents}
            </div>
          </div>
          <br/>
          <hr className="m-t"/>
          <h4>All Agents</h4>
          <div className="agent-list">
            <div className="all-agent-list">
              {allAgents}
            </div>
          </div>
          <br/>
          <hr className="m-t"/>
          <h4>Clear Chat</h4>
          <ClearChat />
          <div id="agentDetailsDialog" className="modal fade" role="dialog">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal">&times;</button>
                  <h4 className="modal-title">Agent details</h4>
                </div>
                <div className="modal-body">

                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
      </body>
      </html>
    );
  }
});

module.exports = Home;
