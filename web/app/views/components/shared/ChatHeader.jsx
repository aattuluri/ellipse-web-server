const React = require('react');

module.exports = function ChatHeader(props) {
  const originDestination = props.origin ? (
    <span>
      <span className="icon icon-aircraft"></span>
      <span className="icon-label">
        {
          ((props.origin)? 'From ' + props.origin : '')
          + ((props.destination)? ' to ' + props.destination : '')
        }
      </span>
    </span>
  ) : '';

  const days = (
    <span>
      <span className="icon icon-briefcase"></span>
      <span className="icon-label">{props.days} days</span>
    </span>
  );

  const people = (
    <span>
      <span className="icon icon-briefcase"></span>
      <span className="icon-label">{props.people} people</span>
    </span>
  );

  const jobMarkedSuccesful = props.status == 'completed' ? (
    <div className="row job-item">
      <span>
        <span className="icon icon-check"></span>
        <span className="icon-label">This job has been completed successfully!</span>
      </span>
    </div>
  ) : '';

  return (
    <div>
      <div className="client-info">
        <div className="row job-item">
          <h1>{props.userName}</h1>
          {originDestination}
          {(props.days)? days : ''}
          {(props.people)? people : ''}
        </div>
        {jobMarkedSuccesful}
      </div>
      <div className="itinerary">
        <a title="Create/Edit the itinerary" href="#0" className="cd-btn btn btn-primary-aa">
          ITINERARY
        </a>
      </div>
    </div>
  );
}
