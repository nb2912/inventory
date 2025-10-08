require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mount API routes
const authRoutes = require('./src/api/routes/auth.routes');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
	res.json({ status: 'ok', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
