const mongoose = require("mongoose");

const ChatRoomMessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    roomname: {
      type: String,
      required: true,
      min: 3,
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
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ChatRoomMessages", ChatRoomMessageSchema);
