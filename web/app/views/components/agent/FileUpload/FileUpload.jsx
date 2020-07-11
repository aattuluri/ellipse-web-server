var React = require('react');

var FileUpload = React.createClass({

  getInitialState: function() {
    return {title: '', activeClients: []};
  },

  render: function() {

    return(
      <div className={"cd-panel " + this.props.panelClass + " from-right"}>
        <div className="cd-panel-container">
          <div className="cd-panel-content">
            <h1>{this.props.title}</h1>
            <a href="#0" className={"cd-panel-close " + this.props.closePanelClass}><span className="ti-close"></span></a>
            <br/>
            <div>
              <div class="flrt">
                {/*<a href="#" className="file-scroll">
                  <span className="ti-plus"></span>
                </a>*/}
                <a href="#" className="fileinput-button ">
                  <span className="ti-plus"></span>
                </a>
              </div>
              <div id={this.props.formId} className="dropzone row">
              </div>
              <br/>
              <a id={this.props.actionBtnId} className="btn btn-primary-aa">{this.props.actionBtnLabel}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = FileUpload;
