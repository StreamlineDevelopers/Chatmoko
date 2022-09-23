import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

export default function Rooms({
  roomList,
  currentUser,
  changeRoom,
  handleDrawerClose,
}) {
  const navigate = useNavigate();

  return (
    <List
      sx={{
        height: "45vh",
        width: "100%",
        maxWidth: 360,
        bgcolor: "background.paper",
        overflow: "auto",
      }}
    >
      {roomList &&
        roomList.map((room, i) => {
          return (
            <Box key={i}>
              <ListItem alignItems="flex-start" sx={{ p: 0 }}>
                <ListItemButton
                  onClick={() => {
                    const data = {
                      roomname: room.roomname,
                      roommembers: room.roomMembers,
                    };
                    changeRoom(data);
                    navigate("/room");
                    handleDrawerClose();
                  }}
                >
                  <ListItemAvatar>
                    <Avatar alt={room.roomname} src="/" />
                  </ListItemAvatar>
                  <ListItemText
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {room.roomname}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <Divider variant="inset" component="li" />
            </Box>
          );
        })}
    </List>
  );
}
