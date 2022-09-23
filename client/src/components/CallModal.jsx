import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { Avatar, Button, Typography } from "@mui/material";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import CallEndIcon from "@mui/icons-material/CallEnd";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 350,
  height: 350,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

function CallModal({
  open,
  handleClose,
  callerName,
  receivingCall,
  leaveCall,
  answerCall,
  callAccepted,
  declineCall,
}) {
  useEffect(() => {
    if (callAccepted) {
      handleClose();
    }
  }, [callAccepted]);
  return (
    <Box>
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                mb: "20px",
              }}
            >
              <Typography variant="h6" sx={{ mb: "10px" }}>
                {!receivingCall
                  ? `Calling ${callerName} ...`
                  : `${callerName} is calling...`}
              </Typography>
              <Avatar
                src="/"
                alt={callerName}
                sx={{ width: "180px", height: "180px" }}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {!receivingCall ? (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CallEndIcon />}
                  sx={{ ml: "10px" }}
                  onClick={() => {
                    handleClose();
                    leaveCall();
                  }}
                >
                  HANG UP
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PhoneInTalkIcon />}
                    sx={{ mr: "10px" }}
                    onClick={() => {
                      handleClose();
                      answerCall();
                    }}
                  >
                    ACCEPT
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CallEndIcon />}
                    sx={{ ml: "10px" }}
                    onClick={() => {
                      handleClose();
                      declineCall();
                    }}
                  >
                    DECLINE
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default CallModal;
