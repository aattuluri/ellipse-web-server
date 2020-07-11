import React from 'react';
import { shallow, mount, render } from 'enzyme';
import expect, { createSpy, spyOn, isSpy } from 'expect'
import { Counter } from '../../app/components/Counter';

function setup() {
  const props = {
    counter: 0,
    incrementCounter: createSpy()
  }
  const counter = shallow(<Counter {...props} />)
  return {
    props,
    counter
  }
}

describe('<Counter />', () => {
  it('calls increment on button press', () => {
    const { counter, props } = setup()

    const button = counter.find('button').props();
    expect(props.incrementCounter.calls.length).toBe(0)
    button.onClick();
    expect(props.incrementCounter.calls.length).toBe(1)
  });
});
