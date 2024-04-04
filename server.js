// server.js

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Dummy users (for demo purposes)
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' }
];

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/videos', express.static('uploads')); // Serve videos from 'uploads' folder

// User authentication middleware
function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  // Here you would verify the token (e.g., using JWT)
  // For simplicity, we'll just check against dummy users
  const user = users.find(u => u.id === parseInt(token));
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  next();
}

// Routes
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Here you would generate a JWT token and send it back to the client
  res.json({ token: user.id });
});

app.post('/upload', authenticateUser, upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Here you would save the video details to your database
  res.json({ success: true, message: 'Video uploaded successfully' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
