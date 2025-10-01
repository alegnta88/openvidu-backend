const express = require('express');
const axios = require('axios');
const router = express.Router();
const authRole = require('../middleware/authRole');

const OPENVIDU_URL = process.env.OPENVIDU_URL || "http://localhost:7880";
const OPENVIDU_SECRET = process.env.OPENVIDU_SECRET || "MY_SECRET";

// Create Video KYC session
router.post('/create-session', authRole(['agent']), async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: "Phone is required" });

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, error: "Phone number must be 10 digits" });
    }

    try {
        let sessionId;

        // 1. Create a new OpenVidu session (or reuse if already exists)
        try {
            const sessionResponse = await axios.post(
                `${OPENVIDU_URL}/openvidu/api/sessions`,
                {},
                { auth: { username: "OPENVIDUAPP", password: OPENVIDU_SECRET } }
            );
            sessionId = sessionResponse.data.id;
        } catch (err) {
            if (err.response?.status === 409) {
                // Session already exists
                sessionId = req.body.customSessionId || "default-session";
            } else {
                throw err;
            }
        }

        // 2. Generate tokens
        const agentTokenResponse = await axios.post(
            `${OPENVIDU_URL}/openvidu/api/sessions/${sessionId}/connection`,
            { role: "MODERATOR" },
            { auth: { username: "OPENVIDUAPP", password: OPENVIDU_SECRET } }
        );

        const customerTokenResponse = await axios.post(
            `${OPENVIDU_URL}/openvidu/api/sessions/${sessionId}/connection`,
            { role: "PUBLISHER" },
            { auth: { username: "OPENVIDUAPP", password: OPENVIDU_SECRET } }
        );

        const agentToken = agentTokenResponse.data.token;
        const customerToken = customerTokenResponse.data.token;

        // 3. Send join URLs
        res.json({
            success: true,
            sessionId,
            agentJoinUrl: `http://localhost:5173/join?token=${agentToken}`,
            customerJoinUrl: `http://localhost:5173/join?token=${customerToken}`
        });

    } catch (err) {
        console.error("OpenVidu API error:", err.response?.data || err.message);
        res.status(500).json({ success: false, error: err.response?.data || err.message });
    }
});

module.exports = router;