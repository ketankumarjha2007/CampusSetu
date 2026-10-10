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

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID',
      });
    }

    let issue = await Issue.findById(id)
      .populate('reportedBy', 'name email role department usn')
      .populate('assignedTo', 'name email role department')
      .populate('history.changedBy', 'name email role');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const currentUserId = String(req.user._id);
    const studentId = String(
      issue.reportedBy?._id || issue.reportedBy
    );
    const assignedTeacherId = String(
      issue.assignedTo?._id || issue.assignedTo || ''
    );

    const isOwner = studentId === currentUserId;

    const isAssignedTeacher =
      req.user.role === 'teacher' &&
      assignedTeacherId === currentUserId;

    const isAuthorizedAdmin = ['college_admin', 'cluster_head', 'principal'].includes(
      req.user.role
    );

    if (!isOwner && !isAssignedTeacher && !isAuthorizedAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this complaint',
      });
    }

    if (!issue.complaintId) {
      issue = await ensureComplaintId(issue);

      issue = await Issue.findById(id)
        .populate('reportedBy', 'name email role department usn')
        .populate('assignedTo', 'name email role department')
        .populate('history.changedBy', 'name email role');
    }

    return res.status(200).json({
      success: true,
      issue,
    });
  } catch (error) {
    console.error('Get issue by ID error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint details',
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

    const AuditLog = require('../models/AuditLog');
    const { createInAppNotification } = require('../services/notificationService');

    // Audit log
    await AuditLog.create({
      action: 'ASSIGN_COMPLAINT',
      performedBy: req.user._id,
      targetType: 'issue',
      targetId: issue._id,
      details: {
        complaintId: issue.complaintId,
        teacherId: teacher._id,
        teacherName: teacher.name,
      },
    });

    // Notify Student
    if (issue.reportedBy) {
      const studentUser = await require('../models/User').findById(issue.reportedBy);
      if (studentUser) {
        await createInAppNotification({
          recipientId: studentUser._id,
          title: 'Complaint Assigned 👨‍🏫',
          body: `Your complaint ${issue.complaintId || ''} has been assigned to ${teacher.name}.`,
          type: 'complaint_assigned',
          issueId: issue._id,
          complaintId: issue.complaintId || '',
        });

        if (studentUser.pushToken) {
          sendPushNotification({
            pushToken: studentUser.pushToken,
            title: 'Complaint Assigned 👨‍🏫',
            body: `Your complaint ${issue.complaintId || ''} has been assigned to ${teacher.name}.`,
            data: {
              type: 'complaint_assigned',
              issueId: issue._id.toString(),
              complaintId: issue.complaintId || '',
            },
          }).catch((err) => console.log('Push error:', err.message));
        }
      }
    }

    // Notify Teacher
    await createInAppNotification({
      recipientId: teacher._id,
      title: 'New Complaint Assigned 📋',
      body: `You have been assigned complaint ${issue.complaintId || ''}: "${issue.title}".`,
      type: 'new_assignment',
      issueId: issue._id,
      complaintId: issue.complaintId || '',
    });

    if (teacher.pushToken) {
      sendPushNotification({
        pushToken: teacher.pushToken,
        title: 'New Complaint Assigned 📋',
        body: `You have been assigned complaint ${issue.complaintId || ''}: "${issue.title}".`,
        data: {
          type: 'new_assignment',
          issueId: issue._id.toString(),
          complaintId: issue.complaintId || '',
        },
      }).catch((err) => console.log('Push error:', err.message));
    }

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
    const { id } = req.params;
    const { status } = req.body;

    // Accept "note" for new clients and "resolutionNote"
    // for compatibility with your existing client.
    const rawNote = req.body.note ?? req.body.resolutionNote;
    const updateNote =
      typeof rawNote === 'string' ? rawNote.trim() : '';

    const validStatuses = [
      'pending',
      'assigned',
      'in_progress',
      'resolved',
      'rejected',
    ];

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID',
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint status',
      });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const isTeacher = req.user.role === 'teacher';

    // Teachers can modify only their own assigned complaints.
    if (isTeacher) {
      if (String(issue.assignedTo || '') !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'You can update only complaints assigned to you',
        });
      }

      // Teacher workflow: assigned -> in_progress -> resolved.
      const allowedTeacherTransition =
        (issue.status === 'assigned' && status === 'in_progress') ||
        (issue.status === 'in_progress' && status === 'resolved');

      if (!allowedTeacherTransition) {
        return res.status(400).json({
          success: false,
          message:
            'Teachers can move assigned complaints to In Progress, ' +
            'and In Progress complaints to Resolved.',
        });
      }
    }

    if (issue.status === status) {
      return res.status(400).json({
        success: false,
        message: 'Complaint already has this status',
      });
    }

    if (status === 'resolved' && !updateNote) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a resolution note',
      });
    }

    const previousStatus = issue.status;

    issue.status = status;

    // Only resolution updates belong in resolutionNote.
    issue.resolutionNote = status === 'resolved' ? updateNote : '';
    if (status === 'rejected') {
      issue.rejectionReason = updateNote;
    }

    issue.resolvedAt =
      status === 'resolved' ? new Date() : null;

    issue.history.push({
      status,
      note:
        updateNote ||
        `Status changed from ${previousStatus} to ${status}`,
      changedBy: req.user._id,
      changedAt: new Date(),
    });

    await issue.save();

    const AuditLog = require('../models/AuditLog');
    const { createInAppNotification } = require('../services/notificationService');

    // Audit log
    await AuditLog.create({
      action: 'UPDATE_STATUS',
      performedBy: req.user._id,
      targetType: 'issue',
      targetId: issue._id,
      details: {
        complaintId: issue.complaintId,
        previousStatus,
        newStatus: status,
        note: updateNote,
      },
    });

    // Notify student about status change
    if (issue.reportedBy) {
      const studentUser = await require('../models/User').findById(issue.reportedBy);
      if (studentUser) {
        const statusEmoji = {
          in_progress: '⚙️',
          resolved: '✅',
          rejected: '❌',
          assigned: '👨‍🏫',
          pending: '📝',
        }[status] || '🔔';

        const notifTitle = `Status Updated: ${status.replace('_', ' ').toUpperCase()} ${statusEmoji}`;
        const notifBody = updateNote
          ? `Your complaint ${issue.complaintId || ''} status changed to ${status.replace('_', ' ')}. Note: ${updateNote}`
          : `Your complaint ${issue.complaintId || ''} status is now ${status.replace('_', ' ')}.`;

        await createInAppNotification({
          recipientId: studentUser._id,
          title: notifTitle,
          body: notifBody,
          type: 'status_updated',
          issueId: issue._id,
          complaintId: issue.complaintId || '',
        });

        if (studentUser.pushToken) {
          sendPushNotification({
            pushToken: studentUser.pushToken,
            title: notifTitle,
            body: notifBody,
            data: {
              type: 'status_updated',
              issueId: issue._id.toString(),
              complaintId: issue.complaintId || '',
              status,
            },
          }).catch((err) => console.log('Push error:', err.message));
        }
      }
    }

    const updatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email role department usn')
      .populate('assignedTo', 'name email role department')
      .populate('history.changedBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      issue: updatedIssue,
    });
  } catch (error) {
    console.error('Update issue status error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to update complaint status',
    });
  }
};
// ==========================================
// REOPEN A RESOLVED/REJECTED COMPLAINT (STUDENT OR ADMIN)
// ==========================================
const reopenIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A reason for reopening the complaint is required',
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const isOwner = String(issue.reportedBy) === String(req.user._id);
    const isAdmin = ['college_admin', 'principal'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reopen this complaint',
      });
    }

    if (!['resolved', 'rejected'].includes(issue.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only resolved or rejected complaints can be reopened',
      });
    }

    const previousStatus = issue.status;
    issue.status = 'in_progress';
    issue.reopenReason = reason.trim();
    issue.history.push({
      status: 'in_progress',
      note: `Complaint reopened (${previousStatus} -> in_progress): ${reason.trim()}`,
      changedBy: req.user._id,
      changedAt: new Date(),
    });

    await issue.save();

    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      action: 'REOPEN_COMPLAINT',
      performedBy: req.user._id,
      targetType: 'issue',
      targetId: issue._id,
      details: {
        previousStatus,
        reason: reason.trim(),
      },
    });

    const updatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email role department usn')
      .populate('assignedTo', 'name email role department')
      .populate('history.changedBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Complaint reopened successfully',
      issue: updatedIssue,
    });
  } catch (err) {
    console.error('Reopen issue error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to reopen complaint' });
  }
};

