import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getSMSContacts, addContact, deleteContact } from "../utils/APIRoutes";
import { ListItemButton } from "@mui/material";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

function ContactList({ currentUser, open, handleClose, changeSMS }) {
  const navigate = useNavigate();
  const [members, setListMembers] = useState([]);
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "white",
  };
  useEffect(() => {
    const getAllContact = async () => {
      if (open) {
        const data = await axios.get(`${getSMSContacts}/${currentUser._id}`);
        setListMembers(data.data);
      }
    };
    getAllContact();
  }, [open]);

  const handleAddContact = async (event) => {
    event.preventDefault();
    if (contactName.length === 0 || contactNumber.length === 0) return;

    if (isValidPhoneNumber(contactNumber) === false) {
      toast.error("Invalid phone number", toastOptions);
      return;
    }

    const data = await axios.post(addContact, {
      userid: currentUser._id,
      usernumber: currentUser.mobilenumber,
      contactname: contactName,
      contactnumber: contactNumber,
    });

    if (data.data.status === false) {
      toast.error(data.data.message, toastOptions);
      return;
    }

    if (data.status) {
      setListMembers((prevValue) => [...prevValue, data.data.data]);

      setContactName("");
      setContactNumber("");
    }
  };

  const handleDeleteContact = async (contact) => {
    await axios.post(deleteContact, {
      id: contact._id,
      usernumber: currentUser.mobilenumber,
      contactnumber: contact.contactnumber,
    });
  };

  return (
    <Box>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Box>
            <TextField
              fullWidth
              label="Name"
              id="standard-basic"
              variant="standard"
              autoFocus
              value={contactName}
              onChange={(e) => {
                setContactName(e.target.value);
              }}
              sx={{ mb: 2 }}
            />
            {/* <TextField
              fullWidth
              type="number"
              label="Number"
              id="standard-basic"
              variant="standard"
              value={contactNumber}
              onChange={(e) => {
                setContactNumber(e.target.value);
              }}
            /> */}
            <PhoneInput
              className="phone-input"
              placeholder="Enter phone number *"
              value={contactNumber}
              onChange={setContactNumber}
              name="mobilenumber"
            />
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button variant="contained" onClick={handleAddContact}>
                Add
              </Button>
            </Box>
          </Box>
          <Box>
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
                          onClick={(e) => {
                            e.preventDefault();
                            if (data.id !== currentUser._id) {
                              setListMembers(
                                members.filter(
                                  (item) =>
                                    item.contactname !== data.contactname
                                )
                              );
                              handleDeleteContact(data);
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemButton
                        onClick={() => {
                          const contact = {
                            fullname: data.contactname,
                            contactnumber: data.contactnumber,
                          };
                          changeSMS(contact);
                          navigate("/sms");
                          handleClose();
                        }}
                        sx={{ p: 0 }}
                      >
                        <ListItemText
                          primary={data.contactname}
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: "inline" }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {data.contactnumber}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button variant="contained" onClick={handleClose}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
      <ToastContainer />
    </Box>
  );
}

export default ContactList;
