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
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router-dom";

export default function ChatMessages({
  messageList,
  currentUser,
  changeChat,
  handleDrawerClose,
}) {
  const navigate = useNavigate();

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
    <List
      sx={{
        height: "43vh",
        width: "100%",
        maxWidth: 360,
        bgcolor: "background.paper",
        overflow: "auto",
      }}
    >
      {messageList.map((message, i) => {
        return (
          <Box key={i}>
            <ListItem alignItems="flex-start" sx={{ p: 0 }}>
              <ListItemButton
                onClick={() => {
                  const user = {
                    _id: message.displayId,
                    fullname: message.displayName,
                    isOnline: message.isOnline,
                  };
                  changeChat(user);
                  navigate("/pm");
                  handleDrawerClose();
                }}
              >
                <ListItemAvatar>
                  <Stack direction="row">
                    {message.isOnline ? (
                      <StyledBadgeOnline
                        overlap="circular"
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        variant="dot"
                      >
                        <Avatar alt={message.displayName} src="/" />
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
                        <Avatar alt={message.displayName} src="/" />
                      </StyledBadgeOffline>
                    )}
                  </Stack>
                </ListItemAvatar>
                <ListItemText>
                  <React.Fragment>
                    <Box>
                      <Typography variant="body2" color="text.primary">
                        {message.displayName}
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
