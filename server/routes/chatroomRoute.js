const {
  createRoom,
  getRoomMessages,
  getAllRoomByUser,
  sendRoomMessage,
  leaveRoom,
  addRoomMember,
} = require("../controllers/chatroomController");
const router = require("express").Router();

router.post("/createroom", createRoom);
router.post("/getroommessages", getRoomMessages);
router.post("/sendroommessage", sendRoomMessage);
router.post("/leaveroom", leaveRoom);
router.post("/addnewmember", addRoomMember);
router.get("/getroombyuser/:fullname/:id", getAllRoomByUser);

module.exports = router;
