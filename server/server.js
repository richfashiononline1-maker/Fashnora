require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API Routes
app.use('/api', apiRouter);

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Catch-all route to serve the Single Page Application index.html for frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Fashnora server running on http://localhost:${PORT}`);
});
