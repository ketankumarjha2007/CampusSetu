const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    usn: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },

    role: {
      type: String,
      enum: [
        'student',
        'teacher',
        'cluster_head',
        'principal',
      ],
      required: true,
    },

    department: {
      type: String,
      trim: true,
      default: '',
    },

    phone: {
      type: String,
      trim: true,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // PUSH NOTIFICATIONS
    // ==========================================

    pushToken: {
      type: String,
      default: '',
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model('User', userSchema);