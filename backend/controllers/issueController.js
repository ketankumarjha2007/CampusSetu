const Issue = require('../models/Issue');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

const {
  sendPushNotification,
} = require('../services/notificationService');

/*
 * ==========================================
 * COMPLAINT ID GENERATOR
 * ==========================================
 *
 * Format: CS-2026-000001
 */

const generateComplaintId = async () => {
  const year = new Date().getFullYear();

  const lastIssue = await Issue.findOne({
    complaintId: {
      $regex: `^CS-${year}-`,
    },
  }).sort({ complaintId: -1 });

  let nextNumber = 1;

  if (lastIssue?.complaintId) {
    const parts = lastIssue.complaintId.split('-');
    const lastNumber = parseInt(parts[2], 10);

    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `CS-${year}-${String(nextNumber).padStart(6, '0')}`;
};

/*
 * ==========================================
 * ENSURE OLD COMPLAINT HAS AN ID
 * ==========================================
 */

const ensureComplaintId = async (issue) => {
  if (issue.complaintId) {
    return issue;
  }

  let complaintId = await generateComplaintId();

  let existingIssue = await Issue.findOne({ complaintId });

  while (existingIssue) {
    complaintId = await generateComplaintId();
    existingIssue = await Issue.findOne({ complaintId });
  }

  issue.complaintId = complaintId;
  await issue.save();

  return issue;
};

/*
 * ==========================================
 * CLOUDINARY IMAGE UPLOAD
 * ==========================================
 */

const uploadImageToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'campussetu/complaints',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

/*
 * ==========================================
 * TEXT NORMALIZATION
 * ==========================================
 */

const normalizeText = (value = '') => {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
};

const cleanOptionalText = (value) => {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
};

/*
 * ==========================================
 * TOKENIZE TEXT
 * ==========================================
 */

const getTokens = (value = '') => {
  return new Set(
    normalizeText(value)
      .split(' ')
      .filter((word) => word.length >= 3)
  );
};

/*
 * ==========================================
 * CALCULATE TEXT SIMILARITY
 * ==========================================
 *
 * Jaccard similarity:
 * common words / total unique words
 */

const calculateSimilarity = (firstText, secondText) => {
  const firstTokens = getTokens(firstText);
  const secondTokens = getTokens(secondText);

  if (firstTokens.size === 0 || secondTokens.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const token of firstTokens) {
    if (secondTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([
    ...firstTokens,
    ...secondTokens,
  ]).size;

  return union === 0 ? 0 : intersection / union;
};

/*
 * ==========================================
 * LOCATION MATCHING
 * ==========================================
 *
 * New complaints:
 * Compare building, floor, and room when
 * structured location fields are provided.
 *
 * Older complaints:
 * Fall back to the existing location field.
 */

const hasStructuredLocation = (issue) => {
  return Boolean(
    cleanOptionalText(issue.building) ||
    cleanOptionalText(issue.floor) ||
    cleanOptionalText(issue.roomNumber)
  );
};

const sameStructuredLocation = (first, second) => {
  return (
    normalizeText(first.building) ===
    normalizeText(second.building) &&
    normalizeText(first.floor) ===
    normalizeText(second.floor) &&
    normalizeText(first.roomNumber) ===
    normalizeText(second.roomNumber)
  );
};

const locationsMatch = (existingIssue, newLocation) => {
  const newHasStructuredLocation =
    hasStructuredLocation(newLocation);

  const existingHasStructuredLocation =
    hasStructuredLocation(existingIssue);

  if (
    newHasStructuredLocation &&
    existingHasStructuredLocation
  ) {
    return sameStructuredLocation(
      existingIssue,
      newLocation
    );
  }

  /*
   * Backward compatibility for complaints
   * created before structured location fields
   * were introduced.
   */
  return (
    normalizeText(existingIssue.location) ===
    normalizeText(newLocation.location)
  );
};

/*
 * ==========================================
 * DUPLICATE COMPLAINT DETECTION
 * ==========================================
 *
 * Checks active complaints only:
 * - pending
 * - assigned
 * - in_progress
 *
 * A duplicate must belong to the same student,
 * have the same category, match the location,
 * and have sufficiently similar text.
 */

const findDuplicateComplaint = async ({
  userId,
  title,
  description,
  category,
  location,
  building,
  floor,
  roomNumber,
}) => {
  const normalizedCategory = normalizeText(category);

  const escapedCategory = normalizedCategory.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );

  const activeIssues = await Issue.find({
    reportedBy: userId,
    status: {
      $in: ['pending', 'assigned', 'in_progress'],
    },
    category: {
      $regex: `^${escapedCategory}$`,
      $options: 'i',
    },
  })
    .sort({ createdAt: -1 })
    .limit(50);

  if (!activeIssues.length) {
    return null;
  }

  const newTitle = normalizeText(title);
  const newDescription = normalizeText(description);

  const newLocation = {
    location,
    building,
    floor,
    roomNumber,
  };

  for (const existingIssue of activeIssues) {
    if (!locationsMatch(existingIssue, newLocation)) {
      continue;
    }

    const existingTitle = normalizeText(existingIssue.title);
    const existingDescription = normalizeText(
      existingIssue.description
    );

    // Exact normalized title.
    if (newTitle === existingTitle) {
      return existingIssue;
    }

    const newCombinedText =
      `${newTitle} ${newDescription}`;

    const existingCombinedText =
      `${existingTitle} ${existingDescription}`;

    // Exact combined complaint.
    if (newCombinedText === existingCombinedText) {
      return existingIssue;
    }

    const titleSimilarity = calculateSimilarity(
      newTitle,
      existingTitle
    );

    const combinedSimilarity = calculateSimilarity(
      newCombinedText,
      existingCombinedText
    );

    /*
     * Duplicate thresholds:
     * Title similarity >= 60%, OR
     * combined similarity >= 50%.
     */
    if (
      titleSimilarity >= 0.6 ||
      combinedSimilarity >= 0.5
    ) {
      return existingIssue;
    }
  }

  return null;
};

/*
 * ==========================================
 * CREATE ISSUE
 * ==========================================
 *
 * POST /api/issues
 *
 * Supports:
 * - JSON without a photo
 * - multipart/form-data with a photo
 *
 * New optional fields:
 * - building
 * - floor
 * - roomNumber
 */

const createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      building,
      floor,
      roomNumber,
      photoUrl,
      priority,
    } = req.body;

    /*
     * Validate required fields.
     * Structured location fields remain optional
     * for compatibility with existing clients.
     */
    if (
      !title ||
      !description ||
      !category ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Title, description, category, and location are required',
      });
    }

    /*
     * Clean incoming values.
     */
    const cleanTitle = String(title).trim();
    const cleanDescription = String(description).trim();
    const cleanCategory = String(category).trim();
    const cleanLocation = String(location).trim();

    const cleanBuilding = cleanOptionalText(building);
    const cleanFloor = cleanOptionalText(floor);
    const cleanRoomNumber = cleanOptionalText(roomNumber);

    const cleanPriority = cleanOptionalText(priority)
      .toLowerCase() || 'medium';

    const allowedPriorities = [
      'low',
      'medium',
      'high',
      'critical',
    ];

    if (!allowedPriorities.includes(cleanPriority)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid priority. Use low, medium, high, or critical.',
      });
    }

    /*
     * ==========================================
     * DUPLICATE CHECK
     * ==========================================
     *
     * Run before uploading a photo so duplicate
     * submissions do not create unnecessary uploads.
     */
    const duplicateIssue = await findDuplicateComplaint({
      userId: req.user._id,
      title: cleanTitle,
      description: cleanDescription,
      category: cleanCategory,
      location: cleanLocation,
      building: cleanBuilding,
      floor: cleanFloor,
      roomNumber: cleanRoomNumber,
    });

    if (duplicateIssue) {
      const complaintWithId =
        await ensureComplaintId(duplicateIssue);

      return res.status(409).json({
        success: false,
        duplicate: true,
        message:
          'A similar active complaint already exists for this location.',
        existingIssue: {
          _id: complaintWithId._id,
          complaintId: complaintWithId.complaintId,
          title: complaintWithId.title,
          category: complaintWithId.category,
          location: complaintWithId.location,
          building: complaintWithId.building || '',
          floor: complaintWithId.floor || '',
          roomNumber: complaintWithId.roomNumber || '',
          status: complaintWithId.status,
          createdAt: complaintWithId.createdAt,
        },
      });
    }

    /*
     * ==========================================
     * PHOTO UPLOAD
     * ==========================================
     */
    let finalPhotoUrl = cleanOptionalText(photoUrl);

    if (req.file) {
      console.log(
        'Issue photo received:',
        req.file.originalname
      );

      try {
        const uploadResult = await uploadImageToCloudinary(
          req.file.buffer
        );

        finalPhotoUrl = uploadResult.secure_url;

        console.log(
          'Cloudinary upload successful:',
          finalPhotoUrl
        );
      } catch (uploadError) {
        console.error(
          'Cloudinary upload error:',
          uploadError.message
        );

        return res.status(500).json({
          success: false,
          message: 'Failed to upload complaint photo',
        });
      }
    }

    /*
     * ==========================================
     * GENERATE COMPLAINT ID
     * ==========================================
     */
    const complaintId = await generateComplaintId();

    /*
     * ==========================================
     * CREATE COMPLAINT
     * ==========================================
     */
    const issue = await Issue.create({
      complaintId,
      title: cleanTitle,
      description: cleanDescription,
      category: cleanCategory,
      location: cleanLocation,

      // New structured location fields.
      building: cleanBuilding,
      floor: cleanFloor,
      roomNumber: cleanRoomNumber,

      photoUrl: finalPhotoUrl,
      reportedBy: req.user._id,
      priority: cleanPriority,
      status: 'pending',

      history: [
        {
          status: 'pending',
          note: 'Issue reported by student',
          changedBy: req.user._id,
        },
      ],
    });

    /*
     * Populate the response.
     */
    const populatedIssue = await Issue.findById(issue._id)
      .populate(
        'reportedBy',
        'name email role department'
      )
      .populate(
        'assignedTo',
        'name email role department'
      );

    console.log(`Complaint created: ${complaintId}`);

    /*
     * ==========================================
     * PUSH NOTIFICATION
     * ==========================================
     *
     * Notification failures must not undo
     * successful complaint creation.
     */
    if (req.user.pushToken) {
      sendPushNotification({
        pushToken: req.user.pushToken,
        title: 'Complaint Submitted 📝',
        body:
          `Your complaint ${complaintId} has been submitted successfully.`,
        data: {
          type: 'complaint_submitted',
          issueId: issue._id.toString(),
          complaintId,
          status: 'pending',
        },
      })
        .then((result) => {
          if (result.success) {
            console.log(
              `Submission notification sent for ${complaintId}`
            );
          } else {
            console.log(
              `Submission notification not sent for ${complaintId}:`,
              result.message
            );
          }
        })
        .catch((error) => {
          console.error(
            `Submission notification error for ${complaintId}:`,
            error.message
          );
        });
    } else {
      console.log(
        `No push token available for ${complaintId}`
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      issue: populatedIssue,
    });
  } catch (error) {
    console.error(
      'Create issue error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to create issue',
    });
  }
};

