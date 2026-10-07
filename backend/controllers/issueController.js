const Issue = require('../models/Issue');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

/*
 * Generate the next human-readable complaint ID.
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
 * Make sure an old issue has a complaint ID.
 *
 * This handles complaints created before the
 * complaintId feature was added.
 */
const ensureComplaintId = async (issue) => {
  if (issue.complaintId) {
    return issue;
  }

  let complaintId =
    await generateComplaintId();

  /*
   * Extra protection against a duplicate ID.
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
 * Upload image buffer to Cloudinary.
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
 * CREATE ISSUE
 *
 * POST /api/issues
 *
 * Supports:
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
     * Upload selected photo to Cloudinary.
     *
     * req.file is provided by multer.
     */
    let finalPhotoUrl = photoUrl || '';

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

    const complaintId =
      await generateComplaintId();

    const issue = await Issue.create({
      complaintId,

      title: title.trim(),

      description:
        description.trim(),

      category:
        category.trim(),

      location:
        location.trim(),

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
          status: 'pending',

          note:
            'Issue reported by student',

          changedBy:
            req.user._id,
        },
      ],
    });

    const populatedIssue =
      await Issue.findById(issue._id)
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
 * GET MY ISSUES
 *
 * GET /api/issues/my
 */
const getMyIssues = async (req, res) => {
  try {
    let issues = await Issue.find({
      reportedBy: req.user._id,
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
 * GET SINGLE ISSUE
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
        await ensureComplaintId(issue);

      /*
       * Populate again after save.
       */
      issue =
        await Issue.findById(issue._id)
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
 * DELETE ISSUE
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
     * Check whether the MongoDB ID is valid.
     */
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID',
      });
    }

    /*
     * Find the issue AND make sure it belongs
     * to the currently authenticated student.
     */
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

    /*
     * Students can delete only pending complaints.
     */
    if (issue.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message:
          'Only pending complaints can be deleted',
      });
    }

    /*
     * Delete the complaint.
     */
    await Issue.deleteOne({
      _id: issue._id,
    });

    console.log(
      `Complaint deleted: ${
        issue.complaintId || issue._id
      }`
    );

    return res.status(200).json({
      success: true,
      message:
        'Complaint deleted successfully',
      deletedIssueId:
        issue._id,
      complaintId:
        issue.complaintId || null,
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
 * TRACK ISSUE BY COMPLAINT ID
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

    const issue = await Issue.findOne({
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

module.exports = {
  createIssue,
  getMyIssues,
  getIssueById,
  deleteIssue,
  trackIssueByComplaintId,
};