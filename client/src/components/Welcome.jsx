import React from "react";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Parrot from "../assets/welcome.png";

function Welcome() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
      }}
    >
      <Box sx={{ p: 3 }}>
        <Avatar
          variant={"rounded"}
          alt="The image"
          src={Parrot}
          style={{
            width: 200,
            height: 200,
          }}
        />
      </Box>

      <Box>
        <Typography sx={{ fontSize: "25px" }}>
          Select a conversation{" "}
        </Typography>
      </Box>
    </Box>
  );
}

export default Welcome;
