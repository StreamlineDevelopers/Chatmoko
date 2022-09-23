import React, { useState, useRef, useEffect } from "react";

import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import Stack from "@mui/material/Stack";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";
import CallIcon from "@mui/icons-material/Call";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import ChatInput from "../components/ChatInput";
import { getMessagesByUser, sendPersonalMessage } from "../utils/APIRoutes";
import axios from "axios";
import "./PersonalMessage.css";
import { GetMessageDateFormat } from "../utils/helper";
import CallModal from "../components/CallModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PersonalMessage({
  currentChat,
  socket,
  currentUser,
  callUser,
  leaveCall,
  callEnded,
  callAccepted,
  receivingCall,
  setReloadMessageList,
  waitingCall,
}) {
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "white",
  };
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState([]);
  const [openCallModal, setOpenModal] = useState(false);
  const handleOpenCallModal = () => setOpenModal(true);
  const handleCloseCallModal = () => setOpenModal(false);

  useEffect(() => {
    async function fetchData() {
      if (currentChat) {
        const response = await axios.post(getMessagesByUser, {
          from: currentUser._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      }
    }
    fetchData();
  }, [currentChat]);

  useEffect(() => {
    if (callEnded === true) {
      handleCloseCallModal();
    }
  }, [callEnded]);

  useEffect(() => {
    if (socket.current) {
      socket.current.on("chat", (data) => {
        setArrivalMessage({
          createdAt: GetMessageDateFormat(new Date()),
          fromSelf: false,
          message: data.msg,
          messageData: data,
        });
      });

      socket.current.on("check-call", (data) => {
        if (data.status === "available") {
          if (data.type === "call") getCallStream();
          else getVideoStream();
        } else {
          toast.error(
            `${currentChat.fullname} is busy. Please try again later.`,
            toastOptions
          );
        }
      });
    }
  }, []);

  useEffect(() => {
    if (arrivalMessage.length !== 0) {
      if (currentChat._id === arrivalMessage.messageData.from) {
        setMessages((prev) => [...prev, arrivalMessage]);
      }
    }
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMsg = async (msg) => {
    const createddate = GetMessageDateFormat(new Date());

    socket.current.emit("send-message", {
      createdAt: createddate,
      to: currentChat._id,
      from: currentUser._id,
      msg,
    });
    await axios.post(sendPersonalMessage, {
      from: currentUser._id,
      to: currentChat._id,
      sendername: currentUser.fullname,
      receivername: currentChat.fullname,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ createdAt: createddate, fromSelf: true, message: msg });
    setMessages(msgs);
    setReloadMessageList(true);
  };

  const getCallStream = () => {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        { audio: true, video: false },
        function (stream) {
          callUser(stream, null);
          handleOpenCallModal();
          var mediaStreamTrack = stream.getAudioTracks()[0];
          if (typeof mediaStreamTrack != "undefined") {
            mediaStreamTrack.onended = function () {
              //for Chrome.
              toast.error("Your audio is busy!", toastOptions);
            };
          } else toast.error("Permission denied!", toastOptions);
        },
        function (e) {
          var message;
          switch (e.name) {
            case "NotFoundError":
            case "DevicesNotFoundError":
              message = "Please setup your audio first.";
              break;
            case "SourceUnavailableError":
              message = "Your audio is busy";
              break;
            case "PermissionDeniedError":
            case "SecurityError":
              message = "Permission denied!";
              break;
            default:
              toast.error(e, toastOptions);
              return;
          }
          toast.error(message, toastOptions);
        }
      );
    } else toast.error("Uncompatible browser!", toastOptions);
  };

  const handleCall = () => {
    socket.current.emit("check-call", {
      from: currentUser._id,
      to: currentChat._id,
      type: "call",
    });
  };

  const handleVideoCall = () => {
    socket.current.emit("check-call", {
      from: currentUser._id,
      to: currentChat._id,
      type: "videocall",
    });
  };

  const getVideoStream = () => {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        { audio: true, video: true },
        function (stream) {
          callUser(null, stream);
          handleOpenCallModal();
          var mediaStreamTrack = stream.getVideoTracks()[0];
          if (typeof mediaStreamTrack != "undefined") {
            mediaStreamTrack.onended = function () {
              //for Chrome.
              toast.error("Your webcam is busy!", toastOptions);
            };
          } else toast.error("Permission denied!", toastOptions);
        },
        function (e) {
          var message;
          switch (e.name) {
            case "NotFoundError":
            case "DevicesNotFoundError":
              message = "Please setup your webcam first.";
              break;
            case "SourceUnavailableError":
              message = "Your webcam is busy";
              break;
            case "PermissionDeniedError":
            case "SecurityError":
              message = "Permission denied!";
              break;
            default:
              toast.error(e, toastOptions);
              return;
          }
          toast.error(message, toastOptions);
        }
      );
    } else toast.error("Uncompatible browser!", toastOptions);
  };

  const StyledBadgeOnline = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
      backgroundColor: "#44b700",
      color: "#44b700",
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      "&::after": {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        animation: "ripple 1.2s infinite ease-in-out",
        border: "1px solid currentColor",
        content: '""',
      },
    },
    "@keyframes ripple": {
      "0%": {
        transform: "scale(.8)",
        opacity: 1,
      },
      "100%": {
        transform: "scale(2.4)",
        opacity: 0,
      },
    },
  }));
  const StyledBadgeOffline = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
      backgroundColor: "white",
      color: "#white",
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      "&::after": {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        border: "1px solid black",
        content: '""',
      },
    },
    "@keyframes ripple": {
      "0%": {
        transform: "scale(.8)",
        opacity: 1,
      },
      "100%": {
        transform: "scale(2.4)",
        opacity: 0,
      },
    },
  }));
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
          <Toolbar>
            <ListItemAvatar>
              <Stack direction="row">
                {currentChat && currentChat.isOnline ? (
                  <StyledBadgeOnline
                    overlap="circular"
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    variant="dot"
                  >
                    <Avatar
                      alt={currentChat ? currentChat.fullname : ""}
                      src="/static/images/avatar/1.jpg"
                    />
                  </StyledBadgeOnline>
                ) : (
                  <StyledBadgeOffline
                    overlap="circular"
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    variant="dot"
                  >
                    <Avatar
                      alt={currentChat ? currentChat.fullname : ""}
                      src="/static/images/avatar/1.jpg"
                    />
                  </StyledBadgeOffline>
                )}
              </Stack>
            </ListItemAvatar>
            <Typography variant="h6" noWrap component="div">
              {currentChat ? currentChat.fullname : ""}
            </Typography>
          </Toolbar>
          <Toolbar>
            <Box>
              <IconButton
                disabled={
                  currentChat && !currentChat.isOnline
                    ? true
                    : waitingCall
                    ? false
                    : true
                }
                onClick={handleCall}
                // onClick={() => {
                //   callUser();
                //   handleOpenCallModal();
                // }}
              >
                <CallIcon />
              </IconButton>
              <IconButton
                disabled={
                  currentChat && !currentChat.isOnline
                    ? true
                    : waitingCall
                    ? false
                    : true
                }
                onClick={handleVideoCall}
                // onClick={() => {
                //   callUser();
                //   handleOpenCallModal();
                // }}
              >
                <VideoCallIcon />
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
      <CallModal
        open={openCallModal}
        handleClose={handleCloseCallModal}
        callerName={currentChat && currentChat.fullname}
        receivingCall={false}
        leaveCall={leaveCall}
        callAccepted={callAccepted}
      />
      <ToastContainer />
    </Box>
  );
}

export default PersonalMessage;
