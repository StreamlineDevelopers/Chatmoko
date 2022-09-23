import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import axios from "axios";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

import { useNavigate } from "react-router-dom";
import { createRoom } from "../utils/APIRoutes";
import SearchRoomMember from "./SearchRoomMember";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function CreateNewRoom({
  currentUser,
  open,
  handleClose,
  changeRoom,
  handleDrawerClose,
}) {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [members, setListMembers] = useState([]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (roomName !== "" && members.length !== 0) {
      await axios.post(createRoom, {
        createdBy: currentUser._id,
        roomname: roomName,
        roommembers: members,
        createdName: currentUser.fullname,
      });
      const data = {
        createdBy: currentUser._id,
        roomname: roomName,
        roommembers: members,
      };

      handleClose();
      changeRoom(data);
      navigate("/room");
      handleDrawerClose();
    }
  };

  return (
    <Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Room name
            </Typography>
            <TextField
              fullWidth
              id="standard-basic"
              variant="standard"
              autoFocus
              onChange={(e) => {
                setRoomName(e.target.value);
              }}
            />
          </Box>
          <Box>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Members
            </Typography>
            <>
              <SearchRoomMember
                currentUser={currentUser}
                setListMembers={setListMembers}
                list={members}
                byFullName={true}
              />
            </>
            <Paper sx={{ height: "150px", mt: 2, overflow: "auto" }}>
              <List>
                {members.map((data, i) => {
                  return (
                    <ListItem
                      key={i}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => {
                            if (data.id !== currentUser._id) {
                              setListMembers(
                                members.filter(
                                  (item) => item.membername !== data.membername
                                )
                              );
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={data.membername} />
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button variant="contained" onClick={handleCreate}>
              Create
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default CreateNewRoom;
