$( document ).ready(function() {

	var autoSaveJob;

	var iteneraryChanged = false;

	advancedEditor.on('change', function(delta, source) {
	  iteneraryChanged = true;
	  return true;
	});

	//open the lateral panel
	$('.cd-btn').on('click', function(event){
		event.preventDefault();
		//load the current itenenray
		showRightPanel ('.itenerary-panel');
		autoSaveJob = setInterval(autoSaveItenenary, 3000);
		getItenerary (function (err, result) {
			if (!err && result) {
				advancedEditor.setData(result, function () {
					this.checkDirty();
				});
			} else {
				//TBD: show error
			}
		});
	});
	//close the lateral panel
	$('.itenerary-panel').on('click', function(event){
		if( $(event.target).is('.itenerary-panel') || $(event.target).is('.cd-panel-close') ) {
			hideRightPanel ('.itenerary-panel');
			clearInterval (autoSaveJob);
			event.preventDefault();
		}
	});

	/*image upload*/
	$('.attachement-btn').on('click', function(event){
		event.preventDefault();
		showRightPanel ('.image-upload-panel');
	});
	//close the lateral panel
	$('.image-upload-panel').on('click', function(event){
		if( $(event.target).is('.image-upload-panel') || $(event.target).is('.close-image-upload-panel') ) {
			hideRightPanel ('.image-upload-panel');
			event.preventDefault();
		}
	});

	//for fee options panel
	$('.fee-btn').on('click', function(event){
		event.preventDefault();
		showRightPanel ('.fee-options-panel');
	});

	//close the lateral panel
	$('.fee-options-panel').on('click', function(event){
		if( $(event.target).is('.fee-options-panel') || $(event.target).is('.close-fee-options-panel') ) {
			hideRightPanel ('.fee-options-panel');
			event.preventDefault();
		}
	});

	//close the lateral panel
	$('.itenerary-share-panel').on('click', function(event){
		if( $(event.target).is('.itenerary-share-panel') || $(event.target).is('.close-itenerary-share-panel') ) {
			hideRightPanel ('.itenerary-share-panel');
			event.preventDefault();
		}
	});

	/**/

	$('#send-btn').on('click', function(event){
		clearInterval (autoSaveJob);
		saveItenerary (true);
	});

	$('#edit-btn').on('click', function(event){

		$('#sentItinerary').hide();
		$('#buildItinerary').show();

	});

	$('#share-btn').on('click', function(event) {
		event.preventDefault();
		hideRightPanel ('.itenerary-panel');
		showRightPanel ('.itenerary-share-panel');
		$('#shareItineraryForm').parsley();
	});

	$('#itenerary-share-submit-btn').on('click', function(event) {
		event.preventDefault();
		if ($('#shareItineraryForm').parsley().isValid() === true) {
			shareItinerary ();
		}
	});

	/**
		Fee (Service & Trip) common functions
	*/

	function renderFeeNotes (type, text, dateModified, showRefund) {
		$('.form-control').attr("disabled", true);
		$('#'+type+'-fee-submit-btn').hide();
		$('#'+type+'-fee-notes').html('<h4>This fee was '+text+' on ' + (getFormattedDateTime(dateModified)) + '</h4>');
		if (showRefund === true) {
			$('#'+type+'-fee-refund-btn').show();
		}
	}

	function resetFeePanel (type) {
		$('.form-control').attr("disabled", false);
		$('.form-control').val('');
		$('#'+type+'-fee-refund-btn').hide();
		$('#'+type+'-fee-submit-btn').show();
		$('#'+type+'-fee-submit-btn').text('SUBMIT');
		$('#'+type+'-fee-submit-btn').removeAttr('tfid');
		$('#'+type+'-fee-notes').html('');
		$("."+type+"-fee-total").text('0.00');
		clearFeeServerError (type);
	}

	function showFeeServerError (type, errMsg) {
		var id = '#'+type+'-fee-server-message';
    $(id).show();
    $(id).addClass('aa-failed-text');
    $(id).html(errMsg);
  }

	function clearFeeServerError (type) {
		var id = '#'+type+'-fee-server-message';
    $(id).html('');
  }

	/**
		END -- Fee common functions
	*/

	/**
    Trip fee panel
	*/
	$('#trip-fee-btn').on('click', function(event){
		event.preventDefault();
		hideRightPanel ('.fee-options-panel');
		showRightPanel ('.trip-fee-panel');
		resetFeePanel ('trip');
		initTripFeePanel ();
	});

	//close the lateral panel
	$('.trip-fee-panel').on('click', function(event){
		if( $(event.target).is('.close-trip-fee-panel') || $(event.target).is('.close-fee-panel') ) {
			hideRightPanel ('.trip-fee-panel');
			event.preventDefault();
			resetFeePanel ('trip');
		}
	});

	function updateTripFeeTotal () {
		if ($('#tripFeeForm').parsley().isValid() === true) {
			var tripFeeCalc = calculateTripFeeTotal ();
			$(".trip-fee-total").text(tripFeeCalc.amount);
		}
	}

	function calculateTripFeeTotal () {
		var itemization = [];
		var amount = parseFloat('0.0');
		//calculate all the service fee, expect hourly
		$(".trip-fee-item").each(function( index ) {
			var itemAmountVal = $(this).val();
			var itemAmount = Number (itemAmountVal);
			if (!isNaN(itemAmount)) {
				amount = amount + parseFloat(itemAmount);
				itemization.push ({
					title: $(this).closest('.form-group').find('.price-field-lbl').text(),
					amount: itemAmount
				});
			}
		});
		return {
			amount: amount.toFixed(2),
			itemization: itemization
		};
	}

	//create trip fee
	$('#trip-fee-submit-btn').on('click', function(event){
		//prevent multiple clicks on the trip fee button
		$('#trip-fee-submit-btn').prop("disabled", true);
		//check form validation
		if ($('#tripFeeForm').parsley().isValid() === true) {
			//calculate the total service fee
			var tripFeeCalc = calculateTripFeeTotal ();
			var tripId = getParameterByName('id');
			var tfid = $(event.target).attr("tfid");

			var payload = {
				type: 1,
				tripId: tripId,
				amount: tripFeeCalc.amount,
				currency: 'usd',
				description: $("#trip-fee-description").val(),
				itemization: tripFeeCalc.itemization
			};
			var basePath = "/trippayment";
			var method = "PUT";
			//check if its an update
			if (tfid) {
				basePath = basePath + "/" + tfid;
				method = 'POST';
			}
			$.ajax({
				url: basePath,
				type: method,
				dataType: "json",
				contentType: 'application/json; charset=utf-8',
				data: JSON.stringify(payload),
				success: function(response, textStatus, jqXHR) {
					//send a chat message
					if (response.status &&
								response.status == "success") {
						//send a chat message if its a new service fee
						if (!tfid) {
							var tf = {type: 1, id: response.id, a: response.amount};
							socket.emit ("io:msg", {c: tripId, p: tf});
						}
						resetFeePanel ('trip');
						hideRightPanel ('.trip-fee-panel');
					} else {
						//show UI error
						showFeeServerError ('trip', "Failed to save the trip fee. Please contact customer support.");
					}
				},
				error: function(jqXHR, textStatus, errorThrown){
					//show UI error
					showFeeServerError ('trip', "Server error. Please check and try again.");
				}
			});
		}
	});

	//edit service fee
	$(document).on('click', '.trip-fee-edit-btn', function(e) {

		resetFeePanel ('trip');
		initTripFeePanel ();

		//Open trip fee panel
		showRightPanel ('.trip-fee-panel');

		var tfid = $(e.target).attr('sfid');

		//Fetch the service fee values and update the form
		var path = "/trippayment" + "/" + tfid;
		$.ajax({
			url: path,
			type: 'GET',
			success: function(response, textStatus, jqXHR) {
				if (response.status === "success") {
					var tp = response.trippayment;
					var itemization = tp.itemization;
					for (var i=0; i < itemization.length; i++) {
						var item = itemization[i];
						if (i === 0) {
							$('#trip-fee-flight').val(item.amount);
						} else if (i === 1) {
							$('#trip-fee-hotel').val(item.amount);
						} else if (i === 2) {
							$('#trip-fee-rental-car').val(item.amount);
						} else if (i === 3) {
							$('#trip-fee-activities').val(item.amount);
						} else if (i === 4) {
							$('#trip-fee-others').val(item.amount);
						}
						$('#trip-fee-description').val(tp.description);
						$('#trip-fee-total').html(tp.amount);

						//change the button label as as UPDATE
						if (tp.status === 0) {
							$('#trip-fee-submit-btn').text('UPDATE');
							$('#trip-fee-submit-btn').attr('tfid', tfid);
						} else if (tp.status === 1) {
							renderFeeNotes ('trip', 'PAID', tp.dateModified, true);
						} else if (tp.status === 2) {
							renderFeeNotes ('trip', 'CANCELLED', tp.dateModified, false);
						}
					}
				} else {
					//show UI error
					showFeeServerError ('trip', "Could not find this trip fee.");
				}
			},
			error: function(jqXHR, textStatus, errorThrown){
				//show UI error
				showFeeServerError ('trip', "Failed to retrieve the trip fee.");
			}
		});
	});

	function initTripFeePanel (type) {
		//enable parsley validaton
		$('#tripFeeForm').parsley();

		//enable the submit button
		$('#trip-fee-submit-btn').prop("disabled", false);

		//define onchange events for amount fields on service fee panel
		$('.trip-fee-hourly').blur (function (evt) {
			  updateTripFeeTotal();
		});

		$('.trip-fee-item').blur (function (evt) {
				updateTripFeeTotal();
		});
	}


	/**
		END: Trip fee panel
	*/


	/**
		Service fee panel
	*/

	$('#service-fee-btn').on('click', function(event){
		event.preventDefault();
		hideRightPanel ('.fee-options-panel');
		showRightPanel ('.service-fee-panel');
		resetFeePanel ('service');
		initServiceFeePanel ('service');

	});

	//close the lateral panel
	$('.service-fee-panel').on('click', function(event){
		if( $(event.target).is('.close-service-fee-panel') || $(event.target).is('.close-fee-panel') ) {
			hideRightPanel ('.service-fee-panel');
			event.preventDefault();
			resetFeePanel ('service');
		}
	});

	function updateServiceFeeTotal () {
		if ($('#serviceFeeForm').parsley().isValid() === true) {
			var serviceFeeCalc = calculateServiceFeeTotal ();
			$(".service-fee-total").text(serviceFeeCalc.amount);
		}
	}

	function calculateServiceFeeTotal () {
		var itemization = [];
		var amount = parseFloat('0.0');
		//calculate all the service fee, expect hourly
		$(".service-fee-item").each(function( index ) {
			var itemAmountVal = $(this).val();
			var itemAmount = Number (itemAmountVal);
			if (!isNaN(itemAmount)) {
				amount = amount + parseFloat(itemAmount);
				itemization.push ({
					title: $(this).closest('.form-group').find('.price-field-lbl').text(),
					amount: itemAmount
				});
			}
		});
		//calculate hourly fee if present
		var hrAmountVal = $("#service-fee-hourly").val();
		var hrsVal = $("#service-fee-hours").val();
		var hrAmount = Number (hrAmountVal);
		var hrs = Number (hrsVal);
		if (!isNaN(hrAmount) && !isNaN(hrs)) {
			var hourlyTotalFee = parseFloat('0.0');
			hourlyTotalFee = hourlyTotalFee + parseFloat(hrAmount) * parseFloat(hrs);
			hourlyTotalFee = parseFloat(hourlyTotalFee.toFixed(2));
			amount = amount + hourlyTotalFee;
			itemization.push ({
				title: $("#service-fee-hourly").closest('.form-group').find('.price-field-lbl').text(),
				hours: hrs,
				hourlyFee: hrAmount,
				description: hrs + ' hours @ ' + hrAmount + 'per hour',
				amount: hourlyTotalFee
			});
		}
		return {
			amount: amount.toFixed(2),
			itemization: itemization
		};
	}

	//create service fee
	$('#service-fee-submit-btn').on('click', function(event){
		//prevent multiple clicks on the service fee button
		$('#service-fee-submit-btn').prop("disabled", true);
		//check form validation
		if ($('#serviceFeeForm').parsley().isValid() === true) {
			//calculate the total service fee
			var serviceFeeCalc = calculateServiceFeeTotal ();
			var tripId = getParameterByName('id');
			var sfid = $(event.target).attr("sfid");

			var payload = {
				type: 0,
				tripId: tripId,
				amount: serviceFeeCalc.amount,
				currency: 'usd',
				description: $("#service-fee-description").val(),
				itemization: serviceFeeCalc.itemization
			};
			var basePath = "/trippayment";
			var method = "PUT";
			//check if its an update
			if (sfid) {
				basePath = basePath + "/" + sfid;
				method = 'POST';
			}
			$.ajax({
				url: basePath,
				type: method,
				dataType: "json",
				contentType: 'application/json; charset=utf-8',
				data: JSON.stringify(payload),
				success: function(response, textStatus, jqXHR) {
					//send a chat message
					if (response.status &&
								response.status == "success") {
						//send a chat message if its a new service fee
						if (!sfid) {
							var sf = {type: 0, id: response.id, a: response.amount};
							socket.emit ("io:msg", {c: tripId, p: sf});
						}
						resetFeePanel ('service');
						hideRightPanel ('.service-fee-panel');
					} else {
						//show UI error
						showFeeServerError ('service', "Failed to save the service fee. Please contact customer support.");
					}
				},
				error: function(jqXHR, textStatus, errorThrown){
					//show UI error
					showFeeServerError ('service', "Server error. Please check and try again.");
				}
			});
		}
	});

	//edit service fee
	$(document).on('click', '.service-fee-edit-btn', function(e) {

		resetFeePanel ('service');
		initServiceFeePanel ('service');

		//Open service fee panel
		showRightPanel ('.service-fee-panel');

		var sfid = $(e.target).attr('sfid');

		//Fetch the service fee values and update the form
		var path = "/trippayment" + "/" + sfid;
		$.ajax({
			url: path,
			type: 'GET',
			success: function(response, textStatus, jqXHR) {
				if (response.status === "success") {
					var tp = response.trippayment;
					var itemization = tp.itemization;
					for (var i=0; i < itemization.length; i++) {
						var item = itemization[i];
						if (i === 0) {
							$('#service-fee-onetime').val(item.amount);
						} else if (i === 1) {
							$('#service-fee-other').val(item.amount);
						} else if (i === 2) {
							$('#service-fee-hours').val(item.hours);
							$('#service-fee-hourly').val(item.hourlyFee);
						}
						$('#service-fee-description').val(tp.description);
						$('#service-fee-total').html(tp.amount);

						//change the button label as as UPDATE
						if (tp.status === 0) {
							$('#service-fee-submit-btn').text('UPDATE');
							$('#service-fee-submit-btn').attr('sfid', sfid);
						} else if (tp.status === 1) {
							renderFeeNotes ('service', 'PAID', tp.dateModified, true);
						} else if (tp.status === 2) {
							renderFeeNotes ('service', 'CANCELLED', tp.dateModified, false);
						}
					}
				} else {
					//show UI error
					showFeeServerError ('service', "Could not find this service fee.");
				}
			},
			error: function(jqXHR, textStatus, errorThrown){
				//show UI error
				showFeeServerError ('service', "Failed to retrieve the service fee.");
			}
		});
	});

	function initServiceFeePanel (type) {
		//enable parsley validaton
		$('#serviceFeeForm').parsley();

		$('#service-fee-submit-btn').prop("disabled", false);

		//define onchange events for amount fields on service fee panel
		$('.service-fee-hourly').blur (function (evt) {
			  updateServiceFeeTotal();
		});

		$('.service-fee-item').blur (function (evt) {
				updateServiceFeeTotal();
		});
	}

	/**
		END: Service fee panel
	*/

	/*show refund panel*/
	$('#refund-fee-btn').on('click', function(event){
		event.preventDefault();
		hideRightPanel ('.fee-options-panel');
		showRightPanel ('.refund-panel');
	});
		//close the lateral panel
	$('.refund-panel').on('click', function(event){
		if( $(event.target).is('.close-refund-panel') || $(event.target).is('.close-refund-panel') ) {
			hideRightPanel ('.refund-panel');
			event.preventDefault();
		}
	});
	$('#refund-fee-submit-btn').on('click', function(event){
		//TBD: submit service fee to server
		hideRightPanel ('.refund-panel');
	});

	//itinerary
	function getItenerary (cb) {
		$.get("/trip/" + getParameterByName('id'), function(data){
			cb (null, data.itenerary);
		});
	}

	function autoSaveItenenary () {
		if (iteneraryChanged) {
			saveItenerary(false);
		}
	}

	function shareItinerary () {
		var basePath = "/trip/" + getParameterByName('id');
		var payload = {
			"email": $("#itinerary-share-email").val().trim(),
			"notes": $("#itinerary-share-notes").val().trim()
		};
		$.ajax({
			url: basePath + "/shareItenerary",
			type: 'POST',
			dataType: "json",
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify(payload),
			success: function(response, textStatus, jqXHR) {
				if (response.status == "success") {
					$('#shareStatus').html('Itenerary shared successfully!');
					$('#shareStatus').delay(6000).fadeOut(500);
					hideRightPanel ('.itenerary-share-panel');
				} else {
					//TBD: Show error on UI;
				}
			},
			error: function(jqXHR, textStatus, errorThrown){
				//TBD: Show error on UI;
			}
		});
	}

	function saveItenerary (sendEmail) {

		//server call to save the itenerary and send email
		var basePath = "/trip/" + getParameterByName('id');
		var iteneraryHtml = advancedEditor.getData();
		var payload = {"itenerary": iteneraryHtml};
		$('#saveStatus').show();
		$.ajax({
			url: basePath + "/updateItenerary",
			type: 'POST',
			dataType: "json",
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify(payload),
			success: function(response, textStatus, jqXHR) {
				//show UI status
				$('#saveStatus').removeClass('aa-failed-text');
				$('#saveStatus').addClass('aa-success-text');
				$('#saveStatus').html('Itenerary saved successfully!');
				$('#saveStatus').delay(6000).fadeOut(500);
				iteneraryChanged = false;
				//email the itenerary
				if (sendEmail) {
					$.ajax({
						url: basePath + "/emailItenerary",
						type: 'PUT',
						success: function(response, textStatus, jqXHR) {
							$('#buildItinerary').hide();
							$('#showItenerary').html(iteneraryHtml);
							$('#sentItinerary').show();
						},
						error: function(jqXHR, textStatus, errorThrown){
							alert(textStatus, errorThrown);
							//TBD: show UI error
						}
					});
				}
			},
			error: function(jqXHR, textStatus, errorThrown){
				//show UI error
				$('#saveStatus').removeClass('aa-success-text');
				$('#saveStatus').addClass('aa-failed-text');
				$('#saveStatus').html('Saving the itenerary failed.');
			}
		});
	}


	//Utility functions

	function hideRightPanel (selector) {
		$(selector).hide();
		$(selector).removeClass('is-visible');
		$('.container').removeClass('position-fixed');
	}

	function showRightPanel (selector) {
		$(selector).show();
		$(selector).addClass('is-visible');
		$('.container').addClass('position-fixed');
	}

	$('#endChatConfirmationForm').on('show.bs.modal', function (event) {
		$('#endChatConfirmationForm').parsley();
	});

	//end chat confirmation
	$('.end-chat-confirm').on('click', function(event){
		if (!$("#endChatConfirmationForm").parsley().isValid()) {
			return;
		}
		var chatId = getParameterByName ("id");
		//submit the end chat request to server with reason and description
		var basePath = "/chat/" + chatId + "/end";
		var payload = {
			reason: $("#chatEndReason").val(),
			description:  $("#chatEndDescription").val().trim()
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
						//TBD: remove chat box
						$('.chatbox').remove();
						$('#endChatConfirmationDialog').modal('hide');
				} else {
						//TBD: show UI error
				}
			},
			error: function(jqXHR, textStatus, errorThrown){
				//TBD: show UI error
			}
		});
	});

	//complete chat confirmation
	$('.complete-chat-confirm').on('click', function(event){
		var chatId = getParameterByName ("id");
		//submit the complete chat request to server with reason and description
		var basePath = "/chat/" + chatId + "/success";
		$.ajax({
			url: basePath,
			type: "GET",
			success: function(response, textStatus, jqXHR) {
				//send a chat message
				if (response.success) {
						$('#completeChatConfirmationDialog').modal('hide');
						$('#complete-chat').remove();
						$('#end-chat').remove();
						$('.client-info').append('<div className="row job-item"><span><span className="icon icon-check"></span><span className="icon-label success-text">This job has been completed successfully!</span></span></div>');
				} else {
					  //TBD: show UI error
					  alert ("Failed to mark the chat as complete!");
						$('#completeChatConfirmationDialog').modal('hide');
				}
			},
			error: function(jqXHR, textStatus, errorThrown){
				//TBD: show UI error
				alert ("Failed to mark the chat as complete!");
			}
		});
	});

	$('.enable-or-disable-sound').on('click', function(event){
		event.preventDefault();
		//do ajax call and set the option
		var newLabel;
		var action;
		if ($(event.target).text() == "Disable sound for new messages") {
			newLabel = "Enable sound for new messages";
			action = false;
		} else {
			newLabel = "Disable sound for new messages";
			action = true;
		}

		var basePath = "/agent/update";
		var payload = {
				"notificationPrefs.sounds.new_message": action
		};
		$.ajax({
			url: basePath,
			type: "POST",
			dataType: "json",
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify(payload),
			success: function(response, textStatus, jqXHR) {
				//send a chat message
				if (response.success) {
					$(event.target).text(newLabel);
					window.newMessageSoundEnabled = action;
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
