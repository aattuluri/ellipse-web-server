import * as constants from '../constants';

export function sendMessage(data){
	return dispatch => {
		dispatch({
			type: constants.SEND_MESSAGE,
			data
		});
	}
}