const SMSMessages = require("../models/smsmessageModel");
const Contacts = require("../models/contactModel");
const User = require("../models/userModel");
const ObjectId = require("mongoose").Types.ObjectId;
const moment = require("moment");
require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

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

const getAllLatestSMSMessageByUser = async (req, res) => {
  try {
    const paramsId = req.params.id;
    var finalMessageList = [];
    const messages = await SMSMessages.aggregate([
      {
        $match: {
          $or: [
            { sendernumber: { $in: [paramsId] } },
            { receivernumber: { $in: [paramsId] } },
          ],
        },
      },
      {
        $group: {
          _id: {
            sendernumber: "$sendernumber",
            sendername: "$sendername",
            receivernumber: "$receivernumber",
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
        msg._id.sendernumber === paramsId
          ? msg._id.receivernumber
          : msg._id.sendernumber;

      var i = finalMessageList.findIndex((x) => x.displayId == id);
      if (i <= -1) {
        const data = {
          displayName:
            msg._id.sendernumber == paramsId
              ? msg._id.receivername
              : msg._id.sendername,
          displayId:
            msg._id.sendernumber === paramsId
              ? msg._id.receivernumber
              : msg._id.sendernumber,
          fromSelf: msg._id.sendernumber == paramsId,
          displayMessage: msg.message.text,

          displayDate: GetMessageDateFormat(msg.last_update),
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

const getSMSMessageByUser = async (req, res) => {
  try {
    const { from, to } = req.body;

    const messages = await SMSMessages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sendernumber.toString() === from,
        fromReceiver: msg.receivernumber.toString() === to,
        message: msg.message.text,
        createdAt: GetMessageDateFormat(msg.createdAt),
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    console.error(ex);
  }
};

const sendSMSMessage = async (req, res) => {
  try {
    const { from, to, message, sendername, receivername } = req.body;
    const data = await SMSMessages.create({
      message: { text: message },
      users: [from, to],
      sendernumber: from,
      receivernumber: to,
      receivername,
      sendername,
    });

    client.messages.create({
      body: message,
      from: process.env.TWILIO_MY_NUMBER,
      to: to,
    });

    if (data) return res.json({ msg: "SMS message added successfully." });
    else return res.json({ msg: "Failed to add SMS message to the database" });
  } catch (ex) {
    console.error(ex);
  }
};

const receiveSMSMessage = async (req, res) => {
  try {
    const { From, To, Body } = req.body;
    const toUser = await User.findOne({ mobilenumber: To });
    const contact = await Contacts.findOne({
      user: toUser._id,
      contactnumber: From,
    });

    const data = await SMSMessages.create({
      message: { text: Body },
      users: [From, To],
      sendernumber: From,
      receivernumber: To,
      receivername: toUser.fullname,
      sendername: contact ? contact.contactname : "",
    });
    if (data) return res.json({ msg: "SMS message added successfully." });
    else return res.json({ msg: "Failed to add SMS message to the database" });
  } catch (ex) {
    console.error(ex);
  }
};

const addNewContact = async (req, res) => {
  try {
    const { userid, usernumber, contactname, contactnumber } = req.body;

    const exists = await Contacts.findOne({ contactnumber });
    if (exists) {
      return res.json({
        status: false,
        message: "Number already exists on phonebook",
      });
    }

    const data = await Contacts.create({
      user: userid,
      contactname,
      contactnumber,
    });

    const checkIfexistsmessage = await SMSMessages.findOne({
      $or: [{ receivernumber: contactnumber }, { sendernumber: contactnumber }],
    });

    if (checkIfexistsmessage) {
      await SMSMessages.updateMany(
        { receivernumber: usernumber, sendernumber: contactnumber },
        { $set: { sendername: contactname } }
      );

      await SMSMessages.updateMany(
        { sendernumber: usernumber, receivernumber: contactnumber },
        { $set: { receivername: contactname } }
      );
    }

    return res.json({
      status: true,
      data,
    });
  } catch (ex) {
    console.error(ex);
  }
};

const deleteContact = async (req, res) => {
  try {
    const { id, contactnumber, usernumber } = req.body;
    const data = await Contacts.deleteOne({
      _id: ObjectId(id),
    });

    await SMSMessages.updateMany(
      { receivernumber: usernumber, sendernumber: contactnumber },
      { $set: { sendername: "" } }
    );

    await SMSMessages.updateMany(
      { sendernumber: usernumber, receivernumber: contactnumber },
      { $set: { receivername: "" } }
    );

    if (data) return res.json({ msg: "Contact deleted successfully." });
    else return res.json({ msg: "Failed to delete contact to the database" });
  } catch (ex) {
    console.error(ex);
  }
};

const getAllContactByUser = async (req, res) => {
  try {
    const user = await Contacts.find({
      user: { $eq: req.params.id },
    });
    return res.json(user);
  } catch (ex) {
    console.error(ex);
  }
};

module.exports = {
  getAllLatestSMSMessageByUser,
  getSMSMessageByUser,
  sendSMSMessage,
  addNewContact,
  getAllContactByUser,
  receiveSMSMessage,
  deleteContact,
};
