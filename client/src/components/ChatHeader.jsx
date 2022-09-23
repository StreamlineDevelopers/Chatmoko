import React from "react";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Fab from "@mui/material/Fab";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { Typography } from "@mui/material";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { logoutRoute } from "../utils/APIRoutes";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ChatHeader({
  currentUser,
  smsCallAccepted,
  smsCallEnded,
  inboundCall,
  outboundCall,
  smsCallType,
  waitingCall,
  smswaitingCall,
  setSMSWaitingCall,
}) {
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "white",
  };
  const navigate = useNavigate();
  const [anchorElprofile, setAnchorElprofile] = React.useState(null);
  const openprofile = Boolean(anchorElprofile);

  const handleClickProfile = (event) => {
    setAnchorElprofile(event.currentTarget);
  };
  const handleCloseProfile = async () => {
    setAnchorElprofile(null);
  };

  const handleLogout = async (event) => {
    if (!waitingCall || !smswaitingCall) {
      toast.warn("Kindly end current call before logging out.", toastOptions);
      return;
    }

    event.preventDefault();
    const { data } = await axios.get(`${logoutRoute}/${currentUser._id}`);
    if (data.status === true) {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <Toolbar
      sx={{
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      {smsCallAccepted && !smsCallEnded ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Typography>ON GOING SMS CALL </Typography>
          <IconButton
            onClick={() => {
              smsCallType === "inbound"
                ? inboundCall.disconnect()
                : outboundCall.disconnect();
              setSMSWaitingCall(true);
            }}
          >
            <CallEndIcon color="error" />
          </IconButton>
        </Box>
      ) : null}

      <Box sx={{ position: "absolute", right: 0 }}>
        <Fab
          aria-label="add"
          color="white"
          sx={{ width: "40px", height: "40px" }}
        >
          <Avatar
            onClick={handleClickProfile}
            alt={currentUser !== undefined ? currentUser.fullname : ""}
            src="/static/images/avatar/1.jpg"
          />
        </Fab>
        <Menu
          id="basic-menu"
          anchorEl={anchorElprofile}
          open={openprofile}
          onClose={handleCloseProfile}
          PaperProps={{
            sx: { width: "350px" },
          }}
        >
          <MenuItem>
            {currentUser !== undefined ? currentUser.fullname : ""}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    </Toolbar>
  );
}

export default ChatHeader;
