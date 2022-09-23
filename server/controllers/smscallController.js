const SMSMessages = require("../models/smsmessageModel");
const VoiceResponse = require("twilio/lib/twiml/VoiceResponse");
const ClientCapability = require("twilio").jwt.ClientCapability;
require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const myNumber = process.env.TWILIO_MY_NUMBER;
const client = require("twilio")(accountSid, authToken);
const appSid = "AP872d71450faaeb7aa98d54c0f02c06a6";

const getCall = (req, res) => {
  const twiml = new VoiceResponse();
  twiml.say({ voice: "Man" }, "Waiting for the client to accept the call");

  res.type("text/xml");
  res.send(twiml.toString());
};

const routeCall = (req, res) => {
  const { To } = req.body;
  const twiml = new VoiceResponse();
  const dial = twiml.dial({ callerId: myNumber });
  dial.number(To);
  res.type("text/xml");
  res.send(twiml.toString());
};

const getOutboundToken = (req, res) => {
  const capability = new ClientCapability({
    accountSid: accountSid,
    authToken: authToken,
  });
  capability.addScope(
    new ClientCapability.OutgoingClientScope({
      applicationSid: appSid,
      answerOnBridge: true,
    })
  );
  const token = capability.toJwt();

  res.set("Content-Type", "application/jwt");
  res.send(token);
};

const inComingCall = (req, res) => {
  const { To } = req.body;
  const twiml = new VoiceResponse();

  //CALL COMING FROM TWILIO TEST MODE
  twiml.dial().client("admin");

  //CALL COMING FROM REAL PHONE NUMBER
  //twiml.dial().client(To);

  res.type("text/xml");
  res.send(twiml.toString());
};

const getInboundToken = (req, res) => {
  const { To } = req.body;

  const capability = new ClientCapability({
    accountSid: accountSid,
    authToken: authToken,
  });

  //CALL COMING FROM TWILIO TEST MODE
  capability.addScope(new ClientCapability.IncomingClientScope("admin"));

  //CALL COMING FROM REAL PHONE NUMBER
  // capability.addScope(new ClientCapability.IncomingClientScope(To));

  const token = capability.toJwt();

  res.set("Content-Type", "application/jwt");
  res.send(token);
};

const getTurnCredentials = (req, res) => {
  client.tokens.create().then((token) => {
    console.log(token);
    res.send({ token });
  });
};

module.exports = {
  getInboundToken,
  getOutboundToken,
  routeCall,
  inComingCall,
  getCall,
  getTurnCredentials,
};
