import React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { Avatar } from "@mui/material";

function VideoContainer({ myVideo, userVideo, endCall, callType }) {
  return (
    <Box sx={{ mt: 2, height: "36vh", bgcolor: "white" }}>
      <Grid
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            bgcolor: "white",
            width: "500px",
            height: "300px",
            pt: 4,
          }}
        >
          {callType === "audiostream" && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Avatar
                src="/"
                alt=""
                style={{ width: "300px", height: "230px", ml: 5 }}
              />
            </Box>
          )}

          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            style={{ width: "500px", height: "230px" }}
          />
        </Box>
        <Box>
          <IconButton color="error" sx={{ width: "50px" }} onClick={endCall}>
            <CallEndIcon fontSize="large" />
          </IconButton>
        </Box>
        <Box
          sx={{
            bgcolor: "white",
            width: "500px",
            height: "300px",
            pt: 4,
          }}
        >
          {callType === "audiostream" && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Avatar
                src="/"
                alt=""
                style={{ width: "300px", height: "230px" }}
              />
            </Box>
          )}
          <video
            playsInline
            ref={userVideo}
            autoPlay
            style={{ width: "500px", height: "230px" }}
          />
        </Box>
      </Grid>
    </Box>
  );
}

export default VideoContainer;
