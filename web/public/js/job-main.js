$( document ).ready(function() {

	var MAX_CONCURRENT_TRIP_CHATS = 3;

	//handle job search
	var currentSearchText = getParameterByName ("s");
	$('#job-search-box').keypress(function(e) {
    if (e.keyCode == ENTER_KEY_CODE) {
			executeSearch (e);
		}
	});

	$('#job-search-submit').click(function(e) {
		executeSearch (e);
	});

	function executeSearch (e) {
		e.preventDefault();
		var newSearchText = $('#job-search-box').val().trim();

		if (newSearchText !== currentSearchText &&
					newSearchText.length > 2) {
			window.location.href = getCurrentUrlWithOutQueryString () + "?s=" + newSearchText;
		}
	}

	//inject data into modal popups
	$('#startChatConfirmationDialog').on('show.bs.modal', function (event) {
	  var button = $(event.relatedTarget);
	  var chatId = button.data('chatid');
	  var modal = $(this);
		$.get("/trip/" + chatId + "/numActiveChats", function (data) {
			if (data >= MAX_CONCURRENT_TRIP_CHATS) {
				 $('.job-' + chatId).remove();
				 modal.find('.modal-body').html('<p>Sorry, but there are already '+MAX_CONCURRENT_TRIP_CHATS+' or more agents talking to this traveler. This job has now been deleted from your job board.</p>');
				 modal.find('.start-chat-confirm').remove();
			} else {
				 modal.find('.start-chat-confirm').attr('data-chatid', chatId);
			}
		});
		$('#startChatConfirmationForm').parsley();
	});

	//start chat confirmation
	$('.start-chat-confirm').on('click', function(event){
		var button = $(event.target);
		var chatId = button.data('chatid');
		//submit the decline request to server with reason and description
		var basePath = "/chat?id=" + chatId;
		var startChatIntro = $("#startChatIntro").val().trim();
		if (!startChatIntro) {
			//do nothing
		} else {
			basePath =  basePath + "&introText=" + startChatIntro;
		}
		window.location.href= getCurrentBaseUrl () + basePath;
	});

	$('#declineChatConfirmationDialog').on('show.bs.modal', function (event) {
		var button = $(event.relatedTarget);
	  var chatId = button.data('chatid');
	  var modal = $(this);
	  var dbtn = modal.find('.decline-chat-confirm');
		dbtn.attr('data-chatid', chatId);
		$('#declineChatConfirmationForm').parsley();
	});

	//decline chat confirmation
	$('.decline-chat-confirm').on('click', function(event){
		if (!$("#declineChatConfirmationForm").parsley().isValid()) {
			return;
		}
		var button = $(event.target);
		var chatId = button.data('chatid');
		//submit the decline request to server with reason and description
		var basePath = "/chat/" + chatId + "/decline";
		var payload = {
			reason: $("#chatDeclineReason").val(),
			description:  $("#chatDeclineDescription").val().trim()
		};
		$.ajax({
			url: basePath,
			type: "POST",
			dataType: "json",
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify(payload),
			success: function(response, textStatus, jqXHR) {
				//send a chat message
				if (response.status &&
							response.status == "success") {
						//remove the job from dashboard
						$('.job-' + chatId).fadeOut (750, function () { $(this).remove(); });
						$('#declineChatConfirmationDialog').modal('hide');
				} else {
						//TBD: show UI error
				}
			},
			error: function(jqXHR, textStatus, errorThrown){
				//TBD: show UI error
			}
		});
	});

});
