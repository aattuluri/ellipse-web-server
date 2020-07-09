var React = require('react');

var TextArea = React.createClass({

  render: function() {
    return(
      <div>
        <textarea name={this.props.name} className={"form-control " + this.props.class}
              id={this.props.id} data-parsley-trigger="keyup"
              data-parsley-maxlength={this.props.maxlen}
              data-parsley-maxlength-message={this.props.maxlenmsg}
              rows={this.props.rows} cols={this.props.cols} placeholder={this.props.placeholder}></textarea>
      </div>
    );
  }
});

module.exports = TextArea;
