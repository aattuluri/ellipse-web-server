var React = require('react');

var FormField = React.createClass({

  render: function() {
    return(
      <div className="form-group">
        { (this.props.label)?
          <label htmlFor={this.props.id}
            className={"control-label " + this.props.labelClass}>{this.props.label}</label> : ''
        }
        <div className={this.props.fieldClass}>
          { (this.props.tiptext)?
            <p>{this.props.tiptext}</p> : ''
          }
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = FormField;
