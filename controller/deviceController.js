import mongoose from "mongoose";
import USER from "../model/userModel.js";
import DEVICE from "../model/deviceModel.js";
import KIT from "../model/kitModel.js";

const fetchDevices = async (req, res) => {
  try {
    const devices = await mongoose.connection.db
      .collection("devices")
      .find({})
      .toArray();
    res.status(200).send({ success: true, devices: devices });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const linkKit = async (req, res) => {
  const { kitId } = req.body;
  const { email } = req.user;
  if (!email) {
    return res.status(200).send({
      success: false,
      message: "Something went wrong",
    });
  }
  if (!kitId) {
    return res.status(400).send({
      success: false,
      message: "Kit ID is required",
    });
  }
  if (kitId > 99999 || kitId < 99000) {
    return res.status(400).send({
      success: false,
      message: "Invalid Kit Id",
    });
  }
  try {
    let user = await USER.findOne({ email: email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    let findKit = await KIT.findOne({ kitId });
    if (!findKit) {
      return res.status(400).json({
        success: false,
        message: "No Kit found with ID provided",
      });
    }
    const existingUserWithKitId = await USER.findOne({ kitId });
    if (existingUserWithKitId) {
      return res.status(400).json({
        success: false,
        message: "Kit Id already assigned with another user",
      });
    }
    user.kitId = kitId;
    user.patientStatus = "patientLinked";
    await user.save();
    return res.json({
      success: true,
      message: "KitId added successfully",
      kitId: user.kitId,
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const connectDevice = async (req, res) => {
  const { deviceId, deviceType } = req.body;
  const { email } = req.user;
  if (!deviceId) {
    return res.status(400).send({
      success: false,
      message: "Device ID is required",
    });
  }
  if (!deviceType) {
    return res.status(400).send({
      success: false,
      message: "Device Type is required",
    });
  }
  const devices = await mongoose.connection.db
    .collection("devices")
    .find({ deviceCode: deviceId })
    .toArray();
  const device = devices[0];
  if (!device) {
    return res.status(404).send({
      success: false,
      message: "Device not found",
    });
  }
  const findDevices = await DEVICE.findOne({ userEmail: email });
  const linkedDevices = findDevices?.connectedDevices;
  if (linkedDevices) {
    // const isAlreadyLinkedDevice = linkedDevices?.find(
    //   (device) => device && device["deviceCode"] === deviceId
    // );
    const isAlreadyLinkedDeviceType = linkedDevices?.find(
      (device) => device && device["type"] === deviceType
    );
    if (isAlreadyLinkedDeviceType) {
      return res.status(400).send({
        success: false,
        message:
          deviceType === "bp"
            ? "BP device is already paired"
            : "Weight device is already paired",
      });
    }
  }
  try {
    let user = await USER.findOne({ email: email });
    user.patientStatus = "devicePaired";
    if (findDevices) {
      findDevices.connectedDevices = [
        ...findDevices.connectedDevices,
        { ...devices, isPared: "true" },
      ];
      await user.save();
      await findDevices.save();
      return res.status(200).json({
        success: true,
        message: "Device paired successfully",
      });
    } else {
      const connectedDevices = new DEVICE({
        userEmail: email,
        connectedDevices: { ...devices, isPaired: "true" },
      });
      await user.save();
      await connectedDevices.save();
      return res.status(200).json({
        success: true,
        message: "Device paired successfully",
      });
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const pairUnpairDevice = async (req, res) => {
  const { deviceId, isPaired } = req.body;
  const { email } = req.user;
  if (!deviceId) {
    return res.status(400).send({
      success: false,
      message: "Device ID is required",
    });
  }
  if (!action) {
    return res.status(400).send({
      success: false,
      message: "Device Action is required",
    });
  }
  try {
    const updatedUser = await DEVICE.updateOne(
      { userEmail: email },
      { $set: { connectedDevices: { isPaired: isPaired } } },
      { upsert: false, new: true }
    );
    if (!updatedUser.modifiedCount) {
      return res.status(400).send({
        success: false,
        message: "Device not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: isPaired
        ? "Device paired successfully"
        : "Device unpaired successfully",
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const getConnectDevices = async (req, res) => {
  const { email } = req.user;
  try {
    const findDevices = await DEVICE.findOne({ userEmail: email });
    const linkedDevices = findDevices?.connectedDevices;
    res.status(200).send({ success: true, devices: linkedDevices });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

export {
  fetchDevices,
  linkKit,
  connectDevice,
  pairUnpairDevice,
  getConnectDevices,
};
