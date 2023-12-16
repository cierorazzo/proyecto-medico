const express = require("express");
const {authMiddleware, isAdmin} = require("../middlewares/authMiddleware");
const {
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  handleRefreshToken,
  logout
} = require("../controller/userCtrl");

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.get("/all-users", getallUser);
router.get("/refresh",handleRefreshToken);
router.get("/logout", logout)
router.get("/:id", authMiddleware, isAdmin, getaUser);
router.delete("/:id", deleteaUser);
router.put("/edit-user",authMiddleware, updatedUser);


module.exports = router;
