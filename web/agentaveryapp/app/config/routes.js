var ReactRouter = require("react-router");
var Route = ReactRouter.Route;

import Layout from '../components/Layout';
import Home from "../components/Home";
import Share from "../components/Share";

module.exports = (
	<Route component={ Layout }>
		<Route name="root" path="/" component={ Home } />
		<Route name="share_old" path="/share" component={ Share } />
		<Route name="share" path="/trip/:tripid/share" component={ Share } />
	</Route>
)
