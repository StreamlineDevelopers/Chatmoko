const mongoose = require("mongoose");

const ChatCallSchema = mongoose.Schema(
  {
    users: Array,
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sendername: {
      type: String,
      required: true,
    },
    receivername: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ChatCalls", ChatCallSchema);
