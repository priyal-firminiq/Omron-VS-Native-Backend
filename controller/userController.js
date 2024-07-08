import USER from "../model/userModel.js";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .send({ success: false, message: "All input fields are required" });
  }
  const findUser = await USER.findOne({ email: email });
  if (findUser) {
    return res
      .status(400)
      .send({ success: false, message: "User already registered" });
  }
  try {
    const user = new USER({
      name,
      email,
      password,
    });
    await user.save();
    const savedUser = await USER.findOne({ email: email });
    const accessToken = jwt.sign(
      {
        userID: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: "1D" }
    );
    return res.status(201).send({
      success: true,
      message: "We have sent a verification mail to your registered email",
      user: {
        name: savedUser.name,
        email: savedUser.email,
        accessToken: accessToken,
      },
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .send({ success: false, message: "All input fields are required" });
  }
  const user = await USER.findOne({ email: email });
  if (!user) {
    return res
      .status(400)
      .send({ success: false, message: "Email or password isn't valid" });
  } else {
    try {
      if (password === user.password) {
        const accessToken = jwt.sign(
          {
            userID: user._id,
            name: user.name,
            email: user.email,
          },
          process.env.JWT_SECRET_TOKEN,
          { expiresIn: "1D" }
        );
        return res.status(200).send({
          success: true,
          message: "Logged in successfully",
          user: {
            name: user.name,
            email: user.email,
            kitId: user.kitId,
            accessToken: accessToken,
          },
        });
      } else {
        return res
          .status(400)
          .send({ success: false, message: "Email or password isn't valid" });
      }
    } catch (error) {
      return res.status(400).send(error.message);
    }
  }
};

const forgotPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .send({ success: false, message: "All input fields are required" });
  }
  try {
    await USER.findOneAndUpdate(
      { email: email },
      { password: password },
      { new: true }
    ).then((updatedUser) => {
      if (!updatedUser) {
        return res
          .status(404)
          .send({ success: false, message: "User not found" });
      } else {
        return res
          .status(200)
          .send({ success: true, message: "Password updated successfully" });
      }
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const changePassword = async (req, res) => {
  const { password } = req.body;
  const { email } = req.user;
  if (!password) {
    return res
      .status(400)
      .send({ success: false, message: "Password is required" });
  }
  try {
    await USER.findOneAndUpdate(
      { email: email },
      { password: password },
      { new: true }
    ).then((updatedUser) => {
      if (!updatedUser) {
        return res
          .status(404)
          .send({ success: false, message: "User not found" });
      } else {
        return res
          .status(200)
          .send({ success: true, message: "Password updated successfully" });
      }
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const addDOB = async (req, res) => {
  const { dob } = req.body;
  const { email } = req.user;
  if (!dob) {
    return res.send({
      success: false,
      message: "DOB is required",
    });
  }
  try {
    let user = await USER.findOne({ email: email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.dob = dob;
    await user.save();
    return res.json({ success: true, message: "DOB added successfully" });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const verifyEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.send({
      success: false,
      message: "Email is required",
    });
  }
  try {
    let user = await USER.findOne({ email: email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email is not valid" });
    }
    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const getProfileInfo = async (req, res) => {
  const { email } = req.user;
  try {
    let user = await USER.findOne({ email: email });
    const profileData = {
      id: user._id,
      name: user.name,
      email: user.email,
      dob: user.dob,
      kitId: user.kitId,
      phoneNo: 1234567890,
    };
    return res.json({ success: true, profileData });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

export {
  registerUser,
  loginUser,
  forgotPassword,
  addDOB,
  verifyEmail,
  changePassword,
  getProfileInfo,
};
