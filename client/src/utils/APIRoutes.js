export const host = "https://chatmoko-final-server.herokuapp.com"; //"https://chatmoko-server.herokuapp.com"; //"http://192.168.0.101:3001"; //"http://localhost:3001";
//USER
export const registerRoute = `${host}/api/user/register`;
export const loginRoute = `${host}/api/user/login`;
export const logoutRoute = `${host}/api/user/logout`;
export const searchRoute = `${host}/api/user/search`;
export const searchByNumberRoute = `${host}/api/user/searchbynumber`;

//CHAT MESSAGE
export const getAllMessagesByUser = `${host}/api/chatmessage/getallmessage`;
export const getMessagesByUser = `${host}/api/chatmessage/getmessage`;
export const sendPersonalMessage = `${host}/api/chatmessage/sendpm`;

//ROOM
export const createRoom = `${host}/api/room/createroom`;
export const getRoomMessages = `${host}/api/room/getroommessages`;
export const getRoomList = `${host}/api/room/getroombyuser`;
export const sendRoomMessage = `${host}/api/room/sendroommessage`;
export const leaveRoom = `${host}/api/room/leaveroom`;
export const addMember = `${host}/api/room/addnewmember`;

//SMS MESSAGE
export const getAllSMSMessagesByUser = `${host}/api/sms/getallmessage`;
export const getSMSMessagesByUser = `${host}/api/sms/getmessage`;
export const sendSMSMessage = `${host}/api/sms/sendtext`;
export const getSMSContacts = `${host}/api/sms/getallcontacts`;
export const addContact = `${host}/api/sms/addcontact`;
export const deleteContact = `${host}/api/sms/deletecontact`;

//SMS CALL
export const getOutboundToken = `${host}/api/sms/getoutboundtoken`;
export const getInboundToken = `${host}/api/sms/getinboundtoken`;

//TURN SERVER
export const getTurnCredentials = `${host}/api/sms/getturncredentials`;
