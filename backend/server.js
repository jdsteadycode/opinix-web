require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const pollRoutes = require('./routes/pollRoutes');
const voteRoutes = require('./routes/voteRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());

// ✅ Parse JSON first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Mount routes AFTER body parsers
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/vote', voteRoutes);
app.use("/api/admin", adminRoutes);

// start the server
app.listen((process.env.PORT || 5000), () => console.log(`Server running on port ${process.env.PORT || 5000}`));
