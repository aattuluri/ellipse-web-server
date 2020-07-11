import React from 'react';
import { shallow, mount, render } from 'enzyme';
import 'ignore-styles';
import configureMockStore from 'redux-mock-store';
import expect, { createSpy, spyOn, isSpy } from 'expect'
import { Share } from '../../app/components/Share';

const props_minimum = {
  share: {
//    start: "August 13, 2016",
    end: "September 23, 2016",
    destination: "",
    picture: "",
    agentId: "",
    data: {
      comment: "",
    }
  },
  getTrip: createSpy(),
  getAgent: createSpy(),
  getPlaceDetail: createSpy(),
  updateDestination: createSpy(),
  updateDate: createSpy(),
  updateForm:createSpy()
}

const props_complete = {
  params: {
    tripid: "abc"
  },
  location: {
    query: {}
  },
  share: {
    start: "August 13, 2016",
    end: "September 23, 2016",
    destination: "",
    picture: "",
    agentId: "",
    data: {
      comment: "",
    }
  },
  getTrip: createSpy(),
  getAgent: createSpy(),
  getPlaceDetail: createSpy(),
  updateDestination: createSpy(),
  updateDate: createSpy(),
  updateForm:createSpy()
}
function setup(props) {
  const wrapper = mount(<Share {...props} />)
  return {
    props,
    wrapper
  }
}

describe('<Share />', () => {
  it('component should handle no props or location', () => {
    const { wrapper, props } = setup(props_minimum)
    expect(props.getAgent.calls.length).toBe(0)
    expect(wrapper.find('.bulge-button').text()).toEqual('Share');
  });

  it('calls getAgent on mounting', () => {
    const { wrapper, props } = setup(props_complete)
    expect(props.getAgent.calls.length).toBe(1)
    expect(wrapper.find('.bulge-button').text()).toEqual('Share');
  });


});