/*
 * ==========================================
 * GET MY ISSUES
 * ==========================================
 *
 * GET /api/issues/my
 */

const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({
      reportedBy: req.user._id,
    })
      .populate(
        'assignedTo',
        'name email role department'
      )
      .sort({ createdAt: -1 });

    /*
     * Backfill complaint IDs for older records.
     */
    for (const issue of issues) {
      if (!issue.complaintId) {
        await ensureComplaintId(issue);
      }
    }

    return res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error(
      'Get my issues error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your issues',
    });
  }
};

/*
 * ==========================================
 * GET SINGLE ISSUE
 * ==========================================
 *
 * GET /api/issues/:id
 *
 * Students can only access their own complaints.
 */

const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(
      'Issue Details: Requested issue:',
      id
    );

    let issue = await Issue.findOne({
      _id: id,
      reportedBy: req.user._id,
    })
      .populate(
        'reportedBy',
        'name email role department'
      )
      .populate(
        'assignedTo',
        'name email role department'
      )
      .populate(
        'history.changedBy',
        'name email role department'
      );

    if (!issue) {
      return res.status(404).json({
        success: false,
        message:
          'Issue not found or you do not have permission to view it',
      });
    }

    /*
     * Backfill complaint ID for older records.
     */
    if (!issue.complaintId) {
      issue = await ensureComplaintId(issue);

      issue = await Issue.findById(issue._id)
        .populate(
          'reportedBy',
          'name email role department'
        )
        .populate(
          'assignedTo',
          'name email role department'
        )
        .populate(
          'history.changedBy',
          'name email role department'
        );
    }

    return res.status(200).json({
      success: true,
      issue,
    });
  } catch (error) {
    console.error(
      'Get issue by ID error:',
      error.message
    );

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch issue details',
    });
  }
};

