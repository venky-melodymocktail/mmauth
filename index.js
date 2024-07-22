const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 8000;
const userRoutes = require('./routes/auth.js');
const otpGenerator = require('expiring-otp-generator');
otpGenerator.startCleanupInterval();

app.use(cors());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB);

mongoose.connection.on('error', (error) => {
  console.log(`Common Error caused issue → : check your .env file first and add your mongodb url`);
  console.error(` Error → : ${error.message}`);
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

app.use('/auth', userRoutes);

app.listen(port, () => console.log(`listening and on http://localhost:${port}`));
