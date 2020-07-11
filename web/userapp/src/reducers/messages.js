import * as constants from '../constants';

export default function (state, action){	
	return {
		...action.data
	};	
};