
const express = require("express");
const Application = require("../models/Application");

const router = express.Router();

// Get all applications
router.get("/", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get one application
router.get("/:id", async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add an application
router.post("/", async (req, res) => {
  try {
    const application = new Application(req.body);
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an application
router.put("/:id", async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update status
router.patch("/:id/status", async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        $set: { status: req.body.status },
        $push: {
          statusHistory: {
            status: req.body.status,
            date: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an application
router.delete("/:id", async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
