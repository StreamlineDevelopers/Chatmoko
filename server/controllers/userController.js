const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const validator = require("validator");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        status: false,
        message: "Incorrect Email Address or Password",
      });
    }
    const ispasswordValid = await bcrypt.compare(password, user.password);
    if (!ispasswordValid)
      return res.json({
        status: false,
        message: "Incorrect  Email Address or Password",
      });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    console.error(ex);
  }
};

const registerNewUser = async (req, res) => {
  try {
    const { email, password, firstname, lastname, mobilenumber } = req.body;
    const emailExists = await User.findOne({ email });

    if (validator.isEmail(email) === false) {
      return res.json({
        status: false,
        message: "Sorry, invalid email address!",
      });
    }

    if (emailExists)
      return res.json({
        status: false,
        message: "Sorry, that email address already exists!",
      });
    const numberExists = await User.findOne({ mobilenumber });
    if (numberExists)
      return res.json({
        status: false,
        message: "Sorry, that number address already exists!",
      });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      mobilenumber,
      fullname: firstname + " " + lastname,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    console.error(ex);
  }
};

const searchUser = async (req, res) => {
  try {
    const user = await User.find({
      _id: { $ne: req.params.id },
      fullname: { $regex: `${req.params.value}`, $options: "i" },
    });

    return res.json(user);
  } catch (ex) {
    console.error(ex);
  }
};

const searchUserByMobileNumber = async (req, res) => {
  try {
    const user = await User.find({
      _id: { $ne: req.params.id },
      mobilenumber: { $regex: `${req.params.value}`, $options: "i" },
    });
    return res.json(user);
  } catch (ex) {
    console.error(ex);
  }
};

const logout = async (req, res) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    allUsers.delete(req.params.id);
    return res.json({ status: true });
  } catch (ex) {
    console.error(ex);
  }
};

module.exports = {
  registerNewUser,
  login,
  searchUser,
  searchUserByMobileNumber,
  logout,
};
