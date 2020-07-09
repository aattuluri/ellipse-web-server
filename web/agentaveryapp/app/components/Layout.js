// var React = require('react');
var Header = require("./Header");

var Layout = React.createClass({

render: function() {
  return (
    <div>
      <div className="agent-body">
      <Header />
        {this.props.children}
      </div>
    </div>
  )
}

})

module.exports = Layout;