/*
 * ==========================================
 * DELETE ISSUE
 * ==========================================
 *
 * DELETE /api/issues/:id
 *
 * Students can only delete their own
 * pending complaints.
 */

const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(
      'Delete Issue: Requested issue:',
      id
    );

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID',
      });
    }

    const issue = await Issue.findOne({
      _id: id,
      reportedBy: req.user._id,
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message:
          'Issue not found or you do not have permission to delete it',
      });
    }

    if (issue.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message:
          'Only pending complaints can be deleted',
      });
    }

    await Issue.deleteOne({ _id: issue._id });

    console.log(
      `Complaint deleted: ${issue.complaintId || issue._id
      }`
    );

    return res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
      deletedIssueId: issue._id,
      complaintId: issue.complaintId || null,
    });
  } catch (error) {
    console.error(
      'Delete issue error:',
      error.message
    );

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to delete complaint',
    });
  }
};

/*
 * ==========================================
 * TRACK ISSUE BY COMPLAINT ID
 * ==========================================
 *
 * GET /api/issues/track/:complaintId
 *
 * Students can only track their own complaints.
 */

const trackIssueByComplaintId = async (req, res) => {
  try {
    const { complaintId } = req.params;

    if (!complaintId || !complaintId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Complaint ID is required',
      });
    }

    const normalizedComplaintId = complaintId
      .trim()
      .toUpperCase();

    console.log(
      'Track Issue: Searching for:',
      normalizedComplaintId
    );

    const issue = await Issue.findOne({
      complaintId: normalizedComplaintId,
      reportedBy: req.user._id,
    })
      .populate(
        'reportedBy',
        'name email usn department'
      )
      .populate(
        'assignedTo',
        'name email role department'
      )
      .populate(
        'history.changedBy',
        'name email role'
      )
      .select('-__v');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message:
          'Complaint not found or you do not have permission to view it',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Complaint found successfully',
      issue,
    });
  } catch (error) {
    console.error(
      'Track issue error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to track complaint',
    });
  }
};
// ==========================================
// GET COMPLAINTS ASSIGNED TO THE TEACHER
// ==========================================
// GET /api/issues/teacher/assigned

