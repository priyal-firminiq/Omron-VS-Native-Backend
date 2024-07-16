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
  device.pairStatus = "pair";
  const findDevices = await DEVICE.findOne({ userEmail: email });
  const linkedDevices = findDevices?.connectedDevices;
  if (linkedDevices) {
    const isAlreadyLinkedDevice = linkedDevices?.find(
      (device) => device && device["deviceCode"] === deviceId
    );
    const isAlreadyLinkedDeviceType = linkedDevices?.find(
      (device) => device && device["type"] === deviceType
    );
    if (isAlreadyLinkedDeviceType || isAlreadyLinkedDevice) {
      return res.status(400).send({
        success: false,
        message:
          deviceType === "bp"
            ? "BP device or device with same code is already paired"
            : "Weight device or device with same code is already paired",
      });
    }
  }
  try {
    let user = await USER.findOne({ email: email });
    user.patientStatus = "devicePaired";
    if (findDevices) {
      findDevices.connectedDevices = [...findDevices.connectedDevices, device];
      await user.save();
      await findDevices.save();
      return res.status(200).json({
        success: true,
        message: "Device paired successfully",
      });
    } else {
      const connectedDevices = new DEVICE({
        userEmail: email,
        connectedDevices: devices,
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

const removeConnectdDevice = async (req, res) => {
  const { deviceId } = req.body;
  const { email } = req.user;
  if (!deviceId) {
    return res.status(400).send({
      success: false,
      message: "Device ID is required",
    });
  }
  try {
    const updatedUser = await DEVICE.updateOne(
      { userEmail: email },
      { $pull: { connectedDevices: { deviceCode: deviceId } } },
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
      message: "Device unpaired successfully",
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const pairUnpairDevice = async (req, res) => {
  const { deviceId, pairStatus } = req.body;
  const { email } = req.user;
  if (!deviceId || !pairStatus) {
    return res.status(400).send({
      success: false,
      message: "Device ID and Status both are required",
    });
  }
  if (pairStatus !== "pair" && pairStatus !== "unpair") {
    return res.status(400).send({
      success: false,
      message: "Please send correct pair status",
    });
  }
  try {
    const deviceData = await DEVICE.findOne({ userEmail: email });
    if (!deviceData) {
      return res.status(400).send({
        success: false,
        message: "User not found",
      });
    }
    const deviceIndex = deviceData.connectedDevices.findIndex(
      (device) => device.deviceCode === deviceId
    );
    if (deviceIndex === -1) {
      return res.status(400).send({
        success: false,
        message: "Device not found",
      });
    }
    deviceData.connectedDevices[deviceIndex].pairStatus = pairStatus;
    await deviceData.save();
    return res.status(200).json({
      success: true,
      message:
        pairStatus === "pair"
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
  removeConnectdDevice,
  pairUnpairDevice,
  getConnectDevices,
};

const data = {
  userEmail: "user02@gmail.com",
  connectedDevices: [
    {
      _id: "667ba948dc4c849b87e1fbc1",
      deviceCode: "BP7250",
      deviceName: "Wireless Upper Arm Blood Pressure Monitor BP7250",
      imageUrl:
        "https://res.cloudinary.com/ds6oggjvt/image/upload/v1719830635/bp_zhn9sc.jpg",
      type: "bp",
      pairStatus: "pair",
    },
    {
      _id: "667baac5dc4c849b87e1fbc4",
      deviceCode: "SC-150",
      deviceName: "Weight Scale SC-150",
      imageUrl:
        "https://res.cloudinary.com/ds6oggjvt/image/upload/v1719830733/weightScale_o1ilsp.jpg",
      type: "weight",
      pairStatus: "pair",
    },
  ],
};
