var momemt = require("moment");

function getFormattedTime(date) {

    var m = moment(date);
    return m.format("HH:mm:ss A");

}

function getDayHeaderVal (currDate, prevDate) {
    var now = new Date();
    var day = now.getDate() - currDate.getDate();
    var dayStr;
    switch (day) {
      case 0:
        dayStr = 'TODAY';
        break;
      case 1:
        dayStr = 'YESTERDAY';
        break;
      default:
        dayStr = moment(currDate).format('MMMM Do');
        break;
    }
}

module.exports = {
  getFormattedTime : getFormattedTime
};
