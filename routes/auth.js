const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SECRET_KEY = "YOUR_SECRET_KEY";

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username & password required" });

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });
        if (!user.active) return res.status(403).json({ error: "Account disabled. Please contact admin." });

        const valid = await user.comparePassword(password);
        if (!valid) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );
        res.json({ token, role: user.role, username: user.username });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;