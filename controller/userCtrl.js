const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const jwt = require("jsonwebtoken");
const util = require('util');
const verifyJwt = util.promisify(jwt.verify);

const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    // Creo un nuevo usuario
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("Este usuario ya existe");
  }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // compruebo si el usuario existe o no
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateuser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Credencial inválida");
  }
});

// Manejo refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token");

  const refreshToken = cookie.refreshToken;
  const decoded = await verifyJwt(refreshToken, process.env.JWT_SECRET);

  const filter = { _id: decoded.id, refreshToken: refreshToken };
  const update = { $set: { refreshToken: generateRefreshToken(decoded.id) } };
  const options = { new: true };

  const updatedUser = await User.findOneAndUpdate(filter, update, options);

  if (!updatedUser) throw new Error("No Refresh Token en la base de datos");
  
  const accessToken = generateToken(updatedUser._id);
  res.json({ accessToken });
});





// Logout functionality
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken)
    throw new Error("No Refresh Token en la base de datos ");

  const refreshToken = cookie.refreshToken;
  const filter = { refreshToken: refreshToken };
  const update = { $set: { refreshToken: "" } };
  const options = { new: true };
  const updatedUser = await User.findOneAndUpdate(filter, update, options);

  if (!updatedUser) {
    res.clearCookie("refreshToken", { httpOnly: true, secure: true });
    return res.sendStatus(204);
  }

  res.clearCookie("refreshToken", { httpOnly: true, secure: true });
  res.sendStatus(204);
});

// Actualizar un usuario
const updatedUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// Mostrar todos los usuarios
const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// Mostrar un usuario
const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Eliminar un usuario
const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  handleRefreshToken,
  logout,
};
