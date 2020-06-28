var React = require('react');

var ModalPopup = React.createClass({

  render: function() {

    return(
      <div id={this.props.id} className="modal fade" role="dialog"
          data-keyboard={this.props.keyboard} data-backdrop={this.props.backdrop}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              {(!this.props.doNotShowClose)?
                <button type="button" className="close" data-dismiss="modal">&times;</button> : ''
              }
              <h4 className="modal-title">{this.props.title}</h4>
            </div>
            { (this.props.children)?
              <div className="modal-body">
                { this.props.children }
              </div> : ''
            }
            <div className="modal-footer">
              { (this.props.actionLabel)?
                <button type="button" className={"btn btn-primary-aa "
                  + this.props.actionClass}>{this.props.actionLabel}</button> : ''
              }
              { (!this.props.doNotShowClose)?
                <button type="button" className="btn btn-primary-outline modal-close-btn" data-dismiss="modal">Close</button> : ''
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ModalPopup;
