const mongoose = require("mongoose");

const ChatRoomSchema = mongoose.Schema(
  {
    roomname: {
      type: String,
      required: true,
      min: 3,
      unique: true,
    },
    roommembers: Array,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ChatRooms", ChatRoomSchema);
