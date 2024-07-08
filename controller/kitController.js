import KIT from "../model/kitModel.js";

const addKit = async (req, res) => {
  const { kitId, bpReadings, weightReadings } = req.body;
  if (!kitId) {
    res.status(400).send({ success: false, message: "Kit Id required" });
  }
  let kit = await KIT.findOne({ kitId });
  console.log(kit);
  if (kit) {
    return res
      .status(400)
      .send({ success: false, message: "kit already present" });
  }
  try {
    const newKit = new KIT({
      kitId,
      bpReadings,
      weightReadings,
    });

    const savedKit = await newKit.save();
    res.status(201).json({
      success: true,
      message: "New kit added successfully",
      kit: savedKit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addBPReading = async (req, res) => {
  const { kitId, sys, dia, pulse, readingDate } = req.body;
  if (!kitId || !sys || !dia || !pulse || !readingDate) {
    res
      .status(400)
      .send({ success: false, message: "All input fields are required" });
  }
  try {
    let kit = await KIT.findOne({ kitId });
    if (!kit) {
      res.status(404).json({ message: "Kit not found" });
    }
    const newBPReading = {
      sys,
      dia,
      pulse,
      readingDate,
    };
    kit.bpReadings.push(newBPReading);
    await kit.save();
    res.status(201).json({ message: "BP reading added successfully", kit });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addWeightReading = async (req, res) => {
  const { kitId, lbs, readingDate } = req.body;
  if (!kitId || !lbs || !readingDate) {
    res
      .status(400)
      .send({ success: false, message: "All input fields are required" });
  }
  try {
    let kit = await KIT.findOne({ kitId });
    if (!kit) {
      res.status(404).json({ message: "Kit not found" });
    }
    const newWeightReading = {
      lbs,
      readingDate,
    };
    kit.weightReadings.push(newWeightReading);
    await kit.save();
    res.status(201).json({ message: "Weight reading added successfully", kit });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getKitData = async (req, res) => {
  const { kitId } = req.body;
  if (!kitId) {
    return res
      .status(400)
      .send({ success: false, message: "Kit Id is required" });
  }
  try {
    let kit = await KIT.findOne({ kitId });
    if (!kit) {
      return res.status(400).send({ success: false, message: "Kit not found" });
    }
    res.status(201).json({ success: true, kit });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export { addKit, addBPReading, addWeightReading, getKitData };
