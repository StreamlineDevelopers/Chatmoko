import React, { useState, useRef, useEffect } from "react";
import { Device } from "@twilio/voice-sdk";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";
import CallIcon from "@mui/icons-material/Call";
import ChatInput from "../components/ChatInput";
import {
  getSMSMessagesByUser,
  sendSMSMessage,
  getOutboundToken,
} from "../utils/APIRoutes";
import axios from "axios";
import "./SMSMessage.css";
import { GetMessageDateFormat } from "../utils/helper";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

function SMSMessage({
  currentSMS,
  currentUser,
  changeSMS,
  smswaitingCall,
  openSMSCallModal,
  handleOpenSMSCallModal,
  handleCloseSMSCallModal,
  setSMSWaitingCall,
  setsmsCallAccepted,
  setsmsCallEnded,
  outboundCall,
}) {
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "white",
  };
  const [messages, setMessages] = useState([]);
  const [messageNumber, setMessageNumber] = useState("");
  const [newMessage, setNewMessage] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    async function fetchData() {
      if (currentSMS) {
        const response = await axios.post(getSMSMessagesByUser, {
          from: currentUser.mobilenumber,
          to: currentSMS.mobilenumber,
        });
        setNewMessage(false);
        setMessages(response.data);
      } else {
        setMessages([]);
        setNewMessage(true);
      }
    }
    fetchData();
  }, [currentSMS]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMsg = async (msg) => {
    if (newMessage && isValidPhoneNumber(messageNumber) === false) {
      toast.error("Invalid phone number", toastOptions);
      return;
    }

    const createddate = GetMessageDateFormat(new Date());

    await axios.post(sendSMSMessage, {
      from: currentUser.mobilenumber,
      to: newMessage ? messageNumber : currentSMS.mobilenumber,
      sendername: currentUser.fullname,
      receivername: newMessage ? "" : currentSMS.fullname,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ createdAt: createddate, fromSelf: true, message: msg });
    setMessages(msgs);

    if (newMessage) {
      const data = {
        contactname: "",
        mobilenumber: messageNumber,
      };
      changeSMS(data);
    }
  };

  const handleCall = async () => {
    if (newMessage && isValidPhoneNumber(messageNumber) === false) {
      toast.error("Invalid phone number", toastOptions);
      return;
    }
    const toNumber = newMessage ? messageNumber : currentSMS.mobilenumber;
    await axios.post(getOutboundToken, {}).then((res) => {
      const device = new Device(res.data, {
        codecPreferences: ["opus", "pcmu"],
        fakeLocalDTMF: true,
        enableRingingState: true,
      });
      device
        .connect({
          params: {
            To: toNumber,
          },
        })
        .then((call) => {
          outboundCall.current = call;
          setsmsCallAccepted(true);
          setsmsCallEnded(false);
          handleCloseSMSCallModal();
          setSMSWaitingCall(false);
          call.on("disconnect", function (conn) {
            outboundCall = null;
            setsmsCallAccepted(false);
            setsmsCallEnded(true);
            setSMSWaitingCall(true);
          });
        });
    });
  };

  return (
    <Box sx={{ height: "80vh", m: 2 }}>
      <CssBaseline />
      <Paper>
        <Grid
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Toolbar sx={{ width: "70%" }}>
            {newMessage ? (
              <Box sx={{ width: "100%" }}>
                <PhoneInput
                  placeholder="Enter phone number"
                  value={messageNumber}
                  onChange={setMessageNumber}
                />
              </Box>
            ) : (
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  fontSize: "18px",
                }}
              >
                {currentSMS
                  ? currentSMS.fullname
                    ? `${currentSMS.fullname} <${currentSMS.mobilenumber}>`
                    : currentSMS.mobilenumber
                  : ""}
              </Typography>
            )}
          </Toolbar>
          <Toolbar>
            <Box>
              <IconButton
                disabled={smswaitingCall ? false : true}
                onClick={handleCall}
              >
                <CallIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Grid>
      </Paper>
      <Paper>
        <Grid>
          <Box className="chat-messages" sx={{ height: "72vh", mt: 2, mb: 2 }}>
            {messages.map((message, i) => {
              return (
                <div ref={scrollRef} key={i}>
                  <Box
                    className={`message ${
                      message.fromSelf ? "sended" : "received"
                    }`}
                  >
                    <Box
                      className={`content ${
                        message.fromSelf ? "content-sended" : "content-recieved"
                      }`}
                    >
                      <Typography variant="p">{message.message}</Typography>
                    </Box>
                  </Box>
                  <Box
                    className={`message ${
                      message.fromSelf ? "sended" : "received"
                    }`}
                    sx={{ ml: 1 }}
                  >
                    <Typography variant="caption" gutterBottom>
                      {message.createdAt}
                    </Typography>
                  </Box>
                </div>
              );
            })}
          </Box>
        </Grid>
      </Paper>
      <ChatInput handleSendMsg={handleSendMsg} />

      {/* {setSMSWaitingCall === false && (
        <SMSCallModal
          open={openSMSCallModal}
          handleClose={handleCloseSMSCallModal}
          call={outboundCall.current}
          inboundCall={false}
        />
      )} */}
      <ToastContainer />
    </Box>
  );
}

export default SMSMessage;
