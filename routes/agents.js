const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authRole = require('../middleware/authRole');

// Register new agent
router.post('/register', authRole(['admin']), async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ success: false, error: "All fields required" });
    if (role !== 'agent') return res.status(403).json({ success: false, error: "Admin can only create agents" });

    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ success: false, error: "Username already exists" });

        const user = new User({ username, password, role, active: true });
        await user.save();
        res.json({ success: true, message: "Agent created" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// List all agents
router.get('/', authRole(['admin']), async (req, res) => {
    try {
        const users = await User.find({ role: 'agent' }, { password: 0 });
        res.json({ success: true, users });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Toggle agent active status
router.patch('/:id/toggle', authRole(['admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: "User not found" });

        user.active = !user.active;
        await user.save();
        res.json({ success: true, message: `User ${user.active ? "enabled" : "disabled"}`, user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;