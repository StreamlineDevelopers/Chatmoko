const ChatRoom = require("../models/chatroomModel");
const ChatRoomMessage = require("../models/chatroommessageModel");
const moment = require("moment");

function GetMessageDateFormat(datetime) {
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
}

const createRoom = async (req, res) => {
  try {
    const { roomname, createdBy, roommembers, createdName } = req.body;
    roommembers.push({ id: createdBy, membername: createdName });
    const data = await ChatRoom.create({
      roomname,
      createdBy,
      roommembers,
    });

    if (data) return res.json({ msg: "Room added successfully." });
    else return res.json({ msg: "Failed to add room to the database" });
  } catch (ex) {
    console.error(ex);
  }
};

const leaveRoom = async (req, res) => {
  try {
    const { roomname, memberId } = req.body;
    const data = await ChatRoom.updateOne(
      { roomname: roomname },
      { $pull: { roommembers: { id: memberId } } }
    );
    if (data) return res.json({ msg: "Leave conversation successfully." });
    else
      return res.json({ msg: "Failed to leave conversation to the database" });
  } catch (ex) {
    console.error(ex);
  }
};

const addRoomMember = async (req, res) => {
  try {
    const { newMembers, roomname } = req.body;

    const data = await ChatRoom.updateOne(
      { roomname: roomname },
      { $push: { roommembers: { $each: newMembers } } }
    );
    if (data) return res.json({ msg: "Add new member successfully." });
    else return res.json({ msg: "Failed to add new member to the database" });
  } catch (ex) {
    console.error(ex);
  }
};

const getRoomMessages = async (req, res) => {
  try {
    const { roomname, requestby } = req.body;
    const messages = await ChatRoomMessage.find({
      roomname: roomname,
    }).sort({ updatedAt: 1 });
    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === requestby,
        sendername: msg.sendername,
        message: msg.message.text,
        createdAt: GetMessageDateFormat(msg.createdAt),
        type: msg.type,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    console.error(ex);
  }
};

const getAllRoomByUser = async (req, res) => {
  try {
    let roomlist = [];

    const data = {
      id: req.params.id,
      membername: req.params.fullname,
    };

    const rooms = await ChatRoom.find({
      roommembers: {
        $all: [data],
      },
    }).sort({ updatedAt: 1 });

    rooms.map((room) => {
      roomlist.push({
        roomMembers: room.roommembers,
        roomname: room.roomname,
      });
    });

    res.json(roomlist);
  } catch (ex) {
    console.error(ex);
  }
};

const sendRoomMessage = async (req, res) => {
  try {
    const { roomname, sender, message, sendername, type } = req.body;
    const data = await ChatRoomMessage.create({
      message: { text: message },
      roomname,
      sender,
      sendername,
      type,
    });

    if (data) return res.json({ msg: "Room message added successfully." });
    else return res.json({ msg: "Failed to add room message to the database" });
  } catch (ex) {
    console.error(ex);
  }
};

module.exports = {
  createRoom,
  getRoomMessages,
  getAllRoomByUser,
  sendRoomMessage,
  leaveRoom,
  addRoomMember,
};
