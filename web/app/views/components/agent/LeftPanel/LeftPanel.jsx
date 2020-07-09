var React = require('react');

var LeftPanel = React.createClass({

  getInitialState: function() {
    return {title: '', activeClients: []};
  },

  render: function() {

    return(
      <div className="with-iconav">
        <nav className="iconav">
          <a className="iconav-brand" href="/home">
            <span><img src="img/logo-small.png" width="30px"/></span><span className="logo-txt">{this.props.title}</span>
          </a>
          <div className="iconav-slider">
            <ul className="nav nav-pills iconav-nav">
              <li className={(this.props.activeTab == 'home')? 'active' : ''} >
                <a href="/home" >
                  <span className="ti-world"></span>
                  <span className="nav-label">Job Board</span>
                </a>
              </li>
              <li className={(this.props.activeTab == 'pastclients')? 'active' : ''}>
                <a href="" >
                <span className="ti-folder"></span>
                  <span className="nav-label">Past Clients</span>
                </a>
              </li>
              <li className={(this.props.activeTab == 'account')? 'active' : ''}>
                <a href="/account" >
                <span className="ti-user"></span>
                  <span className="nav-label">My Account</span>
                </a>
              </li>

            </ul>
          </div>
          <ActiveClientList activeChat={this.props.activeChat} activeClients={this.props.activeClients} />
        </nav>
      </div>
    )
  }
});

var ActiveClient = React.createClass({
  render: function() {
      var notification;
      if (this.props.notifications) {
          notification = <span className="notification"> {this.props.notifications} </span>;
      }
      return (
        <li className={(this.props.activeChat == this.props.id)? 'active' : ''}><a href={"/chat?id=" + this.props.id}> <span> {this.props.userName} </span>{notification}</a></li>
      );
  }
});

var ActiveClientList = React.createClass({
  render: function() {
    var activeChat = this.props.activeChat;
    var activeClientList = this.props.activeClients.map(function(activeClient, i) {
      return (
        <ActiveClient key={i} activeChat={activeChat} id={activeClient._id} userName={activeClient.userName} notifications={activeClient.notifications} />
      );
    });
    return (
      <div className="active-clients">
        <ul className="nav nav-pills nav-stacked">
            <li className="nav-header">ACTIVE CLIENTS</li>
            {activeClientList}
        </ul>
      </div>
    );
  }
});

module.exports = LeftPanel;
