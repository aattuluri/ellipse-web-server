import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CounterActions from '../actions/counter';

// Use named export for unconnected component (for tests)
export class Counter extends Component {
	displayName: "Counter"
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

	myvalue() {
		val = 4; //this.props.counter;
		return val;
	}

	render() {
		return <div className="container">
			<p>
			Current value: { this.props.counter } &nbsp;&nbsp;
			<button onClick={ this.handleClick }>
				Increment
			</button>
		</p>
			</div>
	}

	handleClick(event) {
		this.props.incrementCounter(event)
	}

};

function mapDispatchToProps(dispatch) {
	console.dir(dispatch);
	return bindActionCreators(CounterActions, dispatch)
}


function mapStateToProps(state) {
	console.dir( state.counter)
	return {
		counter: state.counter
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter)
