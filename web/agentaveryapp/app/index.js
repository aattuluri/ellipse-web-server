import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import configureStore from './config/configure_store';
import createBrowserHistory from "history/lib/createBrowserHistory";
import routes from './config/routes';

var store = configureStore();
const history = createBrowserHistory();

ReactDOM.render(
  <Provider store= {store }>
    <Router history={ browserHistory }>
      { routes }
    </Router>
  </Provider>,
  document.getElementById('root')
);
