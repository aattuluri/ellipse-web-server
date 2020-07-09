var React = require('react');
var SessionExpired = require('./SessionExpired.jsx');

var Html = React.createClass({

  getInitialState: function () {
    return {meta: {
              author: 'AgentAvery, Inc.',
              description: 'Customized vacation planning - as easy as texting a friend.',
              keywords: 'AgentAvery, Agent Avery, plan a trip, plan my trip, customized vacation planning, honeymoon planning, cruise booking, activity planning',
            },
            pageTitle: 'AgentAvery'};
  },

  render: function() {

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
          <link href="css/agent-UI-style.css" rel="stylesheet"/>
          <link href="css/themify-icons.css" rel="stylesheet"/>
          <link href="css/parsley.css" rel="stylesheet"/>
          <link href="css/common.css" rel="stylesheet"/>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
          <script src="js/bootstrap.min.js"></script>
          <script src="js/parsley.min.js"></script>
          <script src="js/utils.js"></script>
          <script type="text/javascript" src="/js/session-expired.js"></script>
          {
          /*
          <link href="css/pace.css" rel="stylesheet"/>

          <script src="https://cdnjs.cloudflare.com/ajax/libs/pace/1.0.2/pace.min.js"></script>
          */
          }
        </head>
      <body onload='init()'>
          <div>
          {this.props.content}
          <SessionExpired />
          </div>
          <div id="target"></div>
      </body>
      </html>
    );
  }
});

module.exports = Html;
