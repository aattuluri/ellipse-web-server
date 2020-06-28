var Redux = require('redux');
import thunkMiddleware from 'redux-thunk';
import loggerMiddleware from 'redux-logger';
import { apiMiddleware } from 'redux-api-middleware';
import rootReducer from '../reducers';

var logger = loggerMiddleware({
	level: 'info',
	collapsed: true
});

var createStoreWithMiddleware = Redux.compose(
//	Redux.applyMiddleware(thunkMiddleware, logger),  // currently creates error
	Redux.applyMiddleware(apiMiddleware, logger)(Redux.createStore)
);

module.exports = function(initialState) {
	return createStoreWithMiddleware(rootReducer, initialState);
};
