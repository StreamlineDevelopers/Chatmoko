import React, { useEffect, useState, useRef } from "react";
import { Device } from "@twilio/voice-sdk";
import { useNavigate } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import { io } from "socket.io-client";
import {
  host,
  getAllMessagesByUser,
  getRoomList,
  getAllSMSMessagesByUser,
  getInboundToken,
  getTurnCredentials,
} from "../utils/APIRoutes";
import axios from "axios";
import ChatDrawerMessage from "../components/ChatDrawerMessage";
import PersonalMessage from "./PersonalMessage";
import RoomMessage from "./RoomMessage";
import Welcome from "../components/Welcome";
import "./Chat.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SMSMessage from "../pages/SMSMessage";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [messageList, setMessageList] = useState([]);
  const [smsList, setSMSList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentSMS, setCurrentSMS] = useState(null);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [reloadMessageList, setReloadMessageList] = useState(true);
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [callerId, setCallerId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [callType, setCallType] = useState("");
  const [callData, setCallData] = useState();
  const [waitingCall, setWaitingCall] = useState(true);
  const [openSMSCallModal, setOpenSMSCallModal] = useState(false);
  const handleOpenSMSCallModal = () => setOpenSMSCallModal(true);
  const handleCloseSMSCallModal = () => setOpenSMSCallModal(false);
  const [smsCallAccepted, setsmsCallAccepted] = useState(false);
  const [smsCallEnded, setsmsCallEnded] = useState(false);
  const [smswaitingCall, setSMSWaitingCall] = useState(true);
  const [smsCallType, setSMSCallType] = useState("");
  const [smsCallerName, setSMSCallerName] = useState("");
  const [turnServer, setTurnServer] = useState([]);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const inboundCall = useRef();
  const outboundCall = useRef();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "white",
  };

  //GET CURRENT USER
  useEffect(() => {
    async function fetchData() {
      if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
        navigate("/login");
      } else {
        setCurrentUser(
          await JSON.parse(
            localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
          )
        );
        navigate("/welcome");
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function getTurnServers() {
      const response = await axios.get(getTurnCredentials);
      setTurnServer(response.data.token.iceServers);
    }
    getTurnServers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      async function setUpSMSDevices() {
        await axios
          .post(getInboundToken, {
            To: currentUser.mobilenumber,
          })
          .then((res) => {
            const device = new Device(res.data, {
              codecPreferences: ["opus", "pcmu"],
              fakeLocalDTMF: true,
              enableRingingState: true,
            });
            device.register();
            device.on("incoming", (call) => {
              inboundCall.current = call;
              setSMSCallType("inbound");
              handleOpenSMSCallModal();
              setSMSWaitingCall(false);
              setSMSCallerName(call.parameters.From);

              call.on("disconnect", function (conn) {
                setsmsCallAccepted(false);
                setsmsCallEnded(true);
                setSMSWaitingCall(true);
                setSMSCallerName("");
              });

              call.on("reject", function (conn) {
                setsmsCallAccepted(false);
                setsmsCallEnded(true);
                setSMSWaitingCall(true);
                setSMSCallerName("");
              });

              call.on("accept", function (conn) {
                setsmsCallAccepted(true);
                setsmsCallEnded(false);
                handleCloseSMSCallModal();
                setSMSWaitingCall(false);
              });
            });
          });
      }
      setUpSMSDevices();
    }
  }, [currentUser]);

  //SOCKET IO CONNECTIONS
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
      socket.current.on("call-user", (data) => {
        setCallData(data);
      });

      //USER HANG UP
      socket.current.on("user-hanged-up", (data) => {
        setReceivingCall(false);
        setCallEnded(true);
        setWaitingCall(true);
        setCallType("");
        toast.warn("User hanged-up", toastOptions);
      });

      //USER BUSY
      socket.current.on("user-is-busy", (data) => {
        setReceivingCall(false);
        setCallEnded(true);
        setWaitingCall(true);
        setCallType("");
        toast.warn("User is on another call", toastOptions);
      });

      //END CALL
      socket.current.on("end-call", (data) => {
        setReceivingCall(false);
        setCallType("");
        setCallAccepted(false);
        setWaitingCall(true);
        setCallEnded(true);
        toast.warn("User ended the call", toastOptions);
        userVideo.current.srcObject = null;
        myVideo.current.srcObject = null;
      });

      //UPDATE INBOX
      socket.current.on("chat-inbox", (data) => {
        setReloadMessageList(true);
      });
    }
  }, [currentUser]);
  //VALIDATE CALL
  useEffect(() => {
    if (callData) {
      if (!waitingCall) {
        socket.current.emit("user-is-busy", { to: callData.from });
      } else {
        setCallerSignal(callData.signal);
        setCallerName(callData.callername);
        setCallerId(callData.from);
        setReceiverId(callData.to);
        setCallEnded(false);
        setReceivingCall(true);
        setCallType(callData.calltype);
        setWaitingCall(false);
      }
    }
  }, [callData]);

  //MESSAGE INBOX LIST
  useEffect(() => {
    async function fetchMessageData() {
      if (currentUser && reloadMessageList) {
        const data = await axios.get(
          `${getAllMessagesByUser}/${currentUser._id}`
        );
        setMessageList(data.data);
        setReloadMessageList(false);
      }
    }
    fetchMessageData();
  }, [currentUser, reloadMessageList]);

  //SMS INBOX LIST
  useEffect(() => {
    async function fetchSMSData() {
      if (currentUser) {
        const data = await axios.get(
          `${getAllSMSMessagesByUser}/${currentUser.mobilenumber}`
        );
        setSMSList(data.data);
      }
    }
    fetchSMSData();
  }, [currentUser]);

  //ROOM LIST
  useEffect(() => {
    async function fetchRoomList() {
      if (currentUser) {
        const data = await axios.get(
          `${getRoomList}/${currentUser.fullname}/${currentUser._id}`
        );
        setRoomList(data.data);

        data.data.forEach((room) => {
          socket.current.emit("join-room", room);
        });
      }
    }
    fetchRoomList();
  }, [currentUser]);

  //SOCKET FOR ROOM
  useEffect(() => {
    if (currentRoom) {
      socket.current.emit("join-room", currentRoom);
    }
  }, [currentRoom]);

  //STREAMING CALL AND VIDEO
  useEffect(() => {
    if (callEnded === true && waitingCall === true) {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      if (connectionRef.current) {
        connectionRef.current.destroying = true;
        connectionRef.current.destroy();
      }
    }
  }, [callEnded, waitingCall]);

  useEffect(() => {
    if (callType !== "" && receivingCall) {
      navigator.mediaDevices
        .getUserMedia(
          callType === "audiostream"
            ? {
                video: false,
                audio: true,
              }
            : {
                video: true,
                audio: true,
              }
        )
        .then((stream) => {
          setStream(stream);
        })
        .catch((e) => {
          var message;
          switch (e.name) {
            case "NotFoundError":
            case "DevicesNotFoundError":
              message = "Please setup your webcam or audio first.";
              break;
            case "SourceUnavailableError":
              message = "Your webcam or audio is busy";
              break;
            case "PermissionDeniedError":
            case "SecurityError":
              message = "Permission denied!";
              break;
            default:
              toast.error(e, toastOptions);
              return;
          }
          toast.error(message, toastOptions);
          declineCall();
          // setCallEnded(true);
          // setReceivingCall(false);
          // setCallType("");
          // setWaitingCall(true);
          // socket.current.emit("user-hanged-up", { to: callerId });
          // leaveCall();
          // declineCall();
        });
    }
  }, [callType]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  const handleSMSChange = (sms) => {
    setCurrentSMS(sms);
  };

  const handleRoomChange = (room) => {
    setCurrentRoom(room);
  };

  const callUser = (auidoStream, videoStream) => {
    try {
      const callStream = auidoStream === null ? videoStream : auidoStream;
      const clltype = auidoStream === null ? "videostream" : "audiostream";

      setCallType(clltype);
      setCallEnded(false);
      setCallerName(currentChat.fullname);
      setCallerId(currentUser._id);
      setReceiverId(currentChat._id);
      setStream(callStream);
      setWaitingCall(false);

      const peer = new window.SimplePeer({
        initiator: true,
        trickle: false,
        stream: callStream,
        destroying: true,
        config: {
          iceServers: [...turnServer, { url: "stun:stun.1und1.de:3478" }],
          iceTransportPolicy: "relay",
        },
      });
      peer.on("signal", (data) => {
        socket.current.emit("call-user", {
          signalData: data,
          from: currentUser._id,
          to: currentChat._id,
          name: currentUser.fullname,
          calltype: clltype,
        });
      });

      peer.on("stream", (streamuser) => {
        userVideo.current.srcObject = streamuser;
        myVideo.current.srcObject = callStream;
      });

      socket.current.on("call-accepted", (signal) => {
        setCallAccepted(true);
        peer.signal(signal);
      });

      connectionRef.current = peer;

      peer.on("error", (error) => {
        toast.warn("User disconnected.", toastOptions);
        setCallEnded(true);
        setReceivingCall(false);
        setCallType("");
        setWaitingCall(true);
        setCallAccepted(false);
        if (connectionRef.current) {
          connectionRef.current.destroying = true;
          connectionRef.current.destroy();
        }
        if (stream) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        }
        userVideo.current.srcObject = null;
        myVideo.current.srcObject = null;
      });
    } catch (ex) {
      console.log(ex);
    }
  };

  const answerCall = () => {
    try {
      setCallAccepted(true);
      const peer = new window.SimplePeer({
        initiator: false,
        trickle: false,
        stream: stream,
        destroying: true,
        config: {
          iceServers: [...turnServer, { url: "stun:stun.1und1.de:3478" }],
          iceTransportPolicy: "relay",
        },
      });

      peer.on("error", (error) => {
        toast.warn("User disconnected.", toastOptions);
        setCallEnded(true);
        setReceivingCall(false);
        setCallType("");
        setWaitingCall(true);
        setCallAccepted(false);
        if (connectionRef.current) {
          connectionRef.current.destroying = true;
          connectionRef.current.destroy();
        }
        if (stream) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        }
        userVideo.current.srcObject = null;
        myVideo.current.srcObject = null;
      });

      peer.on("signal", (data) => {
        socket.current.emit("answer-call", {
          signal: data,
          to: callerId,
          from: receiverId,
        });
      });

      peer.on("stream", (streamuser) => {
        userVideo.current.srcObject = streamuser;
        myVideo.current.srcObject = stream;
      });

      peer.signal(callerSignal);
      connectionRef.current = peer;
    } catch (ex) {
      console.log(ex);
    }
  };

  const leaveCall = () => {
    socket.current.emit("user-hanged-up", { to: receiverId });
    setWaitingCall(true);
    setCallEnded(true);
    setCallType("");
    setReceivingCall(false);
  };

  const endCall = () => {
    socket.current.emit("end-call", {
      to: callerId !== currentUser._id ? callerId : receiverId,
      from: callerId !== currentUser._id ? receiverId : callerId,
    });
    setCallEnded(true);
    setReceivingCall(false);
    setCallType("");
    setWaitingCall(true);
    setCallAccepted(false);
    if (connectionRef.current) {
      connectionRef.current.destroying = true;
      connectionRef.current.destroy();
    }
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    userVideo.current.srcObject = null;
    myVideo.current.srcObject = null;
  };

  const declineCall = () => {
    socket.current.emit("user-hanged-up", { to: callerId });
    setCallEnded(true);
    setCallType("");
    setWaitingCall(true);
    setReceivingCall(false);
  };

  return (
    <ChatDrawerMessage
      currentUser={currentUser}
      changeChat={handleChatChange}
      changeSMS={handleSMSChange}
      messageList={messageList}
      changeRoom={handleRoomChange}
      roomList={roomList}
      receivingCall={receivingCall}
      endCall={endCall}
      declineCall={declineCall}
      callEnded={callEnded}
      callAccepted={callAccepted}
      answerCall={answerCall}
      myVideo={myVideo}
      userVideo={userVideo}
      callType={callType}
      callerName={callerName}
      SMSList={smsList}
      openSMSCallModal={openSMSCallModal}
      handleCloseSMSCallModal={handleCloseSMSCallModal}
      inboundCall={inboundCall.current}
      outboundCall={outboundCall.current}
      smsCallAccepted={smsCallAccepted}
      smsCallEnded={smsCallEnded}
      smsCallType={smsCallType}
      smswaitingCall={smswaitingCall}
      setSMSWaitingCall={setSMSWaitingCall}
      smsCallerName={smsCallerName}
      waitingCall={waitingCall}
    >
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route
          path="/pm"
          element={
            <PersonalMessage
              currentChat={currentChat}
              socket={socket}
              currentUser={currentUser}
              callUser={callUser}
              leaveCall={leaveCall}
              callEnded={callEnded}
              callAccepted={callAccepted}
              receivingCall={receivingCall}
              setReloadMessageList={setReloadMessageList}
              waitingCall={waitingCall}
            />
          }
        />
        <Route
          path="/room"
          element={
            <RoomMessage
              currentRoom={currentRoom}
              socket={socket}
              currentUser={currentUser}
            />
          }
        />
        <Route
          path="/sms"
          element={
            <SMSMessage
              currentSMS={currentSMS}
              currentUser={currentUser}
              changeSMS={handleSMSChange}
              smswaitingCall={smswaitingCall}
              openSMSCallModal={openSMSCallModal}
              handleOpenSMSCallModal={handleOpenSMSCallModal}
              handleCloseSMSCallModal={handleCloseSMSCallModal}
              setSMSWaitingCall={setSMSWaitingCall}
              setsmsCallAccepted={setsmsCallAccepted}
              setsmsCallEnded={setsmsCallEnded}
              outboundCall={outboundCall}
            />
          }
        />
      </Routes>
      <ToastContainer />
    </ChatDrawerMessage>
  );
}
