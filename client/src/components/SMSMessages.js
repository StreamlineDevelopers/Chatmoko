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

export default function SMSMessages({
  SMSList,
  currentUser,
  changeSMS,
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
      {SMSList.map((message, i) => {
        return (
          <Box key={i}>
            <ListItem alignItems="flex-start" sx={{ p: 0 }}>
              <ListItemButton
                onClick={() => {
                  const user = {
                    mobilenumber: message.displayId,
                    fullname: message.displayName,
                  };
                  changeSMS(user);
                  navigate("/sms");
                  handleDrawerClose();
                }}
              >
                <ListItemAvatar>
                  <Avatar alt={message.displayName} src="/" />
                </ListItemAvatar>
                <ListItemText>
                  <React.Fragment>
                    <Box>
                      <Typography variant="body2" color="text.primary">
                        {message.displayName
                          ? message.displayName
                          : message.displayId}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="caption" color="text.primary">
                          {(message.fromSelf ? "You: " : "") +
                            message.displayMessage.substring(0, 15) +
                            "..."}
                        </Typography>
                        <Typography variant="caption" color="text.primary">
                          {message.displayDate}
                        </Typography>
                      </Box>
                    </Box>
                  </React.Fragment>
                </ListItemText>
              </ListItemButton>
            </ListItem>
            <Divider variant="inset" component="li" />
          </Box>
        );
      })}
    </List>
  );
}
