const ChatMesssages = require("../models/chatmessageModel");
const ObjectId = require("mongoose").Types.ObjectId;
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

const getAllLatestMessageByUser = async (req, res) => {
  try {
    const paramsId = ObjectId(req.params.id);

    var finalMessageList = [];
    const messages = await ChatMesssages.aggregate([
      {
        $match: {
          $or: [
            { sender: { $in: [paramsId] } },
            { receiver: { $in: [paramsId] } },
          ],
        },
      },
      {
        $group: {
          _id: {
            sender: "$sender",
            sendername: "$sendername",
            receiver: "$receiver",
            receivername: "$receivername",
          },
          last_update: { $last: "$createdAt" },
          message: { $last: "$message" },
        },
      },
      { $sort: { last_update: -1 } },
      {
        $project: {
          last_update: 1,
          message: 1,
        },
      },
    ]);

    messages.filter(function (msg) {
      var id =
        msg._id.sender.valueOf() === paramsId.valueOf()
          ? msg._id.receiver
          : msg._id.sender;

      var i = finalMessageList.findIndex(
        (x) => x.displayId.valueOf() == id.valueOf()
      );
      if (i <= -1) {
        const data = {
          displayName:
            msg._id.sender.valueOf() == paramsId.valueOf()
              ? msg._id.receivername
              : msg._id.sendername,
          displayId:
            msg._id.sender.valueOf() === paramsId.valueOf()
              ? msg._id.receiver
              : msg._id.sender,
          fromSelf: msg._id.sender.valueOf() == paramsId.valueOf(),
          displayMessage: msg.message.text,

          displayDate: GetMessageDateFormat(msg.last_update),
          isOnline: global.allUsers.has(
            msg._id.sender.valueOf() === paramsId.valueOf()
              ? msg._id.receiver.valueOf()
              : msg._id.sender.valueOf()
          ),
        };
        finalMessageList.push(data);
      }
      return null;
    });
    return res.json(finalMessageList);
  } catch (ex) {
    console.error(ex);
  }
};

const getMessageByUser = async (req, res) => {
  try {
    const { from, to } = req.body;

    const messages = await ChatMesssages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        fromReceiver: msg.receiver.toString() === to,
        message: msg.message.text,
        createdAt: GetMessageDateFormat(msg.createdAt),
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    console.error(ex);
  }
};

const sendPersonalMessage = async (req, res) => {
  try {
    const { from, to, message, sendername, receivername } = req.body;
    const data = await ChatMesssages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
      receiver: to,
      receivername,
      sendername,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    console.error(ex);
  }
};

module.exports = {
  getAllLatestMessageByUser,
  getMessageByUser,
  sendPersonalMessage,
};
