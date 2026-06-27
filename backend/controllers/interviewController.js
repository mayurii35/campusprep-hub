const dbHelper = require('../config/dbHelper');

// Mock pool of interview questions
const INTERVIEW_QUESTIONS = [
  {
    id: 'int-1',
    topic: 'DSA',
    questionText: 'Explain the difference between a Process and a Thread.',
    keywords: ['memory', 'share', 'resource', 'lightweight', 'execution', 'process'],
    goodAnswer: 'A process is an independent executing program with its own memory space allocated by the OS. A thread is a lightweight unit of execution within a process that shares the parent process\'s memory space and resources, enabling concurrency.'
  },
  {
    id: 'int-2',
    topic: 'DSA',
    questionText: 'What is a Hash Map, and how are collisions resolved?',
    keywords: ['hash function', 'collision', 'chaining', 'probing', 'bucket', 'key', 'value'],
    goodAnswer: 'A Hash Map is a data structure that maps keys to values using a hashing function. Collisions occur when different keys hash to the same index and are resolved through techniques like Chaining (linked lists at each bucket) or Open Addressing (Linear/Quadratic probing).'
  },
  {
    id: 'int-3',
    topic: 'DBMS',
    questionText: 'What is Database Normalization and why do we use it?',
    keywords: ['redundancy', 'anomaly', 'normal form', 'integrity', 'table', 'split'],
    goodAnswer: 'Normalization is the process of structuring a relational database to reduce data redundancy and eliminate anomalies (insert, update, delete). It involves organizing fields into tables according to normal forms (1NF, 2NF, 3NF).'
  },
  {
    id: 'int-4',
    topic: 'System Design',
    questionText: 'What is the difference between SQL and NoSQL databases?',
    keywords: ['schema', 'relational', 'scale', 'horizontal', 'vertical', 'document', 'key-value'],
    goodAnswer: 'SQL databases are relational, table-based, have a predefined schema, and scale vertically (adding more CPU/RAM). NoSQL databases are non-relational, have dynamic schemas (document, key-value, graph), and scale horizontally (adding more servers).'
  },
  {
    id: 'int-5',
    topic: 'OOP',
    questionText: 'Explain the concept of Polymorphism with a real-world example.',
    keywords: ['overriding', 'overloading', 'interface', 'class', 'behavior', 'many forms'],
    goodAnswer: 'Polymorphism allows objects of different classes to be treated as objects of a common superclass, representing "many forms". An example is a "Shape" class with a draw() method, which is overridden by subclasses like "Circle" and "Square" to draw different things.'
  },
  {
    id: 'int-6',
    topic: 'Behavioral',
    questionText: 'Describe a situation where you had a conflict in a team and how you resolved it.',
    keywords: ['compromise', 'listen', 'communicate', 'collaboration', 'respect', 'resolution'],
    goodAnswer: 'A good response focuses on listening actively, separating personal bias from technical differences, discussing alternatives objectively, finding a middle ground, and prioritizing team success over ego.'
  }
];

exports.getInterviewQuestions = (req, res) => {
  const { topic, category } = req.query;
  const categoryMap = {
    DSA: 'Technical Interview',
    DBMS: 'Technical Interview',
    'System Design': 'Technical Interview',
    Behavioral: 'Behavioral Interview',
    HR: 'HR Interview',
    Resume: 'Resume-Based Questions'
  };

  dbHelper.getInterviewBank({ category: category || categoryMap[topic] }).then((bank) => {
    if (bank.length > 0) {
      return res.json(bank.slice(0, 12).map(q => ({
        id: q.id,
        topic: q.category,
        questionText: q.question,
        expectedFocus: q.expectedFocus
      })));
    }

    let questions = INTERVIEW_QUESTIONS;
    if (topic) {
      questions = INTERVIEW_QUESTIONS.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
    }

    res.json(questions.map(q => ({
      id: q.id,
      topic: q.topic,
      questionText: q.questionText
    })));
  }).catch((err) => {
    console.error('Interview bank fetch error:', err);
    res.status(500).json({ message: 'Server error retrieving interview questions' });
  });
};

