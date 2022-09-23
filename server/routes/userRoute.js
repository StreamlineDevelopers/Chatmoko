const {
  registerNewUser,
  login,
  searchUser,
  searchUserByMobileNumber,
  logout,
} = require("../controllers/userController");
const router = require("express").Router();

router.post("/register", registerNewUser);
router.post("/login", login);
router.get("/logout/:id", logout);
router.get("/search/:value/:id", searchUser);
router.get("/searchbynumber/:value/:id", searchUserByMobileNumber);

module.exports = router;
