const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

// GET all classes (Used by Signup and Admin)
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find().sort({ name: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new class (Used by Admin)
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Class name is required" });

    // Check if class already exists
    const existing = await Class.findOne({ name });
    if (existing) return res.status(400).json({ error: "Class already exists" });

    const newClass = new Class({ name });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a class (Used by Admin)
router.delete('/:id', async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