exports.submitInterviewAnswer = async (req, res) => {
  const { questionId, answerText } = req.body;

  if (!questionId || !answerText || answerText.trim().length === 0) {
    return res.status(400).json({ message: 'Answer text is required' });
  }

  try {
    const bank = await dbHelper.getInterviewBank();
    const bankQuestion = bank.find(q => q.id === questionId);
    const question = bankQuestion ? {
      id: bankQuestion.id,
      topic: bankQuestion.category,
      questionText: bankQuestion.question,
      keywords: ['structure', 'example', 'impact', 'role', 'clarity', 'result'],
      goodAnswer: bankQuestion.sampleAnswer
    } : INTERVIEW_QUESTIONS.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ message: 'Interview question not found' });
    }

    const answerLower = answerText.toLowerCase();
    
    // Check keywords present
    const matchedKeywords = question.keywords.filter(keyword => 
      answerLower.includes(keyword)
    );

    // Calculate dynamic scores based on keyword density and word count
    const keywordScore = Math.round((matchedKeywords.length / question.keywords.length) * 10);
    
    let communicationScore = 5; // default starting point
    const wordCount = answerText.trim().split(/\s+/).length;
    
    if (wordCount > 40) communicationScore = 9;
    else if (wordCount > 20) communicationScore = 7;
    else if (wordCount > 5) communicationScore = 5;
    else communicationScore = 3;

    // Accuracy Score is keyword score with slight length modifiers
    let accuracyScore = Math.min(Math.max(keywordScore, 1), 10);
    if (wordCount < 10) accuracyScore = Math.max(accuracyScore - 2, 1);

    // Compile dynamic critique comments
    let strengths = [];
    let areasForImprovement = [];

    if (accuracyScore >= 7) {
      strengths.push('Demonstrated strong technical understanding of core concepts.');
    } else {
      areasForImprovement.push('Technical definition needs more detail. Try incorporating industry terms.');
    }

    if (matchedKeywords.length > 0) {
      strengths.push(`Good usage of critical keywords: ${matchedKeywords.join(', ')}.`);
    }

    const missingKeywords = question.keywords.filter(k => !matchedKeywords.includes(k));
    if (missingKeywords.length > 0) {
      areasForImprovement.push(`Try to reference these concepts: ${missingKeywords.slice(0, 3).join(', ')}.`);
    }

    if (wordCount < 15) {
      areasForImprovement.push('The explanation is too brief. Standard technical interviews require more elaboration.');
    } else {
      strengths.push('Communication length and flow are clear and structured.');
    }

    const feedback = {
      accuracyScore,
      communicationScore,
      overallScore: Math.round((accuracyScore + communicationScore) / 2),
      strengths,
      improvements: areasForImprovement,
      optimalAnswer: question.goodAnswer
    };

    // Update student profile with activity
    const user = await dbHelper.findUserById(req.user.id);
    if (user) {
      // Add slight readiness change
      const currentReadiness = user.roadmap.placementReadinessScore || 60;
      const readAdjustment = feedback.overallScore >= 7 ? 1 : 0;

      await dbHelper.updateUser(req.user.id, {
        roadmap: {
          ...user.roadmap,
          placementReadinessScore: Math.min(currentReadiness + readAdjustment, 100)
        },
        activity: [{
          action: 'Mock Interview Question Answered',
          details: `Answered: "${question.questionText.substring(0, 30)}..." - Evaluated score: ${feedback.overallScore}/10.`
        }]
      });
    }

    res.json(feedback);
  } catch (err) {
    console.error('Interview evaluation error:', err);
    res.status(500).json({ message: 'Server error analyzing interview answer' });
  }
};
