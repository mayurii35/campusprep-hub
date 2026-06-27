const dbHelper = require('../config/dbHelper');

exports.generateRoadmap = async (req, res) => {
  const { profile, assessment, goal } = req.body;

  if (!profile || !assessment || !goal) {
    return res.status(400).json({ message: 'Missing onboarding details' });
  }

  try {
    // 1. Calculate Placement Readiness Score (scale of 0-100)
    // Formula: (CGPA out of 10) * 3 + (Average Assessment out of 10) * 7
    const cgpa = Number(profile.cgpa) || 7.0;
    const ratings = Object.values(assessment).map(Number);
    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / (ratings.length || 1);
    
    const readinessScore = Math.min(
      Math.round((cgpa * 3) + (avgRating * 7)),
      100
    );

    // 2. Identify Strengths and Weak Areas
    const strengths = [];
    const weakAreas = [];
    
    const subjectMap = {
      aptitude: 'Aptitude & Reasoning',
      dsa: 'Data Structures & Algorithms',
      dbms: 'Database Management Systems',
      os: 'Operating Systems',
      cn: 'Computer Networks',
      oop: 'Object Oriented Programming',
      communication: 'Communication & Soft Skills'
    };

    for (const [key, score] of Object.entries(assessment)) {
      const subjectName = subjectMap[key] || key;
      if (Number(score) >= 7) {
        strengths.push(subjectName);
      } else {
        weakAreas.push(subjectName);
      }
    }

    // Default to at least one strength/weakness if none fall cleanly
    if (strengths.length === 0) strengths.push('Soft Skills');
    if (weakAreas.length === 0) weakAreas.push('Database Query Optimization');

    // 3. Recommended Learning Path based on Goal
    let path = [];
    if (goal.includes('Product-Based') || goal.includes('Dream')) {
      path = [
        'Master DSA concepts (Trees, Graphs, Dynamic Programming)',
        'Practice coding challenges on LeetCode/GeeksforGeeks',
        'In-depth Operating Systems and DBMS practice',
        'Mock Interview simulations & System Design basics'
      ];
    } else if (goal.includes('Service-Based')) {
      path = [
        'Quantitative Aptitude & Logical Reasoning basics',
        'Fundamental programming concepts (OOP in Java/C++/Python)',
        'Basic SQL questions and database schema definitions',
        'Communication and mock resume evaluation rounds'
      ];
    } else if (goal.includes('Internship')) {
      path = [
        'Data Structures core basics (Arrays, Linked Lists, Stacks)',
        'Object-Oriented Programming principles',
        'Logical reasoning and verbal assessments',
        'Build a mini-project and optimize resume profile'
      ];
    } else {
      path = [
        'General Aptitude & Puzzle Practice',
        'Core Technical Revision (DSA, OOP, SQL)',
        'Mock Interview simulator sessions',
        'Resume review and portfolio project showcase'
      ];
    }

    // 4. Generate Weekly Study Plan (e.g. 6 to 12 weeks based on readiness score)
    const weeksCount = readinessScore >= 80 ? 6 : (readinessScore >= 50 ? 8 : 12);
    const weeklyStudyPlan = [];
    
    // Distribute weak areas across first weeks, then focus on interview prep
    const allTopics = [...weakAreas, ...strengths];
    
    for (let w = 1; w <= weeksCount; w++) {
      const topics = [];
      const tasks = [];
      
      if (w <= Math.ceil(weeksCount / 2)) {
        // Focus on weak topics in first half
        const topicIdx = (w - 1) % allTopics.length;
        const mainTopic = allTopics[topicIdx];
        topics.push(mainTopic);
        tasks.push(`Complete basic exercises on ${mainTopic}`);
        tasks.push(`Read standard interview definitions for ${mainTopic}`);
        tasks.push(`Attempt at least 15 practice questions in ${mainTopic}`);
      } else {
        // Mock tests and interview simulation in second half
        topics.push('Mock Interviews & Company Prep');
        tasks.push('Complete 1 Full-Length Mock Placement Test');
        tasks.push('Complete 2 AI Interview Simulator Sessions');
        tasks.push('Analyze company-specific hiring archives');
      }

      weeklyStudyPlan.push({
        week: w,
        topics,
        tasks
      });
    }

    // 5. Estimated Placement Readiness Timeline
    const estimatedTimeline = `${weeksCount} Weeks`;

    const roadmap = {
      placementReadinessScore: readinessScore,
      strengths,
      weakAreas,
      recommendedLearningPath: path,
      weeklyStudyPlan,
      estimatedTimeline
    };

    // 6. Save updates to user profile
    const updatedUser = await dbHelper.updateUser(req.user.id, {
      profile,
      assessment,
      goal,
      roadmap,
      isOnboarded: true,
      activity: [{ 
        action: 'Onboarding Completed', 
        details: `Generated personalized roadmap with a score of ${readinessScore}%.` 
      }]
    });

    res.json({
      message: 'Onboarding completed and roadmap generated successfully',
      roadmap,
      user: {
        id: updatedUser._id || updatedUser.id,
        isOnboarded: updatedUser.isOnboarded,
        roadmap: updatedUser.roadmap
      }
    });
  } catch (err) {
    console.error('Roadmap generation error:', err);
    res.status(500).json({ message: 'Server error generating learning roadmap' });
  }
};
