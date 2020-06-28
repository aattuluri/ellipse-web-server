import React, { Component } from 'react';
import moment from 'moment';
import * as constants from '../../constants';
import { AaLink } from '../AaLink';
import { AaButton } from '../AaButton';
import { InfoPopup } from '../../components/InfoPopup';

/* component styles */
import { styles } from './styles.scss';

export class Bubble extends Component {
  static propTypes = {
    msg: React.PropTypes.object.isRequired
  };

  linkify = (inputText) => {
      var replacedText, replacePattern1, replacePattern2, replacePattern3;

      //URLs starting with http://, https://, or ftp://
      replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

      //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
      replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

      //Change email addresses to mailto:: links.
      replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
      replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

      return replacedText;
  }


  render() {
    const { me, u, cssClass, msg, color, multi } = this.props;
    let content;
    var time;
    if (msg.t) {
      time = moment(new Date(msg.t)).format('H:mm');
    }
    let name;
    if (multi) {
      let nameStyle = {color: msg.c};
      name = <div className="name-header" style={nameStyle}>{msg.u}</div>
    }
    let user = 'me';
    let type;


    //if this message doesn't belong to user of this client then change the css class

    //this check is for backward compatibility when we only sent username in the chat messages
    //if we do not have a msg id, then use the name to differentiate the message css
    if (!msg.uid) {
      if (u &&
          msg.u !== u) {
        user = 'you';
      }
    }
    else {
      if (me &&
        msg.uid !== me) {
        user = 'you';
      }
    }

    //if we have the cssClass from parent, then override what the css class Bubble generates
    if (cssClass) {
      user = cssClass;
    }

    if (msg.f) {
      var files = msg.f;
      var file = files[files.length - 1];

      if (file.ty === 0) {
        content = <div>
          <img src={ `${constants.SERVER_URL}/file/${file.id}` }/>
          <br/>
          {
            //<span className='name'>{ file.n }</span>
          }
          </div>;
        type = 'img';
      }
      else {
        content = <a target='_blank' href={ `/file/${file.id}` }>{ file.n }</a>;
        type = 'text';
      }
    }
    else if (msg.p) {
      //create payment msg
      var p = msg.p;
      var title = 'Service Fee';
      var btnClass = 'service-fee-edit-btn';

      switch (p.type) {
        case 0:
          title = 'Service Fee';
          btnClass = 'service-fee-edit-btn';
          break;
        case 1:
          title = 'Trip Fee';
          btnClass = 'trip-fee-edit-btn';
          break;
        case 2:
          title = 'Refund';
          btnClass = 'refund-edit-btn';
          break;
        default:
          break;
      }
      // msgHtml = sfmp + title + ': <span class="bold fee-amount"> $' + p.a + ' </span>&nbsp;&nbsp;&nbsp;<a class="'+btnClass+'" sfid="' + p.id + '">edit</a>' + ms;

      content = <div>
          { title }:
          <span className='bold'> ${ p.a }</span>&nbsp;&nbsp;&nbsp;
          <InfoPopup data-pid={p.id} title={p.id}/>
        </div>;
      type = 'payment';
      user = '';
    }
    else if (msg.m) {
      if (msg.m.indexOf("div") > 0) {
        content = msg.m;
      } else {
        content = <div dangerouslySetInnerHTML={{__html:this.linkify(msg.m)}} />;
      }
      type = 'text';
    }
    var timeEl = '';
    if (time) {
      timeEl = <span className='time-label'>{ time }</span>;
    }
    return (
      <div className={`${styles}`}>
        <div className={`bubble ${user} ${type}`}>
          { name  }
          { content }
          {
            timeEl
          }
        </div>
      </div>
    );
  }
}
