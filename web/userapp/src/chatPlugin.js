import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Redirect, useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';
import { syncReduxAndRouter } from 'redux-simple-router';
import configureStore from './store/configureStore';
import { ChatPlugin } from './components/ChatPlugin';

const history = useRouterHistory(createHashHistory)({ queryKey: false });
const store = configureStore();

syncReduxAndRouter(history, store);

ReactDOM.render(
  <Provider store={store}>
    <ChatPlugin />
  </Provider>,
  document.getElementById('aa_chat_plugin')
);
