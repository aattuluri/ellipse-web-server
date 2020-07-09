var Redux = require('redux');

module.exports = Redux.combineReducers({
  counter: require('./counter'),
  share: require('./share'),
})
