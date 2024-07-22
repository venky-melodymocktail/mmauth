const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
  },
  phonenumber: { type: String, required: true, unique: true },
  firstname: { type: String, required: true },
  lastname: { type: String },
  photo: {
    type: String,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin'],
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('User', userSchema);
