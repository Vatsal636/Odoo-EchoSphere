const express = require('express');
const EmissionFactor = require('../models/EmissionFactor');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const factors = await EmissionFactor.find();
    res.json(factors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const factor = await EmissionFactor.findById(req.params.id);
    if (!factor) return res.status(404).json({ error: 'Emission factor not found' });
    res.json(factor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const factor = await EmissionFactor.create(req.body);
    res.status(201).json(factor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const factor = await EmissionFactor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!factor) return res.status(404).json({ error: 'Emission factor not found' });
    res.json(factor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const factor = await EmissionFactor.findByIdAndDelete(req.params.id);
    if (!factor) return res.status(404).json({ error: 'Emission factor not found' });
    res.json({ message: 'Emission factor deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
