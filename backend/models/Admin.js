// Admin account model. Admin authentication is kept fully separate from
// student authentication (different collection, different login route).
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // stored as bcrypt hash
    role: { type: String, default: 'admin', enum: ['admin', 'superadmin'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
