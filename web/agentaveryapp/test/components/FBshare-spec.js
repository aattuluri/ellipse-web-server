import React from 'react';
import { shallow, mount, render } from 'enzyme';
import 'ignore-styles';
import expect, { createSpy, spyOn, isSpy } from 'expect'
import FBshare from '../../app/components/FBshare';

function setup() {
  const props = {
    	start: "August 13, 2016",
    	end: "September 23, 2016",
      picture: "",
      title: "",
      description: "",
      caption: "",
      link: "",
      formValidation: function() {return true}
  }
  const wrapper = shallow(<FBshare {...props} />)
  return {
    props,
    wrapper
  }
}
function connectedStatus(cb) {
  cb({ status: "connected" })
}

describe('<FBshare />', () => {
  before(function (){
      global.FB = {
        login: createSpy(),
        getLoginStatus: connectedStatus,
        api: createSpy()
      };
    });

  it('calls FB.api on clicking share button', () => {
    const { wrapper, props } = setup()
    console.log("---- yas")
    const button = wrapper.find('.bulge-button').props();
    expect(FB.api.calls.length).toBe(0)
    button.onClick();
    expect(FB.api.calls.length).toBe(1)
  });
});
