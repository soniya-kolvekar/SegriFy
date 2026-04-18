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
app.use(cors());
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
<<<<<<< Updated upstream
const businessRoutes = require('./routes/business');
=======
const homeownerRoutes = require('./routes/homeowner');
>>>>>>> Stashed changes

app.use('/api/auth', authRoutes);
app.use('/api/segregation', segregationRoutes);
app.use('/api/dashboard', dashboardRoutes);
<<<<<<< Updated upstream
app.use('/api/business', businessRoutes);
=======
app.use('/api/homeowner', homeownerRoutes);

>>>>>>> Stashed changes

// Routes Placeholder
app.get('/', (req, res) => {
  res.send('SegriFy API is running...');
});


// Connect to MongoDB
const PORT = process.env.PORT || 5000;
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
