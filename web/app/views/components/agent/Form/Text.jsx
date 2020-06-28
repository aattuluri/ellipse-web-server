var React = require('react');

var Text = React.createClass({

  render: function() {
    return(
      <div>
        <input name={this.props.name} type="text" className={"form-control " + this.props.class}
              id={this.props.id} data-parsley-pattern={this.props.parsleyRegex}
              data-parsley-pattern-message={this.props.parsleyRegexMessage}
              data-parsley-trigger={this.props.parsleyTrigger} placeholder={his.props.placeholder} />
      </div>
    );
  }
});

module.exports = Text;
