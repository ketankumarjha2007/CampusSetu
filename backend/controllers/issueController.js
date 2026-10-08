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
 * Format:
 * CS-2026-000001
 * CS-2026-000002
 * CS-2026-000003
 */

const generateComplaintId = async () => {
  const year = new Date().getFullYear();

  const lastIssue = await Issue.findOne({
    complaintId: {
      $regex: `^CS-${year}-`,
    },
  }).sort({
    complaintId: -1,
  });

  let nextNumber = 1;

  if (lastIssue?.complaintId) {
    const parts =
      lastIssue.complaintId.split('-');

    const lastNumber = parseInt(
      parts[2],
      10
    );

    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `CS-${year}-${String(nextNumber).padStart(
    6,
    '0'
  )}`;
};


/*
 * ==========================================
 * ENSURE OLD COMPLAINT HAS COMPLAINT ID
 * ==========================================
 */

const ensureComplaintId = async (issue) => {
  if (issue.complaintId) {
    return issue;
  }

  let complaintId =
    await generateComplaintId();

  /*
   * Extra protection against duplicate ID.
   */

  let existingIssue = await Issue.findOne({
    complaintId,
  });

  while (existingIssue) {
    complaintId =
      await generateComplaintId();

    existingIssue = await Issue.findOne({
      complaintId,
    });
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

const uploadImageToCloudinary = async (
  buffer
) => {
  return new Promise(
    (resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
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

      Readable.from(buffer).pipe(
        uploadStream
      );
    }
  );
};


/*
 * ==========================================
 * TEXT NORMALIZATION
 * ==========================================
 *
 * Used for duplicate complaint detection.
 *
 * Example:
 *
 * "CV Raman Block, Room 301"
 *
 * becomes:
 *
 * "cv raman block room 301"
 */

const normalizeText = (value = '') => {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
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
      .filter(
        (word) =>
          word.length >= 3
      )
  );
};


/*
 * ==========================================
 * CALCULATE TEXT SIMILARITY
 * ==========================================
 *
 * Uses Jaccard similarity:
 *
 * common words / total unique words
 *
 * Example:
 *
 * "internet not working"
 *
 * and
 *
 * "internet is not working"
 *
 * will have high similarity.
 */

const calculateSimilarity = (
  firstText,
  secondText
) => {
  const firstTokens =
    getTokens(firstText);

  const secondTokens =
    getTokens(secondText);

  if (
    firstTokens.size === 0 ||
    secondTokens.size === 0
  ) {
    return 0;
  }

  let intersection = 0;

  for (const token of firstTokens) {
    if (secondTokens.has(token)) {
      intersection += 1;
    }
  }

  const union =
    new Set([
      ...firstTokens,
      ...secondTokens,
    ]).size;

  if (union === 0) {
    return 0;
  }

  return intersection / union;
};


/*
 * ==========================================
 * DUPLICATE COMPLAINT DETECTION
 * ==========================================
 *
 * We only check active complaints:
 *
 * pending
 * assigned
 * in_progress
 *
 * Resolved/rejected complaints do NOT block
 * students from reporting the issue again.
 */

const findDuplicateComplaint = async ({
  userId,
  title,
  description,
  category,
  location,
}) => {
  const normalizedCategory =
    normalizeText(category);

  const normalizedLocation =
    normalizeText(location);

  /*
   * First narrow the search using:
   *
   * - same student
   * - same category
   * - active complaint
   */

  const activeIssues =
    await Issue.find({
      reportedBy: userId,

      status: {
        $in: [
          'pending',
          'assigned',
          'in_progress',
        ],
      },

      category: {
        $regex: `^${normalizedCategory.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        )}$`,
        $options: 'i',
      },
    })
      .sort({
        createdAt: -1,
      })
      .limit(50);

  if (!activeIssues.length) {
    return null;
  }

  /*
   * Normalize the new complaint text.
   */

  const newTitle =
    normalizeText(title);

  const newDescription =
    normalizeText(description);

  /*
   * Compare against active complaints.
   */

  for (const existingIssue of activeIssues) {
    const existingLocation =
      normalizeText(
        existingIssue.location
      );

    /*
     * Location must match.
     *
     * This prevents blocking two different
     * problems in different campus locations.
     */

    if (
      existingLocation !==
      normalizedLocation
    ) {
      continue;
    }

    const existingTitle =
      normalizeText(
        existingIssue.title
      );

    const existingDescription =
      normalizeText(
        existingIssue.description
      );

    /*
     * Exact normalized title.
     */

    if (
      newTitle === existingTitle
    ) {
      return existingIssue;
    }

    /*
     * Exact combined complaint.
     */

    const newCombinedText =
      `${newTitle} ${newDescription}`;

    const existingCombinedText =
      `${existingTitle} ${existingDescription}`;

    if (
      newCombinedText ===
      existingCombinedText
    ) {
      return existingIssue;
    }

    /*
     * Calculate similarity.
     */

    const titleSimilarity =
      calculateSimilarity(
        newTitle,
        existingTitle
      );

    const combinedSimilarity =
      calculateSimilarity(
        newCombinedText,
        existingCombinedText
      );

    /*
     * Duplicate if:
     *
     * title similarity >= 60%
     *
     * OR
     *
     * combined complaint similarity >= 50%
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
 *
 * - JSON without photo
 * - multipart/form-data with photo
 */

const createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      photoUrl,
      priority,
    } = req.body;

    /*
     * Validate required fields.
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

    const cleanTitle =
      title.trim();

    const cleanDescription =
      description.trim();

    const cleanCategory =
      category.trim();

    const cleanLocation =
      location.trim();

    /*
     * ==========================================
     * DUPLICATE CHECK
     * ==========================================
     *
     * IMPORTANT:
     * This happens BEFORE Cloudinary upload.
     *
     * So if the complaint is duplicate,
     * we don't upload an unnecessary photo.
     */

    const duplicateIssue =
      await findDuplicateComplaint({
        userId: req.user._id,
        title: cleanTitle,
        description: cleanDescription,
        category: cleanCategory,
        location: cleanLocation,
      });

    if (duplicateIssue) {
      /*
       * Make sure old complaint has an ID.
       */

      const complaintWithId =
        await ensureComplaintId(
          duplicateIssue
        );

      return res.status(409).json({
        success: false,

        duplicate: true,

        message:
          'A similar active complaint already exists for this location.',

        existingIssue: {
          _id:
            complaintWithId._id,

          complaintId:
            complaintWithId.complaintId,

          title:
            complaintWithId.title,

          category:
            complaintWithId.category,

          location:
            complaintWithId.location,

          status:
            complaintWithId.status,

          createdAt:
            complaintWithId.createdAt,
        },
      });
    }

    /*
     * ==========================================
     * PHOTO UPLOAD
     * ==========================================
     */

    let finalPhotoUrl =
      photoUrl || '';

    if (req.file) {
      console.log(
        'Issue photo received:',
        req.file.originalname
      );

      try {
        const uploadResult =
          await uploadImageToCloudinary(
            req.file.buffer
          );

        finalPhotoUrl =
          uploadResult.secure_url;

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
          message:
            'Failed to upload complaint photo',
        });
      }
    }

    /*
     * ==========================================
     * GENERATE COMPLAINT ID
     * ==========================================
     */

    const complaintId =
      await generateComplaintId();

    /*
     * ==========================================
     * CREATE COMPLAINT
     * ==========================================
     */

    const issue = await Issue.create({
      complaintId,

      title:
        cleanTitle,

      description:
        cleanDescription,

      category:
        cleanCategory,

      location:
        cleanLocation,

      photoUrl:
        finalPhotoUrl,

      reportedBy:
        req.user._id,

      priority:
        priority || 'medium',

      status:
        'pending',

      history: [
        {
          status:
            'pending',

          note:
            'Issue reported by student',

          changedBy:
            req.user._id,
        },
      ],
    });

    /*
     * Populate response.
     */

    const populatedIssue =
      await Issue.findById(
        issue._id
      )
        .populate(
          'reportedBy',
          'name email role department'
        )
        .populate(
          'assignedTo',
          'name email role department'
        );

    console.log(
      `Complaint created: ${complaintId}`
    );

    /*
     * ==========================================
     * PUSH NOTIFICATION
     * ==========================================
     *
     * Send confirmation notification to
     * the student after complaint creation.
     *
     * Push notification failure must NOT
     * fail complaint creation.
     */

    if (req.user.pushToken) {
      sendPushNotification({
        pushToken:
          req.user.pushToken,

        title:
          'Complaint Submitted 📝',

        body:
          `Your complaint ${complaintId} has been submitted successfully.`,

        data: {
          type:
            'complaint_submitted',

          issueId:
            issue._id.toString(),

          complaintId:
            complaintId,

          status:
            'pending',
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

      message:
        'Issue reported successfully',

      issue:
        populatedIssue,
    });
  } catch (error) {
    console.error(
      'Create issue error:',
      error.message
    );

    return res.status(500).json({
      success: false,

      message:
        'Failed to create issue',
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
    let issues = await Issue.find({
      reportedBy:
        req.user._id,
    })
      .populate(
        'assignedTo',
        'name email role department'
      )
      .sort({
        createdAt: -1,
      });

    /*
     * Backfill complaint IDs for old complaints.
     */

    for (const issue of issues) {
      if (!issue.complaintId) {
        await ensureComplaintId(issue);
      }
    }

    return res.status(200).json({
      success: true,

      count:
        issues.length,

      issues,
    });
  } catch (error) {
    console.error(
      'Get my issues error:',
      error.message
    );

    return res.status(500).json({
      success: false,

      message:
        'Failed to fetch your issues',
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
    const {
      id,
    } = req.params;

    console.log(
      'Issue Details: Requested issue:',
      id
    );

    let issue =
      await Issue.findOne({
        _id: id,

        reportedBy:
          req.user._id,
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
     * Backfill complaint ID if this is
     * an old complaint.
     */

    if (!issue.complaintId) {
      issue =
        await ensureComplaintId(
          issue
        );

      /*
       * Populate again after save.
       */

      issue =
        await Issue.findById(
          issue._id
        )
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

    if (
      error.name === 'CastError'
    ) {
      return res.status(400).json({
        success: false,

        message:
          'Invalid issue ID',
      });
    }

    return res.status(500).json({
      success: false,

      message:
        'Failed to fetch issue details',
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
    const {
      id,
    } = req.params;

    console.log(
      'Delete Issue: Requested issue:',
      id
    );

    /*
     * Check whether MongoDB ID is valid.
     */

    if (
      !id.match(
        /^[0-9a-fA-F]{24}$/
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          'Invalid issue ID',
      });
    }

    /*
     * Find issue AND make sure it belongs
     * to the authenticated student.
     */

    const issue =
      await Issue.findOne({
        _id: id,

        reportedBy:
          req.user._id,
      });

    if (!issue) {
      return res.status(404).json({
        success: false,

        message:
          'Issue not found or you do not have permission to delete it',
      });
    }

    /*
     * Students can delete only pending
     * complaints.
     */

    if (
      issue.status !==
      'pending'
    ) {
      return res.status(400).json({
        success: false,

        message:
          'Only pending complaints can be deleted',
      });
    }

    /*
     * Delete complaint.
     */

    await Issue.deleteOne({
      _id: issue._id,
    });

    console.log(
      `Complaint deleted: ${issue.complaintId ||
      issue._id
      }`
    );

    return res.status(200).json({
      success: true,

      message:
        'Complaint deleted successfully',

      deletedIssueId:
        issue._id,

      complaintId:
        issue.complaintId ||
        null,
    });
  } catch (error) {
    console.error(
      'Delete issue error:',
      error.message
    );

    if (
      error.name === 'CastError'
    ) {
      return res.status(400).json({
        success: false,

        message:
          'Invalid issue ID',
      });
    }

    return res.status(500).json({
      success: false,

      message:
        'Failed to delete complaint',
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

const trackIssueByComplaintId = async (
  req,
  res
) => {
  try {
    const {
      complaintId,
    } = req.params;

    if (
      !complaintId ||
      !complaintId.trim()
    ) {
      return res.status(400).json({
        success: false,

        message:
          'Complaint ID is required',
      });
    }

    const normalizedComplaintId =
      complaintId
        .trim()
        .toUpperCase();

    console.log(
      'Track Issue: Searching for:',
      normalizedComplaintId
    );

    const issue =
      await Issue.findOne({
        complaintId:
          normalizedComplaintId,

        reportedBy:
          req.user._id,
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

      message:
        'Complaint found successfully',

      issue,
    });
  } catch (error) {
    console.error(
      'Track issue error:',
      error.message
    );

    return res.status(500).json({
      success: false,

      message:
        'Failed to track complaint',
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
};