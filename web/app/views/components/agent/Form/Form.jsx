var React = require('react');

var Form = React.createClass({

  render: function() {
    return (
      <div>
        <form id={this.props.id} method={this.props.method}
            action={this.props.action} className="form-horizontal sign-up-content">
            {this.props.children}
        </form>
      </div>
    );
  }

});

module.exports = Form;