const getTeacherAssignedIssues = async (req, res) => {
  try {
    const issues = await Issue.find({
      assignedTo: req.user._id,
    })
      .populate(
        'reportedBy',
        'name email usn department'
      )
      .populate(
        'assignedTo',
        'name email role department'
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error(
      'Get teacher assigned issues error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned complaints',
    });
  }
};
// ==========================================
// GET ALL COMPLAINTS FOR ADMIN DASHBOARD
// ==========================================
// GET /api/issues/admin/all
//
// Access: college_admin, cluster_head, principal
// Returns real complaints from MongoDB.

const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find({})
      .populate('reportedBy', 'name email usn department')
      .populate('assignedTo', 'name email role department')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error('Get all issues error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
    });
  }
};
// ==========================================
// ASSIGN COMPLAINT TO TEACHER
// ==========================================
// PATCH /api/issues/:id/assign
// Access: college_admin, principal

const assignIssueToTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID',
      });
    }

    if (!teacherId || !/^[0-9a-fA-F]{24}$/.test(teacherId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid teacher ID is required',
      });
    }

    const teacher = await require('../models/User').findOne({
      _id: teacherId,
      role: 'teacher',
      isActive: true,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Active teacher not found',
      });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    issue.assignedTo = teacher._id;
    issue.status = 'assigned';

    issue.history.push({
      status: 'assigned',
      note: `Complaint assigned to ${teacher.name}`,
      changedBy: req.user._id,
    });

    await issue.save();

    const updatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email usn department')
      .populate('assignedTo', 'name email role department')
      .populate('history.changedBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully',
      issue: updatedIssue,
    });
  } catch (error) {
    console.error('Assign complaint error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to assign complaint',
    });
  }
};
// ==========================================
// GET ACTIVE TEACHERS FOR ADMIN DASHBOARD
// ==========================================
// GET /api/issues/admin/teachers

const getActiveTeachers = async (req, res) => {
  try {
    const User = require('../models/User');

    const teachers = await User.find({
      role: 'teacher',
      isActive: true,
    })
      .select('_id name email department')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    console.error('Get active teachers error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers',
    });
  }
};
const updateIssueStatus = async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;

    const validStatuses = [
      'pending',
      'assigned',
      'in_progress',
      'resolved',
      'rejected',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint status',
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (issue.status === status) {
      return res.status(400).json({
        success: false,
        message: 'Complaint already has this status',
      });
    }

    if (
      status === 'resolved' &&
      (!resolutionNote || !resolutionNote.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a resolution note',
      });
    }

    const previousStatus = issue.status;

    issue.status = status;

    if (resolutionNote !== undefined) {
      issue.resolutionNote = resolutionNote.trim();
    }

    issue.resolvedAt =
      status === 'resolved' ? new Date() : null;

    issue.history.push({
      status,
      note:
        resolutionNote?.trim() ||
        `Status changed from ${previousStatus} to ${status}`,
      changedBy: req.user._id,
      changedAt: new Date(),
    });

    await issue.save();

    await issue.populate(
      'reportedBy',
      'name email usn department'
    );

    await issue.populate(
      'assignedTo',
      'name email role department'
    );

    return res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      issue,
    });
  } catch (error) {
    console.error(
      'Update issue status error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to update complaint status',
    });
  }
};
/*
 * ==========================================
 * EXPORTS
 * ==========================================
 */

module.exports = {
  createIssue,
  getMyIssues,
  getIssueById,
  deleteIssue,
  trackIssueByComplaintId,
  getTeacherAssignedIssues,
  getAllIssues,
  assignIssueToTeacher,
  updateIssueStatus,
  getActiveTeachers,
};