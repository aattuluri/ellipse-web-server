import React from 'react';
import moment from 'moment';

function Chat(props) {
  return (
    <tr className="FBAgentMatcher-chat">
      <th>{props.trip.user._id}</th>
      <td>{props.trip.user.thirdPartyId}</td>
      <td>{moment(props.trip.user.dateCreated).fromNow()}</td>
      <td>{props.trip.user.firstName + ' ' + props.trip.user.lastName}</td>
      <td>{props.trip.agentId || 'none'}</td>
      <td>{props.trip.agentEmail}</td>
      <td>
        <a href={`/chat?id=${props.trip._id}`} className="btn btn-default">View Chat</a>
      </td>
      <td>
        <div className="dropdown">
          <button
            className="btn btn-default dropdown-toggle"
            type="button"
            id="fbam-dd-{props.trip._id}"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="true"
          >
            (Re)Assign agent
          </button>
          <ul className="dropdown-menu" aria-labelledby="fbam-dd-{props.trip._id}">
            {
              props.agents.map(agent => (
                <li key={'fbam-' + props.trip._id + '-' + agent._id}>
                  <a
                    className="FBAgentMatcher-chat-agentButton"
                    data-trip-id={props.trip._id}
                    data-agent-id={agent._id}
                    data-agent-email={agent.email}
                    href="#"
                  >
                    {`[${agent._id}] ${agent.firstName} ${agent.lastName}`}
                  </a>
                </li>
              ))
            }
          </ul>
        </div>
      </td>
    </tr>
  );
}

module.exports = function FBAgentMatcher(props) {
  return (
    <div className="FBAgentMatcher">
      <div className="container-fluid">
        <h4>Facebook Messenger agent matcher</h4>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>User ID</th>
              <th>FB ID</th>
              <th>Created</th>
              <th>User Name</th>
              <th>Agent ID</th>
              <th>Agent Email</th>
              <th>View Chat</th>
              <th>Assign agent</th>
            </tr>
          </thead>
          <tbody>
            {
              props.trips.map(trip => (
                <Chat key={'fbam-' + trip._id} trip={trip} agents={props.agents}/>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};
