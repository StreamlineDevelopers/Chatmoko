import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
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

function AddNewMember({
  currentUser,
  open,
  handleClose,
  handleMember,
  roomMembers,
}) {
  const [members, setListMembers] = useState([]);

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
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Members
            </Typography>
            <>
              <SearchRoomMember
                currentUser={currentUser}
                setListMembers={setListMembers}
                byFullName={true}
                list={roomMembers}
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
            <Button
              variant="contained"
              onClick={() => {
                members.length !== 0 && handleMember(members);
                setListMembers([]);
              }}
            >
              ADD
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default AddNewMember;
