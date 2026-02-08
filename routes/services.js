const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// GET all services
router.get('/', async (req, res) => {
    try {
        let query = {};
        if (req.query.minPrice) query.price = { $gte: Number(req.query.minPrice) };
        if (req.query.maxPrice) query.price = { ...query.price, $lte: Number(req.query.maxPrice) };
        const services = await Service.find(query).sort({ 'reviews.length': -1 }); // Sort by ratings for challenge
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST add service (provider only - auth later)
router.post('/', async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(201).json(service);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET single service
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: 'Not found' });
        res.json(service);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT update service
router.put('/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(service);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE service
router.delete('/:id', async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST review (challenge)
router.post('/:id/reviews', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        service.reviews.push(req.body);
        await service.save();
        res.json(service);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;