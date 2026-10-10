const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    /*
     * Human-readable complaint tracking ID.
     * Example: CS-2026-000001
     */
    complaintId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // Complaint information
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

    // Existing location field — kept for backward compatibility
    location: {
      type: String,
      required: true,
      trim: true,
    },

    // New structured location fields
    building: {
      type: String,
      trim: true,
      default: '',
    },

    floor: {
      type: String,
      trim: true,
      default: '',
    },

    roomNumber: {
      type: String,
      trim: true,
      default: '',
    },

    // Optional complaint photo
    photoUrl: {
      type: String,
      default: '',
    },

    // Student who submitted the complaint
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Official assigned to handle the complaint
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Complaint status
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

    // Complaint priority
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

    // Resolution information
    resolutionNote: {
      type: String,
      default: '',
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    // Rejection reason
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },

    // Reopening reason
    reopenReason: {
      type: String,
      default: '',
      trim: true,
    },

    // Escalation flag and level
    escalationLevel: {
      type: Number,
      default: 0,
    },

    // Request for additional information from student
    additionalInfoRequested: {
      type: Boolean,
      default: false,
    },

    additionalInfoPrompt: {
      type: String,
      default: '',
    },

    // Complete complaint status history
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

issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ reportedBy: 1, createdAt: -1 });
issueSchema.index({ assignedTo: 1, status: 1 });
issueSchema.index({ category: 1 });
issueSchema.index({ priority: 1, status: 1 });

module.exports = mongoose.model('Issue', issueSchema);