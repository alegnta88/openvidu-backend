const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "YOUR_SECRET_KEY";

// ======= MongoDB Connection =======
mongoose.connect('mongodb://admin:digaf2025@127.0.0.1:27017/videoKYC?authSource=videoKYC', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "videoKYC"
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ======= Role-Based Middleware =======
function authRole(allowedRoles) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "Token missing" });

        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ error: "Access denied" });
            }
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
    };
}

// ======= Register (admin only, create agents only) =======
app.post('/register', authRole(['admin']), async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ success: false, error: "All fields required" });

    // Admin can only create agents
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

// ======= Login =======
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username & password required" });

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        // Check if account is active
        if (!user.active) {
            return res.status(403).json({ error: "Account disabled. Please contact admin." });
        }

        const valid = await user.comparePassword(password);
        if (!valid) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );
        res.json({ token, role: user.role });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// ======= Create Video KYC Session (agents only) =======
app.post('/create-session', authRole(['agent']), async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: "Phone is required" });

    try {
        // ==== OpenVidu Session Placeholder ====
        // Generate session tokens for agent and customer
        const agentToken = "AGENT_TOKEN_EXAMPLE";
        const customerToken = "CUSTOMER_TOKEN_EXAMPLE";

        console.log(`Sending SMS to ${phone} with link: https://example.com/join?token=${customerToken}`);

        res.json({
            success: true,
            agentJoinUrl: `https://example.com/join?token=${agentToken}`,
            customerJoinUrl: `https://example.com/join?token=${customerToken}`
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ======= List All Agents (admin only) =======
app.get('/users', authRole(['admin']), async (req, res) => {
    try {
        const users = await User.find({ role: 'agent' }, { password: 0 });
        res.json({ success: true, users });
    } catch (err) {
        console.error("Error fetching users:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ======= Toggle Agent Active Status (admin only) =======
app.patch('/users/:id/toggle', authRole(['admin']), async (req, res) => {
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

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));