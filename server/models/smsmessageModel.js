const mongoose = require("mongoose");

const SMSMessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: Array,
    receivernumber: {
      type: String,
      required: true,
    },
    sendernumber: {
      type: String,
      required: true,
    },
    sendername: {
      type: String,
    },
    receivername: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SMSMessages", SMSMessageSchema);
