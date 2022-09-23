import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ChatMessages from "./ChatMessages";
import Rooms from "./Rooms";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Link";
import ChatHeader from "./ChatHeader";
import axios from "axios";
import { searchRoute } from "../utils/APIRoutes";
import { useNavigate } from "react-router-dom";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import Button from "@mui/material/Button";
import CreateNewRoom from "./CreateNewRoom";
import CallModal from "./CallModal";
import CallContainer from "./CallContainer";
import SMSMessages from "./SMSMessages";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Avatar, Grid } from "@mui/material";
import ContactList from "./ContactList";
import SMSCallModal from "./SMSCallModal";
import "react-toastify/dist/ReactToastify.css";
import { styled, useTheme } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";

const drawerWidth = 350;
const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(1),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));
export default function DrawerComponent({
  currentUser,
  children,
  changeChat,
  messageList,
  changeRoom,
  roomList,
  receivingCall,
  callEnded,
  callAccepted,
  answerCall,
  myVideo,
  userVideo,
  callerName,
  declineCall,
  endCall,
  callType,
  changeSMS,
  SMSList,
  openSMSCallModal,
  handleCloseSMSCallModal,
  inboundCall,
  outboundCall,
  smsCallAccepted,
  smsCallEnded,
  smsCallType,
  smswaitingCall,
  smsCallerName,
  waitingCall,
  setSMSWaitingCall,
}) {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState([]);
  const [openRoomModal, setOpenRoomModal] = useState(false);
  const handleOpenRoomModal = () => setOpenRoomModal(true);
  const handleCloseRoomModal = () => setOpenRoomModal(false);
  const [openContactModal, setOpenContactModal] = useState(false);
  const handleOpenContactModal = () => setOpenContactModal(true);
  const handleCloseContactModal = () => setOpenContactModal(false);
  const [openCallModal, setOpenCallModal] = useState(false);
  const handleOpenCallModal = () => setOpenCallModal(true);
  const handleCloseCallModal = () => setOpenCallModal(false);
  const [value, setValue] = React.useState("1");
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSearch = async (event) => {
    if (event.target.value.length > 0) {
      event.preventDefault();
      const data = await axios.get(
        `${searchRoute}/${event.target.value}/${currentUser._id}`
      );
      setSearchData(data.data);
    } else {
      setSearchData([]);
    }
  };

  useEffect(() => {
    if (receivingCall && callEnded === false) {
      handleOpenCallModal();
    } else if (receivingCall === false && callEnded === true) {
      handleCloseCallModal();
    }
  }, [receivingCall, callEnded]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <ChatHeader
            currentUser={currentUser}
            smsCallAccepted={smsCallAccepted}
            smsCallEnded={smsCallEnded}
            inboundCall={inboundCall}
            outboundCall={outboundCall}
            smsCallType={smsCallType}
            waitingCall={waitingCall}
            smswaitingCall={smswaitingCall}
            setSMSWaitingCall={setSMSWaitingCall}
          />
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ position: "absolute", left: 0, ml: 3 }}
          >
            Chatmoko
          </Typography>

          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <React.Fragment>
                <Fab
                  aria-label="add"
                  color="success"
                  sx={{ width: "40px", height: "40px" }}
                  onClick={() => {
                    setSearchData("");
                  }}
                >
                  <AddIcon {...bindTrigger(popupState)} />
                </Fab>

                <Menu
                  {...bindMenu(popupState)}
                  PaperProps={{
                    sx: { width: "350px" },
                  }}
                >
                  <MenuItem>
                    <TextField
                      component="span"
                      fullWidth
                      id="standard-basic"
                      label="Search a user"
                      variant="standard"
                      onChange={handleSearch}
                      autoFocus
                    />
                  </MenuItem>
                  <Divider />
                  {searchData.length !== 0 &&
                    searchData.map((data, i) => {
                      return (
                        <MenuItem key={i} onClick={popupState.close}>
                          <Avatar src="/" alt={data.fullname} />
                          <Button
                            onClick={() => {
                              changeChat(data);
                              setSearchData([]);
                              navigate("/pm");
                              handleDrawerClose();
                            }}
                          >
                            {data.fullname}
                          </Button>
                        </MenuItem>
                      );
                    })}

                  <Divider />
                  <MenuItem onClick={popupState.close}>
                    <Button onClick={handleOpenContactModal}>Contacts</Button>
                  </MenuItem>
                  <MenuItem onClick={popupState.close}>
                    <Button onClick={handleOpenRoomModal}>
                      Create new room
                    </Button>
                  </MenuItem>
                  <MenuItem onClick={popupState.close}>
                    <Button
                      onClick={() => {
                        changeSMS(null);
                        navigate("/sms");
                        handleDrawerClose();
                      }}
                    >
                      Create new sms message
                    </Button>
                  </MenuItem>
                </Menu>
              </React.Fragment>
            )}
          </PopupState>

          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <>
          <TabContext value={value}>
            <TabList variant="fullWidth" onChange={handleTabChange}>
              <Tab label="CHAT " value="1" />
              <Tab label="SMS" value="2" />
            </TabList>

            <TabPanel value="1" sx={{ p: 0 }}>
              <ChatMessages
                messageList={messageList}
                currentUser={currentUser}
                changeChat={changeChat}
                handleDrawerClose={handleDrawerClose}
              />
              <Divider />
              <Rooms
                roomList={roomList}
                currentUser={currentUser}
                changeRoom={changeRoom}
                handleDrawerClose={handleDrawerClose}
              />
            </TabPanel>
            <TabPanel value="2" sx={{ p: 0 }}>
              <SMSMessages
                SMSList={SMSList}
                currentUser={currentUser}
                changeSMS={changeSMS}
                handleDrawerClose={handleDrawerClose}
              />
            </TabPanel>
          </TabContext>
        </>
      </Drawer>
      <Main open={open}>
        <Toolbar />
        <Grid>
          {callAccepted && callEnded === false ? (
            <CallContainer
              myVideo={myVideo}
              userVideo={userVideo}
              endCall={endCall}
              declineCall={declineCall}
              callType={callType}
            />
          ) : null}
          {children}
        </Grid>
      </Main>
      {openRoomModal && (
        <CreateNewRoom
          currentUser={currentUser}
          open={openRoomModal}
          handleClose={handleCloseRoomModal}
          changeRoom={changeRoom}
          handleDrawerClose={handleDrawerClose}
        />
      )}

      {openCallModal && (
        <CallModal
          open={openCallModal}
          handleClose={handleCloseCallModal}
          callerName={callerName}
          receivingCall={receivingCall}
          declineCall={declineCall}
          answerCall={answerCall}
        />
      )}

      {openContactModal && (
        <ContactList
          currentUser={currentUser}
          open={openContactModal}
          handleClose={handleCloseContactModal}
          changeSMS={changeSMS}
        />
      )}

      {smswaitingCall === false && (
        <SMSCallModal
          open={openSMSCallModal}
          handleClose={handleCloseSMSCallModal}
          call={inboundCall}
          inboundCall={true}
          smsCallType={smsCallType}
          smsCallerName={smsCallerName}
        />
      )}
    </Box>
  );
}
