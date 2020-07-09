import { Component } from 'react';
import Counter from './Counter';


export default class Home extends Component {
render() {
  return (
    <div>
    <h2>Hello, this is home</h2>
    <Counter />
    </div>
  );
  }
}
