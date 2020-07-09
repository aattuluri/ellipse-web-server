var React = require('react');

var ConfirmationPopup = React.createClass({

  render: function() {

    return(
      <div id={this.props.id} className="modal fade" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal">&times;</button>
              <h4 className="modal-title">{this.props.title}</h4>
            </div>
            { (this.props.message)?
              <div className="modal-body">
                <p>{ this.props.message }</p>
              </div> : ''
            }
            <div className="modal-footer">
              <button type="button" className={"btn btn-primary-aa " + this.props.actionClass}>{this.props.actionLabel}</button>
              <button type="button" className="btn btn-primary-outline modal-close-btn"
                data-dismiss="modal">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ConfirmationPopup;
