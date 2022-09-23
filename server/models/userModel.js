const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    max: 50,
  },
  lastname: {
    type: String,
    required: true,
    max: 50,
  },
  fullname: {
    type: String,
    required: true,
    max: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  mobilenumber: {
    type: String,
    required: true,
    unique: true,
    max: 11,
  },
  isAvatarImageSet: {
    type: Boolean,
    default: false,
  },
  avatarImage: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Users", UserSchema);
