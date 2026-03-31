require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const repoRoutes = require('./routes/repoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Routes
// app.use('/api', repoRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});