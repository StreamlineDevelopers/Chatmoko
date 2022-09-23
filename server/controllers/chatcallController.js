const ChatCalls = require("../models/chatCallModel");


const callUser = async (req, res) => {
    try {
      const { from, to , senderName, receiverName} = req.body;
      const data = await ChatCalls.create({
        users: [from, to],
        sender: from,
        receiver: to,
        sendername: senderName,
        receivername: receiverName,
      });
  
      if (data) return res.json({ msg: "Call added successfully." });
      else return res.json({ msg: "Failed to add call to the database" });
    } catch (ex) {
      console.error(ex);
    }


module.exports = { callUser}