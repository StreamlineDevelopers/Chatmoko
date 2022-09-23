import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";

function ChatInput({ handleSendMsg }) {
  const [message, setMessage] = useState("");

  const sendChat = (event) => {
    event.preventDefault();
    if (message.length > 0) {
      handleSendMsg(message, "message");
      setMessage("");
    }
  };

  return (
    <Paper
      sx={{
        height: "8vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Grid sx={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          {/* <Box>
            <IconButton onClick={handleEmojiPickerhideShow}>
              <EmojiEmotionsIcon />
            </IconButton>
            {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
          </Box> */}

          <TextField
            fullWidth
            id="filled-textarea"
            label="Message"
            multiline
            variant="filled"
            maxRows={1.5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendChat(e);
              }
            }}
          />
          <IconButton onClick={sendChat}>
            <SendIcon />
          </IconButton>
        </Box>
      </Grid>
    </Paper>
  );
}

export default ChatInput;
