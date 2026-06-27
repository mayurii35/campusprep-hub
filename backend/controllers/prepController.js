const dbHelper = require('../config/dbHelper');

exports.getPrepQuestions = async (req, res) => {
  const { category, subCategory } = req.query;
  try {
    const questions = await dbHelper.getQuestions({ category, subCategory });
    res.json(questions);
  } catch (err) {
    console.error('Fetch questions error:', err);
    res.status(500).json({ message: 'Server error retrieving questions' });
  }
};

exports.getCodingProblems = async (req, res) => {
  const { category } = req.query;
  try {
    const problems = await dbHelper.getCodingProblems({ category });
    res.json(problems);
  } catch (err) {
    console.error('Fetch coding problems error:', err);
    res.status(500).json({ message: 'Server error retrieving coding problems' });
  }
};

exports.submitAnswer = async (req, res) => {
  const { questionId, selectedOptionIndex } = req.body;

  if (selectedOptionIndex === undefined) {
    return res.status(400).json({ message: 'Please select an option' });
  }

  try {
    const questions = await dbHelper.getQuestions();
    const question = questions.find(q => q._id === questionId || q.id === questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isCorrect = question.correctOptionIndex === Number(selectedOptionIndex);

    // If answer is correct, update student progress
    if (isCorrect) {
      const user = await dbHelper.findUserById(req.user.id);
      if (user) {
        const completed = user.progress.completedTasks || [];
        const questionStrId = String(questionId);
        
        if (!completed.includes(questionStrId)) {
          completed.push(questionStrId);
          
          // Increment specific topic progress
          const progressObj = { ...user.progress, completedTasks: completed };
          const categoryField = question.category === 'aptitude' 
            ? 'aptitude' 
            : (question.category === 'hr' ? 'hr' : question.subCategory.toLowerCase());
          
          if (progressObj[categoryField] !== undefined) {
            progressObj[categoryField] = Math.min(progressObj[categoryField] + 5, 100);
          } else {
            // fallback generic increment
            progressObj.dsa = Math.min((progressObj.dsa || 0) + 2, 100);
          }

          await dbHelper.updateUser(req.user.id, {
            progress: progressObj,
            activity: [{
              action: 'Solved Question',
              details: `Successfully answered: "${question.title}" in ${question.topic}.`
            }]
          });
        }
      }
    }

    res.json({
      isCorrect,
      correctOptionIndex: question.correctOptionIndex,
      explanation: question.explanation
    });
  } catch (err) {
    console.error('Submit answer error:', err);
    res.status(500).json({ message: 'Server error validating answer' });
  }
};
