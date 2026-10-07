const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    /*
     * Human-readable complaint tracking ID.
     *
     * Example:
     * CS-2026-000001
     */
    complaintId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    photoUrl: {
      type: String,
      default: '',
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'assigned',
        'in_progress',
        'resolved',
        'rejected',
      ],
      default: 'pending',
    },

    priority: {
      type: String,
      enum: [
        'low',
        'medium',
        'high',
        'critical',
      ],
      default: 'medium',
    },

    resolutionNote: {
      type: String,
      default: '',
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    history: [
      {
        status: {
          type: String,
          required: true,
        },

        note: {
          type: String,
          default: '',
        },

        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },

        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'Issue',
  issueSchema
);