// ==========================================
// ESCALATE OVERDUE/CRITICAL COMPLAINT (CLUSTER HEAD / ADMIN / PRINCIPAL)
// ==========================================
const escalateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    issue.escalationLevel = (issue.escalationLevel || 0) + 1;
    issue.priority = 'critical';

    issue.history.push({
      status: issue.status,
      note: `Escalated to Level ${issue.escalationLevel}${note ? `: ${note.trim()}` : ''}`,
      changedBy: req.user._id,
      changedAt: new Date(),
    });

    await issue.save();

    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      action: 'ESCALATE_COMPLAINT',
      performedBy: req.user._id,
      targetType: 'issue',
      targetId: issue._id,
      details: {
        escalationLevel: issue.escalationLevel,
        note: note ? note.trim() : '',
      },
    });

    const updatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email role department usn')
      .populate('assignedTo', 'name email role department')
      .populate('history.changedBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Complaint escalated successfully',
      issue: updatedIssue,
    });
  } catch (err) {
    console.error('Escalate issue error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to escalate complaint' });
  }
};

// ==========================================
// REQUEST ADDITIONAL INFO FROM STUDENT (TEACHER / ADMIN)
// ==========================================
const requestAdditionalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Prompt describing needed information is required',
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (req.user.role === 'teacher' && String(issue.assignedTo || '') !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can request information only for complaints assigned to you',
      });
    }

    issue.additionalInfoRequested = true;
    issue.additionalInfoPrompt = prompt.trim();
    issue.history.push({
      status: issue.status,
      note: `Additional information requested: ${prompt.trim()}`,
      changedBy: req.user._id,
      changedAt: new Date(),
    });

    await issue.save();

    const { createInAppNotification, sendPushNotification } = require('../services/notificationService');
    const studentUser = await require('../models/User').findById(issue.reportedBy);

    if (studentUser) {
      await createInAppNotification({
        recipientId: studentUser._id,
        title: 'Action Needed: More Details Requested ℹ️',
        body: `For complaint ${issue.complaintId || ''}: "${prompt.trim()}"`,
        type: 'info_requested',
        issueId: issue._id,
        complaintId: issue.complaintId || '',
      });

      if (studentUser.pushToken) {
        sendPushNotification({
          pushToken: studentUser.pushToken,
          title: 'Action Needed: More Details Requested ℹ️',
          body: `For complaint ${issue.complaintId || ''}: "${prompt.trim()}"`,
          data: {
            type: 'info_requested',
            issueId: issue._id.toString(),
            complaintId: issue.complaintId || '',
          },
        }).catch((err) => console.log('Push error:', err.message));
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Request for additional information sent to student',
      issue,
    });
  } catch (err) {
    console.error('Request additional info error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to request information' });
  }
};

// ==========================================
// IN-APP NOTIFICATIONS HANDLERS
// ==========================================
const getMyNotifications = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (err) {
    console.error('Get notifications error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const Notification = require('../models/Notification');
    await Notification.updateOne(
      { _id: id, recipient: req.user._id },
      { $set: { read: true } }
    );
    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error('Mark notification read error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to mark read' });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all read error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};

// ==========================================
// GET AUDIT LOGS FOR PRINCIPAL / ADMIN
// ==========================================
const getAuditLogs = async (req, res) => {
  try {
    const AuditLog = require('../models/AuditLog');
    const logs = await AuditLog.find({})
      .populate('performedBy', 'name email role department')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err) {
    console.error('Get audit logs error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
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
  reopenIssue,
  escalateIssue,
  requestAdditionalInfo,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAuditLogs,
};