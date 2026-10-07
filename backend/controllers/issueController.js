const Issue = require('../models/Issue');

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

    const issue = await Issue.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim(),
      photoUrl: photoUrl || '',
      reportedBy: req.user._id,
      priority: priority || 'medium',
      status: 'pending',

      history: [
        {
          status: 'pending',
          note: 'Issue reported by student',
          changedBy: req.user._id,
        },
      ],
    });

    const populatedIssue = await Issue.findById(
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

module.exports = {
  createIssue,
  getMyIssues,
};