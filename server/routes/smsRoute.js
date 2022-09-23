const {
  getAllLatestSMSMessageByUser,
  getSMSMessageByUser,
  sendSMSMessage,
  addNewContact,
  getAllContactByUser,
  receiveSMSMessage,
  deleteContact,
} = require("../controllers/smsmessageController");

const {
  getInboundToken,
  getOutboundToken,
  routeCall,
  inComingCall,
  getCall,
  getTurnCredentials,
} = require("../controllers/smscallController");
const router = require("express").Router();

//MESSAGES
router.get("/getallmessage/:id", getAllLatestSMSMessageByUser);
router.post("/getmessage", getSMSMessageByUser);
router.post("/sendtext", sendSMSMessage);
router.post("/receivemessage", receiveSMSMessage);
router.post("/addcontact", addNewContact);
router.post("/deletecontact", deleteContact);
router.get("/getallcontacts/:id", getAllContactByUser);

//CALL
router.post("/getoutboundtoken", getOutboundToken);
router.post("/getinboundtoken", getInboundToken);
router.post("/routecall", routeCall);
router.post("/incomingcall", inComingCall);
router.post("/getcall", getCall);

//TURN SERVER
router.get("/getturncredentials", getTurnCredentials);

module.exports = router;
