$( document ).ready(function() {

	$('.chat-clear-btn').on('click', function(event){
		event.preventDefault();
		var chatId = $('.chat-id-input').val().trim();
		if (chatId === "" || chatId.length < 6) {
			alert ('Enter a valid chat id!');
			return;
		}
		if (confirm("Are you sure you want to clear the chat?")) {
			var path = "/chat/" + chatId + "/clear";
			$.ajax({
				url: path,
				type: 'GET',
				success: function(response, textStatus, jqXHR) {
					if (response.success) {
						$('.chat-id-input').val('');
						alert ('Successfully cleared the chat!');
					} else {
						alert ('Failed to clear the chat!');
					}
				},
				error: function(jqXHR, textStatus, errorThrown){
					alert ('Failed to clear the chat!');
				}
			});
		}
	});

	$('.approve-agent-btn').on('click', function(event){
		event.preventDefault();
		var aab = $(event.target);
		var agentId = aab.data('agentid');
		if (!agentId) {
			alert('Agent Id is not valid!');
		}
		var path = "/agent/" + agentId + "/approve";
		if (confirm("Are you sure you want to approve the agent?")) {
			$.ajax({
				url: path,
				type: 'GET',
				success: function(response, textStatus, jqXHR) {
					if (response.success) {
						alert ('Successfully approved the agent!');
						//Remove the closest el with class 'agent-info-row'
						aab.closest('.agent-info-row').fadeOut (750, function () { $(this).remove(); });
					} else {
						alert ('Failed to approve the agent!');
					}
				},
				error: function(jqXHR, textStatus, errorThrown){
					alert ('Failed to approve the agent!');
				}
			});
		}
	});

	$('.resend-agent-agreement-email-btn').on('click', function(event){
		event.preventDefault();
		var aab = $(event.target);
		var agentId = aab.data('agentid');
		if (!agentId) {
			alert('Agent Id is not valid!');
		}
		var path = "/agent/" + agentId + "/resend-agent-agreement-email";
		if (confirm("Are you sure to resend agent agreement reminder email?")) {
			$.ajax({
				url: path,
				type: 'GET',
				success: function(response, textStatus, jqXHR) {
					if (response.success) {
						alert ('Successfully sent an agent agreement reminder email to the agent!');
					} else {
						alert ('Failed to send an agent agreement reminder email!');
					}
				},
				error: function(jqXHR, textStatus, errorThrown){
					alert ('Failed to send an agent agreement reminder email!');
				}
			});
		}
	});

	//inject data into modal popups
	$('#agentDetailsDialog').on('show.bs.modal', function (event) {
	  var button = $(event.relatedTarget);
	  var details = button.data('details');
	  var modal = $(this);
		modal.find('.modal-body').html('<p>' + JSON.stringify(details, null, 2) + '</p>');
	});

});
