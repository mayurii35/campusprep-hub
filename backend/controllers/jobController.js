const dbHelper = require('../config/dbHelper');

exports.getJobs = async (req, res) => {
  try {
    const jobs = await dbHelper.getJobs();
    res.json(jobs);
  } catch (err) {
    console.error('Fetch jobs list error:', err);
    res.status(500).json({ message: 'Server error fetching placement jobs' });
  }
};

exports.applyJob = async (req, res) => {
  const { jobId } = req.body;

  if (!jobId) {
    return res.status(400).json({ message: 'Job ID is required' });
  }

  try {
    const updatedJob = await dbHelper.applyJob(jobId);
    if (!updatedJob) {
      return res.status(404).json({ message: 'Job listing not found' });
    }

    // Add activity log to user profile
    const user = await dbHelper.findUserById(req.user.id);
    if (user) {
      await dbHelper.updateUser(req.user.id, {
        activity: [{
          action: 'Applied for Job/Internship',
          details: `Submitted application for "${updatedJob.title}" at ${updatedJob.companyName}.`
        }]
      });
    }

    res.json({
      success: true,
      message: `Successfully applied to ${updatedJob.companyName}`,
      job: updatedJob
    });

  } catch (err) {
    console.error('Apply job error:', err);
    res.status(500).json({ message: 'Server error submitting application' });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await dbHelper.getCompanies();
    res.json(companies);
  } catch (err) {
    console.error('Fetch companies error:', err);
    res.status(500).json({ message: 'Server error fetching companies' });
  }
};

