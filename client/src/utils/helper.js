import moment from "moment";

export const GetMessageDateFormat = (datetime) => {
  if (moment(datetime).format("YYYY") !== moment(new Date()).format("YYYY")) {
    return moment(datetime).format("MMM YYYY");
  } else if (
    moment(datetime).format("MMM") !== moment(new Date()).format("MMM")
  ) {
    return moment(datetime).format("MMM D");
  } else if (moment(datetime).format("D") !== moment(new Date()).format("D")) {
    return moment(datetime).format("MMM D");
  } else {
    return moment(datetime).format("h:mm a");
  }
};
