import React, { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import InfoIcon from "@mui/icons-material/Info";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import ChatInput from "../components/ChatInput";
import {
  getRoomMessages,
  sendRoomMessage,
  leaveRoom,
  addMember,
} from "../utils/APIRoutes";
import axios from "axios";
import "./RoomMessage.css";
import { Divider, IconButton } from "@mui/material";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { useNavigate } from "react-router-dom";
import AddNewMember from "../components/AddNewMember";
import { GetMessageDateFormat } from "../utils/helper";

function RoomMessage({ currentRoom, socket, currentUser }) {
  const navigate = useNavigate();
  const [roomMessages, setRoomMessages] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (currentRoom) {
        const response = await axios.post(getRoomMessages, {
          roomname: currentRoom.roomname,
          requestby: currentUser._id,
        });
        setRoomMessages(response.data);
      }
    }
    fetchData();
  }, [currentRoom]);

  useEffect(() => {
    if (socket.current) {
      socket.current.on("chatroom", (data) => {
        setArrivalMessage({
          createdAt: data.createdAt,
          fromSelf: currentUser._id === data.from,
          message: data.msg,
          sendername: data.sendername,
          type: data.type,
          messageData: data,
        });
      });
    }
  }, []);

  useEffect(() => {
    if (arrivalMessage.length !== 0) {
      if (currentUser._id !== arrivalMessage.messageData.from) {
        setRoomMessages((prev) => [...prev, arrivalMessage]);
      } else {
        if (arrivalMessage.type === "notification") {
          setRoomMessages((prev) => [...prev, arrivalMessage]);
        }
      }
    }
  }, [arrivalMessage]);

  const handleSendMsg = async (msg) => {
    socket.current.emit("send-room-message", {
      from: currentUser._id,
      sendername: currentUser.fullname,
      room: currentRoom.roomname,
      msg,
      type: "message",
      createdAt: GetMessageDateFormat(new Date()),
    });
    await axios.post(sendRoomMessage, {
      sender: currentUser._id,
      sendername: currentUser.fullname,
      roomname: currentRoom.roomname,
      message: msg,
      type: "message",
    });

    const msgs = [...roomMessages];
    msgs.push({
      fromSelf: true,
      type: "message",
      createdAt: GetMessageDateFormat(new Date()),
      sendername: currentUser.fullname,
      message: msg,
    });
    setRoomMessages(msgs);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomMessages]);

  const handleMember = async (members) => {
    if (members.length !== 0) {
      await axios.post(addMember, {
        roomname: currentRoom.roomname,
        newMembers: members,
      });

      let newMember = [];
      members.map((member) => newMember.push(member.membername));

      socket.current.emit("send-room-message", {
        fromSelf: true,
        from: currentUser._id,
        sendername: currentUser.fullname,
        room: currentRoom.roomname,
        msg: `${newMember.toString()} added to the room by ${
          currentUser.fullname
        }`,
        type: "notification",
      });
      await axios.post(sendRoomMessage, {
        sender: currentUser._id,
        sendername: currentUser.fullname,
        roomname: currentRoom.roomname,
        message: `${newMember.toString()} is added to the room by ${
          currentUser.fullname
        }`,
        type: "notification",
      });

      handleCloseModal();
    }
  };

  const handleLeave = async (event) => {
    event.preventDefault();
    await axios.post(leaveRoom, {
      roomname: currentRoom.roomname,
      memberId: currentUser._id,
    });

    socket.current.emit("send-room-message", {
      from: currentUser._id,
      sendername: currentUser.fullname,
      room: currentRoom.roomname,
      msg: `${currentUser.fullname} left the room`,
      type: "notification",
    });

    await axios.post(sendRoomMessage, {
      sender: currentUser._id,
      sendername: currentUser.fullname,
      roomname: currentRoom.roomname,
      message: `${currentUser.fullname} left the room`,
      type: "notification",
    });

    navigate("/welcome");
  };

  return (
    <Container maxWidth={false} sx={{ mt: 2 }}>
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
              <Avatar
                alt={currentRoom ? currentRoom.roomame : ""}
                src="/static/images/avatar/1.jpg"
              />
            </ListItemAvatar>
            <Typography variant="h6" noWrap component="div">
              {currentRoom ? currentRoom.roomname : ""}
            </Typography>
          </Toolbar>
          <Toolbar>
            <Box>
              <PopupState
                variant="popover"
                popupId="demo-popup-menu"
                sx={{ width: "350px" }}
              >
                {(popupState) => (
                  <React.Fragment>
                    <IconButton {...bindTrigger(popupState)}>
                      <InfoIcon />
                    </IconButton>
                    <Menu
                      {...bindMenu(popupState)}
                      PaperProps={{
                        sx: { width: "350px" },
                      }}
                    >
                      <MenuItem onClick={popupState.close}>
                        <Button onClick={handleLeave}>
                          Leave conversation
                        </Button>
                      </MenuItem>
                      <MenuItem onClick={popupState.close}>
                        <Button onClick={handleOpenModal}>
                          Add new member
                        </Button>
                      </MenuItem>

                      <Divider />
                      <MenuItem>
                        <Box>
                          <Typography
                            sx={{ mb: 1 }}
                            variant="body1"
                            color="text.primary"
                          >
                            {"MEMBERS"}
                          </Typography>
                          {currentRoom &&
                            currentRoom.roommembers.map((member, i) => {
                              return (
                                <Typography
                                  sx={{ mt: 1 }}
                                  key={i}
                                  variant="body1"
                                  color="text.primary"
                                >
                                  {member.membername}
                                </Typography>
                              );
                            })}
                        </Box>
                      </MenuItem>
                    </Menu>
                  </React.Fragment>
                )}
              </PopupState>
            </Box>
          </Toolbar>
        </Grid>
      </Paper>
      <Paper>
        <Grid>
          <Box
            className="chat-messages"
            sx={{ maxHeight: "100%", height: "72vh", mt: 2, mb: 2 }}
          >
            {roomMessages.map((message, i) => {
              return (
                <div ref={scrollRef} key={i}>
                  {message.type === "message" && !message.fromSelf ? (
                    <Box>
                      <Typography variant="caption">
                        {message.sendername}
                      </Typography>
                    </Box>
                  ) : (
                    ""
                  )}
                  <Box
                    className={
                      message.type === "message"
                        ? `message ${message.fromSelf ? "sended" : "received"}`
                        : "message-notif content-notif"
                    }
                  >
                    <Box
                      className={
                        message.type === "message"
                          ? `content ${
                              message.fromSelf
                                ? "content-sended"
                                : "content-recieved"
                            }`
                          : "content-notif"
                      }
                    >
                      <Typography variant="p">{message.message}</Typography>
                    </Box>
                  </Box>

                  {message.type === "message" && (
                    <Box
                      className={`message ${
                        message.fromSelf ? "sended" : "received"
                      }`}
                    >
                      <Typography variant="caption">
                        {message.createdAt}
                      </Typography>
                    </Box>
                  )}
                </div>
              );
            })}
          </Box>
        </Grid>
      </Paper>
      <ChatInput handleSendMsg={handleSendMsg} />
      {openModal && (
        <AddNewMember
          currentUser={currentUser}
          open={openModal}
          handleClose={handleCloseModal}
          handleMember={handleMember}
          roomMembers={currentRoom && currentRoom.roommembers}
        />
      )}
    </Container>
  );
}

export default RoomMessage;
