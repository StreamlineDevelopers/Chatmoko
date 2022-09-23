const {
  getAllLatestMessageByUser,
  getMessageByUser,
  sendPersonalMessage,
} = require("../controllers/chatmessageController");
const router = require("express").Router();

router.get("/getallmessage/:id", getAllLatestMessageByUser);
router.post("/getmessage", getMessageByUser);
router.post("/sendpm", sendPersonalMessage);

module.exports = router;
