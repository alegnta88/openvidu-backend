const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const sessionRoutes = require('./routes/session');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://admin:digaf2025@127.0.0.1:27017/videoKYC?authSource=videoKYC', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Routes
app.use('/', authRoutes);
app.use('/users', agentRoutes);
app.use('/', sessionRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));