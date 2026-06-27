const dbHelper = require('../config/dbHelper');

exports.getTestsList = async (req, res) => {
  try {
    const tests = await dbHelper.getTests();
    // Exclude full questions from list view to keep payload light
    const cleanTests = tests.map(t => ({
      id: t._id || t.id,
      title: t.title,
      type: t.type,
      duration: t.duration,
      difficulty: t.difficulty,
      company: t.company,
      questionsCount: t.questions.length
    }));
    res.json(cleanTests);
  } catch (err) {
    console.error('Fetch tests list error:', err);
    res.status(500).json({ message: 'Server error retrieving tests' });
  }
};

exports.getTestDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const test = await dbHelper.getTestById(id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    // Return test with questions. We can hide the correctOptionIndex if we want,
    // but we can also send it for frontend evaluation. To make it secure and clean:
    // we can return it, since this is a demonstration mock app.
    res.json(test);
  } catch (err) {
    console.error('Fetch test detail error:', err);
    res.status(500).json({ message: 'Server error retrieving test' });
  }
};

exports.submitTestResult = async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body; // Key-value: { questionIndex: selectedOptionIndex }

  try {
    const test = await dbHelper.getTestById(id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    
    const questionsBreakdown = test.questions.map((q, idx) => {
      const selected = answers[idx];
      const isAttempted = selected !== undefined && selected !== null;
      const isCorrect = isAttempted && Number(selected) === q.correctOptionIndex;

      if (!isAttempted) {
        unattemptedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      return {
        questionText: q.questionText,
        options: q.options,
        selectedOptionIndex: selected,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation,
        isAttempted,
        isCorrect
      };
    });

    const totalQuestions = test.questions.length;
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);

    // Update user profile progress/readiness score
    const user = await dbHelper.findUserById(req.user.id);
    if (user) {
      // Shift readiness score slightly positive if they scored high, negative if low
      let readinessAdjustment = scorePercent >= 75 ? 3 : (scorePercent < 40 ? -2 : 0);
      const newReadiness = Math.min(Math.max((user.roadmap.placementReadinessScore || 60) + readinessAdjustment, 10), 100);

      // Save activity and updated readiness
      await dbHelper.updateUser(req.user.id, {
        roadmap: {
          ...user.roadmap,
          placementReadinessScore: newReadiness
        },
        activity: [{
          action: 'Completed Mock Test',
          details: `Completed "${test.title}" scoring ${scorePercent}% (${correctCount}/${totalQuestions} correct answers).`
        }]
      });
    }

    res.json({
      testTitle: test.title,
      totalQuestions,
      correctCount,
      incorrectCount,
      unattemptedCount,
      scorePercent,
      questionsBreakdown
    });

  } catch (err) {
    console.error('Submit test error:', err);
    res.status(500).json({ message: 'Server error submitting test results' });
  }
};
