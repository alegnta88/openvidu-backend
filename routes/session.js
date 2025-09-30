const express = require('express');
const router = express.Router();
const authRole = require('../middleware/authRole');

// Create Video KYC session (agents only)
router.post('/create-session', authRole(['agent']), async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: "Phone is required" });

    try {
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

module.exports = router;