import React from 'react';
import { browserHistory, Router, Route, Link } from 'react-router'

/* containers */
import { App } from 'containers/App';
import { LandingPage } from 'containers/LandingPage';
import { Welcome } from 'containers/Welcome';
import { Verified } from 'containers/Verified';
import { Home } from 'containers/Home';
import { Chat } from 'containers/Chat';
import { Itinerary } from 'containers/Itinerary';
import { ForgotPassword } from 'containers/ForgotPassword';
import { Login } from 'containers/Login';
import { SignUp } from 'containers/SignUp';
import { ShortSignUp } from 'containers/ShortSignUp';
import { NotFound } from 'containers/NotFound';

export default (
  <Route path="/" component={App}>
    <Route path="landing" component={LandingPage} />
    <Route path="welcome" component={Welcome} />
    <Route path="verified" component={Verified} />
    <Route path="home" component={Home} />
    <Route path="chat/:chatId" component={Chat} />
    <Route path="itinerary/:itineraryId" component={Itinerary} />
    <Route path="login" component={Login} />
    <Route path="forgotpassword" component={ForgotPassword} />
    <Route path="shortsignup" component={ShortSignUp} />
    <Route path="signup" component={SignUp} />
    <Route status={404} path="*" component={NotFound} />
  </Route>
);
