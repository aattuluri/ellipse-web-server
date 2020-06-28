var React = require('react');

var Select = React.createClass({

  render: function() {
    return(
      <div>
        <select name={this.props.name} className={"form-control " + this.props.class}
              data-parsley-error-message={this.props.parsleyErrorMessage} id={this.props.id}
              size={this.props.size} required={this.props.required}>
           {this.props.children}
        </select>
      </div>
    );
  }
});

module.exports = Select;
