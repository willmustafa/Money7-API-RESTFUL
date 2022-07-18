function stringToIsoDate(date) {
  var dateArray = date.split("-");
  var month = parseInt(dateArray[1], 10) - 1;
  return new Date(dateArray[0], month, dateArray[2]).toISOString();
}

function lastDateOfMonth(date) {
  var dateArray = date.split("-");
  var month = parseInt(dateArray[1], 10);
  return new Date(dateArray[0], month, 0).toISOString();
}

function MonthsBefore(date, subtractMonth = 0) {
  var dateArray = date.split("-");
  var month = parseInt(dateArray[1], 10) - subtractMonth;
  return new Date(dateArray[0], month, 0).toISOString();
}

function ofxToDate(date) {
  const year = date.substring(0, 4);
  const month = Number.parseInt(date.substring(4, 6)) - 1;
  const day = date.substring(6, 8);
  return new Date(year, month, day);
}

module.exports = {
  stringToIsoDate,
  lastDateOfMonth,
  MonthsBefore,
  ofxToDate,
};
