require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const sessionRoutes = require('./routes/session');

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}` +
            `@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=${process.env.MONGO_DB}`;

mongoose.connect(uri, {
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