import React, { Component, StyleSheet } from 'react';

export default class FBShare extends Component {
    constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.postToFeed = this.postToFeed.bind(this);
  }

  postToFeed() {
    var msg = this.props.message;
    var pic = this.props.picture;
    var title = this.props.title;
    var description = this.props.description;
    var caption = this.props.caption;
    var link = this.props.link;
    var element = document.getElementById('postProgress') ;
    if ( element ) {
      element.style.display = "block";
    }

    FB.ui({
      method: 'share_open_graph',
      action_type: 'og.shares',
      action_properties: JSON.stringify({
        object: {
          'og:href': link,
          'og:title': title,
          'og:description': description,
        }
      })
    }, function(response) {
      if (response && !response.error_message) {
        console.log('successfully posted. Status id: ', response.post_id);
      } else {
        console.log('Something went wrong: ', response.error_message);
        document.getElementById('postProgress').style.display = "none";
      }
    });
  }

  handleClick(event) {
    var self = this;
    if ( this.props.formValidation() ) {
      FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
          self.postToFeed();
        }
        else {
          FB.login( function(response) {
            if (response.authResponse) {
              self.postToFeed();
            }
            else {
              console.log('Login was cancelled or did not fully authorize.');
            }
          });
        }
      });
    }
  }

  render() {
    const styles = {
        postProgress: {
          display: "none"
          }
        };
    return(
      <div>
        <div className="bulge-button primary-btn lets-get-started" onClick={ this.handleClick }>
          Share
        </div>
        <div id="postProgress" style={styles.postProgress}>posting...</div>
        </div>
    )
  }
}

FBShare.propTypes = {
  start: React.PropTypes.string.isRequired,
  end: React.PropTypes.string.isRequired,
  picture: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired,
  caption: React.PropTypes.string.isRequired,
  link: React.PropTypes.string.isRequired
}
