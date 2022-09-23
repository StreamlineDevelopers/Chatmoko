const mongoose = require("mongoose");

const ContactSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  contactnumber: {
    type: String,
    required: true,
  },
  contactname: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Contacts", ContactSchema);
