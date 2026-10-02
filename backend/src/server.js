require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use('/api', routes);
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ message: 'Internal server error' }); });

app.listen(process.env.PORT || 5000, () => console.log(`API running on port ${process.env.PORT || 5000}`));
