const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST']
  }
});

// Middleware
const rawUrl = process.env.FRONTEND_URL || '';
const cleanFrontendUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  cleanFrontendUrl
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Attach io to request for use in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const segregationRoutes = require('./routes/segregation');
const dashboardRoutes = require('./routes/dashboard');
const homeownerRoutes = require('./routes/homeowner');
const businessRoutes = require('./routes/business');
const paymentRoutes = require('./routes/payment');
const municipalRoutes = require('./routes/municipal');

app.use('/api/auth', authRoutes);
app.use('/api/segregation', segregationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/homeowner', homeownerRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/municipal', municipalRoutes);

// Routes Placeholder
app.get('/', (req, res) => {
  res.send('SegriFy API is running...');
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000; // Using 5000 as standard backend port
const MONGO_URI = process.env.MONGO_URI;

console.log('Connecting to MongoDB...');
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Handle real-time event distribution
global.io = io; // Optional but handy
