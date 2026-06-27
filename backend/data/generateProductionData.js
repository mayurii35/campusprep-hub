const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const backendDataPath = path.join(__dirname, 'db.json');
const frontendDataDir = path.join(__dirname, '..', '..', 'frontend', 'src', 'data');

const difficulties = ['Easy', 'Medium', 'Hard'];
const pick = (arr, i) => arr[i % arr.length];
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const aptitudeTopics = {
  'Quantitative Aptitude': [
    'Percentages', 'Profit and Loss', 'Simple Interest', 'Compound Interest', 'Time and Work',
    'Time Speed Distance', 'Averages', 'Ratio and Proportion', 'Number System', 'Permutation and Combination',
    'Probability', 'Mixtures and Alligation'
  ],
  'Logical Reasoning': [
    'Number Series', 'Blood Relations', 'Coding Decoding', 'Syllogism', 'Directions',
    'Seating Arrangement', 'Puzzles', 'Analogy', 'Data Sufficiency', 'Clocks and Calendars'
  ],
  'Verbal Ability': [
    'Synonyms', 'Antonyms', 'Sentence Correction', 'Reading Comprehension', 'Para Jumbles',
    'Fill in the Blanks', 'Error Spotting', 'Idioms and Phrases', 'Critical Reasoning'
  ]
};

const aptitudeTemplates = [
  (i, topic, subCategory) => {
    const base = 40 + (i % 35);
    const pct = 5 + (i % 8) * 5;
    const answer = Math.round(base * (100 + pct) / 100);
    return {
      questionText: `A value ${base} is increased by ${pct}%. What is the new value?`,
      options: [answer, answer + 2, answer - 3, answer + 5].map(String),
      correctOptionIndex: 0,
      explanation: `Increase = ${base} x ${pct}/100 = ${(base * pct / 100).toFixed(2)}. New value = ${base} x ${(100 + pct)}/100 = ${answer}.`
    };
  },
  (i) => {
    const cp = 100 + (i % 20) * 10;
    const profit = 8 + (i % 10);
    const sp = Math.round(cp * (100 + profit) / 100);
    return {
      questionText: `An article costs Rs. ${cp} and is sold at a profit of ${profit}%. Find the selling price.`,
      options: [`Rs. ${sp}`, `Rs. ${sp - 8}`, `Rs. ${sp + 12}`, `Rs. ${cp + profit}`],
      correctOptionIndex: 0,
      explanation: `Selling price = cost price x (100 + profit%)/100 = ${cp} x ${100 + profit}/100 = Rs. ${sp}.`
    };
  },
  (i) => {
    const a = 8 + (i % 6) * 2;
    const b = 12 + (i % 5) * 3;
    return {
      questionText: `A can finish a task in ${a} days and B can finish it in ${b} days. What is their combined one-day work?`,
      options: [`${a + b}/${a * b}`, `1/${a + b}`, `${a * b}/${a + b}`, `2/${a + b}`],
      correctOptionIndex: 0,
      explanation: `A's work per day is 1/${a} and B's is 1/${b}. Together = 1/${a} + 1/${b} = ${a + b}/${a * b}.`
    };
  },
  (i) => {
    const start = 2 + (i % 5);
    const diff = 3 + (i % 4);
    const seq = Array.from({ length: 5 }, (_, idx) => start + idx * diff);
    const next = start + 5 * diff;
    return {
      questionText: `Find the next number in the series: ${seq.join(', ')}, ?`,
      options: [next, next + diff, next - 1, next + 2].map(String),
      correctOptionIndex: 0,
      explanation: `The series increases by a constant difference of ${diff}. Therefore the next term is ${seq[4]} + ${diff} = ${next}.`
    };
  },
  (i) => {
    const words = ['prudent', 'meticulous', 'resilient', 'concise', 'ambiguous', 'diligent'];
    const answers = ['wise and careful', 'very careful', 'able to recover', 'brief and clear', 'unclear', 'hard-working'];
    const idx = i % words.length;
    return {
      questionText: `Choose the closest meaning of the word "${words[idx].toUpperCase()}".`,
      options: [answers[idx], 'careless', 'unrelated', 'temporary'],
      correctOptionIndex: 0,
      explanation: `"${words[idx]}" most closely means "${answers[idx]}" in placement verbal ability contexts.`
    };
  }
];

function buildAptitudeQuestions() {
  const questions = [];
  let id = 1;
  Object.entries(aptitudeTopics).forEach(([subCategory, topics], subIdx) => {
    const target = subCategory === 'Quantitative Aptitude' ? 84 : subCategory === 'Logical Reasoning' ? 72 : 60;
    for (let i = 0; i < target; i++) {
      const topic = pick(topics, i);
      const item = pick(aptitudeTemplates, i)(i + subIdx * 10, topic, subCategory);
      questions.push({
        _id: `apt-${String(id).padStart(3, '0')}`,
        id: `apt-${String(id).padStart(3, '0')}`,
        category: 'aptitude',
        subCategory,
        topic,
        title: `${topic} Practice ${i + 1}`,
        difficulty: pick(difficulties, i + subIdx),
        ...item
      });
      id++;
    }
  });
  return questions;
}

const codingCategories = ['Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Dynamic Programming'];
const codingTitles = {
  Arrays: ['Two Sum Indices', 'Maximum Subarray Sum', 'Rotate Array', 'Merge Intervals', 'Product Except Self'],
  Strings: ['Valid Anagram', 'Longest Common Prefix', 'Compress String', 'First Unique Character', 'Balanced Parentheses String'],
  'Linked Lists': ['Reverse Linked List', 'Detect Cycle', 'Merge Two Sorted Lists', 'Remove Nth Node', 'Find Middle Node'],
  Stacks: ['Min Stack', 'Next Greater Element', 'Evaluate Postfix Expression', 'Daily Temperatures', 'Remove Duplicate Letters'],
  Queues: ['Implement Queue Using Stacks', 'Circular Queue', 'First Non-Repeating Character Stream', 'Sliding Window Maximum', 'Rotten Oranges'],
  Trees: ['Level Order Traversal', 'Lowest Common Ancestor', 'Validate BST', 'Diameter of Binary Tree', 'Serialize Binary Tree'],
  Graphs: ['Number of Islands', 'Shortest Path BFS', 'Course Schedule', 'Clone Graph', 'Detect Cycle in Graph'],
  'Dynamic Programming': ['Climbing Stairs', 'Coin Change', 'Longest Increasing Subsequence', '0/1 Knapsack', 'Edit Distance']
};

function buildCodingProblems() {
  const problems = [];
  let id = 1;
  codingCategories.forEach((category, cIdx) => {
    for (let i = 0; i < 14; i++) {
      const title = `${pick(codingTitles[category], i)} ${Math.floor(i / codingTitles[category].length) + 1}`;
      const n = 5 + ((i + cIdx) % 8);
      problems.push({
        id: `code-${String(id).padStart(3, '0')}`,
        _id: `code-${String(id).padStart(3, '0')}`,
        category,
        title,
        difficulty: pick(difficulties, i + cIdx),
        tags: [category, pick(['Hashing', 'Two Pointers', 'Recursion', 'Greedy', 'BFS', 'DFS', 'Memoization'], i)],
        problemStatement: `Given an input focused on ${category.toLowerCase()}, design an efficient algorithm for "${title}". Return the requested result while handling edge cases such as empty input, duplicates, and boundary sizes.`,
        sampleInput: category === 'Strings' ? 's = "campusprep"' : category === 'Linked Lists' ? 'head = [1, 2, 3, 4, 5]' : `n = ${n}, values = [${Array.from({ length: n }, (_, k) => (k + 1) * ((i % 3) + 1)).join(', ')}]`,
        sampleOutput: category === 'Strings' ? '"prepared result"' : category === 'Linked Lists' ? '[5, 4, 3, 2, 1]' : String((n * (n + 1)) / 2),
        constraints: [
          '1 <= n <= 100000',
          '-1000000000 <= value <= 1000000000',
          'Use O(n log n) time or better where possible'
        ],
        solutionExplanation: `Identify the invariant for ${category.toLowerCase()}, choose the appropriate data structure, process each element once where possible, and maintain only the state needed for the final answer. Discuss time complexity and space complexity clearly in an interview.`,
        starterCode: `function solve(input) {\n  // Parse input and implement ${title}\n  return null;\n}`
      });
      id++;
    }
  });
  return problems;
}

const interviewCategories = ['HR Interview', 'Technical Interview', 'Behavioral Interview', 'Resume-Based Questions'];
const interviewPrompts = {
  'HR Interview': ['Tell me about yourself.', 'Why should we hire you?', 'What are your strengths?', 'What is your greatest weakness?', 'Why this company?'],
  'Technical Interview': ['Explain time complexity.', 'Describe normalization.', 'What is polymorphism?', 'Explain deadlock.', 'How does hashing work?'],
  'Behavioral Interview': ['Describe a conflict you resolved.', 'Tell me about a failure.', 'Give an example of leadership.', 'How do you handle pressure?', 'Describe teamwork.'],
  'Resume-Based Questions': ['Explain your final year project.', 'Why did you choose this tech stack?', 'What was the hardest bug you fixed?', 'How did your internship help you?', 'Defend one resume achievement.']
};

function buildInterviewBank() {
  const bank = [];
  let id = 1;
  interviewCategories.forEach((category, cIdx) => {
    for (let i = 0; i < 28; i++) {
      const prompt = pick(interviewPrompts[category], i);
      bank.push({
        id: `int-bank-${String(id).padStart(3, '0')}`,
        category,
        difficulty: pick(difficulties, i + cIdx),
        question: `${prompt} (${category} variant ${i + 1})`,
        expectedFocus: `Show clarity, structure, evidence, and role alignment for ${category.toLowerCase()}.`,
        sampleAnswer: `A strong answer starts with concise context, gives one concrete example, explains your individual action, and ends with measurable learning or impact relevant to the role.`,
        tips: [
          'Keep the answer structured and specific.',
          'Use metrics or concrete outcomes wherever possible.',
          'Connect the answer back to the job role.'
        ]
      });
      id++;
    }
  });
  return bank;
}

function buildHrMcqs() {
  return buildInterviewBank().slice(0, 48).map((q, i) => ({
    _id: `hr-${String(i + 1).padStart(3, '0')}`,
    id: `hr-${String(i + 1).padStart(3, '0')}`,
    category: 'hr',
    subCategory: q.category,
    topic: q.category,
    title: q.question.replace(/\s+\(.+\)$/, ''),
    difficulty: q.difficulty,
    questionText: `What is the best strategy for: ${q.question}`,
    options: [
      'Use a structured answer with context, action, and measurable result',
      'Give a one-word answer and wait for follow-up',
      'Avoid details to keep the interviewer guessing',
      'Memorize a generic answer unrelated to the role'
    ],
    correctOptionIndex: 0,
    explanation: 'Interviewers evaluate structure, evidence, communication, and fit. A specific example with a measurable result is stronger than a vague or memorized answer.'
  }));
}

function buildTechnicalMcqs() {
  const topics = {
    DSA: ['Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Dynamic Programming'],
    DBMS: ['SQL Queries', 'Normalization', 'Transactions', 'Indexing'],
    'Operating Systems': ['Processes and Threads', 'Deadlocks', 'Scheduling', 'Memory Management'],
    'Computer Networks': ['OSI Model', 'TCP UDP', 'IP Addressing', 'HTTP'],
    OOP: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction']
  };
  const questions = [];
  let id = 1;
  Object.entries(topics).forEach(([subCategory, list], sIdx) => {
    list.forEach((topic, tIdx) => {
      for (let i = 0; i < 5; i++) {
        questions.push({
          _id: `tech-${String(id).padStart(3, '0')}`,
          id: `tech-${String(id).padStart(3, '0')}`,
          category: 'technical',
          subCategory,
          topic,
          title: `${topic} Concept Check ${i + 1}`,
          difficulty: pick(difficulties, i + tIdx),
          questionText: `Which statement best describes a key concept in ${topic}?`,
          options: [
            `${topic} should be analyzed using correctness, complexity, and edge cases.`,
            `${topic} never affects performance.`,
            `${topic} is only useful in frontend styling.`,
            `${topic} cannot be discussed in interviews.`
          ],
          correctOptionIndex: 0,
          explanation: `A good technical answer explains ${topic}, why it matters, complexity or trade-offs, and an example edge case.`
        });
        id++;
      }
    });
  });
  return questions;
}

const companies = [
  ['TCS', 'Medium', '3.6 - 9 LPA'], ['Infosys', 'Medium', '3.6 - 9.5 LPA'], ['Wipro', 'Medium', '3.5 - 7.5 LPA'],
  ['Accenture', 'Medium', '4.5 - 12 LPA'], ['Cognizant', 'Medium', '4 - 8 LPA'], ['Capgemini', 'Medium', '4 - 7.5 LPA'],
  ['Deloitte', 'Hard', '6 - 14 LPA'], ['IBM', 'Medium', '4.5 - 12 LPA'], ['Tech Mahindra', 'Easy', '3.5 - 6.5 LPA'],
  ['HCL', 'Easy', '3.5 - 6 LPA'], ['Amazon', 'Hard', '16 - 32 LPA'], ['Microsoft', 'Hard', '18 - 40 LPA'], ['Google', 'Hard', '20 - 45 LPA']
];

function buildCompanies(codingProblems) {
  return companies.map(([name, difficulty, packages], idx) => ({
    _id: `company-${slug(name)}`,
    id: `company-${slug(name)}`,
    name,
    logo: slug(name),
    description: `${name} campus preparation profile with aptitude, coding, technical, managerial, and HR interview coverage.`,
    difficulty,
    roles: difficulty === 'Hard' ? ['Software Engineer', 'SDE Intern', 'Cloud Engineer'] : ['Graduate Engineer Trainee', 'Associate Software Engineer', 'Analyst Trainee'],
    packages,
    aptitudePattern: {
      sections: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'],
      duration: `${45 + (idx % 4) * 15} minutes`,
      questions: 40 + (idx % 5) * 10
    },
    codingRounds: [
      { name: 'Online Coding Round', problems: difficulty === 'Hard' ? 3 : 2, focus: difficulty === 'Hard' ? 'DSA, graphs, dynamic programming' : 'arrays, strings, basic implementation' },
      { name: 'Technical Discussion', problems: 1, focus: 'Explain approach, complexity, and edge cases' }
    ],
    selectionProcess: ['Online application', 'Aptitude assessment', 'Coding assessment', 'Technical interview', 'HR interview'],
    hiringProcess: ['Aptitude assessment', 'Coding round', 'Technical interview', 'HR interview'].map((round, rIdx) => ({
      roundNumber: rIdx + 1,
      name: round,
      description: `${name} evaluates ${round.toLowerCase()} with role-specific scoring and communication checks.`
    })),
    previousQuestions: Array.from({ length: 6 }, (_, qIdx) => {
      const p = codingProblems[(idx * 7 + qIdx) % codingProblems.length];
      return {
        title: p.title,
        questionText: p.problemStatement,
        role: difficulty === 'Hard' ? 'Software Engineer' : 'Associate Engineer',
        year: String(2026 - (qIdx % 3)),
        category: qIdx % 2 === 0 ? 'Coding' : 'Technical'
      };
    })
  }));
}

function buildTests(aptitude, technical) {
  const pool = [...aptitude, ...technical];
  return Array.from({ length: 20 }, (_, i) => {
    const company = companies[i % companies.length][0];
    const count = 30 + (i % 5) * 5;
    const questions = Array.from({ length: count }, (_, qIdx) => {
      const source = pool[(i * 17 + qIdx * 3) % pool.length];
      return {
        questionText: source.questionText,
        options: source.options,
        correctOptionIndex: source.correctOptionIndex,
        explanation: source.explanation,
        difficulty: source.difficulty,
        category: source.subCategory || source.category
      };
    });
    return {
      _id: `mock-${String(i + 1).padStart(2, '0')}`,
      id: `mock-${String(i + 1).padStart(2, '0')}`,
      title: `${company} Placement Mock Test ${i + 1}`,
      type: i % 3 === 0 ? 'Company-Specific' : i % 3 === 1 ? 'Aptitude + Technical' : 'Full-Length',
      duration: 45 + (i % 4) * 15,
      difficulty: pick(difficulties, i),
      company,
      scoring: { correctMarks: 1, incorrectMarks: 0, totalMarks: count },
      questions
    };
  });
}

function buildLeaderboard() {
  const names = ['Aarav Sharma', 'Isha Mehta', 'Rohan Gupta', 'Sneha Iyer', 'Kavya Rao', 'Arjun Nair', 'Meera Joshi', 'Dev Patel', 'Ananya Singh', 'Vikram Reddy', 'Nisha Verma', 'Kabir Khan', 'Tara Bose', 'Rahul Das', 'Priya Menon'];
  return names.map((name, i) => ({
    id: `leader-${i + 1}`,
    rank: i + 1,
    name,
    college: pick(['NIT Trichy', 'VIT Vellore', 'SRM University', 'PES University', 'Manipal Institute', 'JNTU Hyderabad'], i),
    score: 980 - i * 37,
    accuracy: 94 - i,
    completedTests: 20 - (i % 5),
    progress: 96 - i * 3,
    strongArea: pick(['Dynamic Programming', 'Quantitative Aptitude', 'DBMS', 'Graphs', 'Verbal Ability'], i),
    weakArea: pick(['Operating Systems', 'Probability', 'System Design', 'Puzzles', 'Networking'], i + 2)
  }));
}

function buildUsers(leaderboard) {
  const hash = bcrypt.hashSync('password123', 10);
  return leaderboard.slice(0, 8).map((entry, i) => ({
    _id: i === 0 ? 'demo-student-id' : `user-${i + 1}`,
    id: i === 0 ? 'demo-student-id' : `user-${i + 1}`,
    email: i === 0 ? 'student@college.edu' : `student${i + 1}@college.edu`,
    password: hash,
    isOnboarded: true,
    streak: 3 + i,
    lastActive: new Date(Date.now() - i * 86400000).toISOString(),
    profile: {
      fullName: entry.name,
      collegeName: entry.college,
      branch: pick(['Computer Science', 'Information Technology', 'Electronics and Communication'], i),
      academicYear: 'Final Year',
      cgpa: Number((8.1 + (i % 8) * 0.12).toFixed(2)),
      skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'DSA'],
      targetCompanies: ['Amazon', 'Microsoft', 'Google']
    },
    assessment: { aptitude: 8, dsa: 7, dbms: 7, os: 6, cn: 6, oop: 8, communication: 8 },
    goal: 'Production Placement Track',
    roadmap: {
      placementReadinessScore: entry.progress,
      strengths: ['Data Structures', entry.strongArea, 'Communication'],
      weakAreas: [entry.weakArea, 'Timed mock test consistency'],
      recommendedLearningPath: ['Solve one mock test every alternate day', 'Revise weak fundamentals', 'Practice one interview answer daily'],
      weeklyStudyPlan: [
        { week: 1, topics: ['Aptitude', 'Arrays'], tasks: ['Complete 30 aptitude questions', 'Solve 8 array problems', 'Review one company profile'] },
        { week: 2, topics: ['DBMS', 'Strings'], tasks: ['Revise normalization', 'Solve 8 string problems', 'Attempt one full mock test'] }
      ],
      estimatedTimeline: '6 Weeks'
    },
    progress: { aptitude: 70 + i, dsa: 65 + i, dbms: 58 + i, os: 50 + i, cn: 54 + i, oop: 68 + i, hr: 62 + i, completedTasks: [] },
    activity: [
      { date: new Date(Date.now() - 3 * 86400000).toISOString(), action: 'Completed Mock Test', details: `Scored ${entry.accuracy}% in a company simulation.` },
      { date: new Date(Date.now() - 86400000).toISOString(), action: 'Solved Coding Set', details: `Finished ${entry.strongArea} practice.` }
    ]
  }));
}

function buildJobs() {
  return companies.map(([name, difficulty, packages], i) => ({
    _id: `job-${slug(name)}`,
    id: `job-${slug(name)}`,
    title: difficulty === 'Hard' ? 'Software Engineer Campus Hiring' : 'Graduate Engineer Trainee Drive',
    companyName: name,
    logo: slug(name),
    location: pick(['Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Noida', 'Gurugram'], i),
    type: pick(['Internship', 'Placement Drive', 'Job Opportunity'], i),
    salary: packages,
    eligibility: 'B.Tech/M.Tech/MCA students, CGPA 7.0+, no active backlogs',
    description: `${name} is hiring campus candidates with aptitude, coding, CS fundamentals, and communication readiness.`,
    deadline: new Date(Date.now() + (10 + i) * 86400000).toISOString(),
    applicantsCount: 150 + i * 83
  }));
}

const aptitude = buildAptitudeQuestions();
const codingProblems = buildCodingProblems();
const technical = buildTechnicalMcqs();
const hr = buildHrMcqs();
const interviewBank = buildInterviewBank();
const companyData = buildCompanies(codingProblems);
const tests = buildTests(aptitude, technical);
const leaderboard = buildLeaderboard();
const users = buildUsers(leaderboard);
const jobs = buildJobs();
const db = {
  users,
  questions: [...aptitude, ...technical, ...hr],
  codingProblems,
  interviewBank,
  tests,
  companies: companyData,
  jobs,
  leaderboard,
  dashboardStats: {
    completedTests: 14,
    averageAccuracy: 82,
    weakAreas: ['Operating Systems', 'Probability', 'System Design'],
    strengths: ['Arrays', 'DBMS', 'Verbal Ability'],
    categoryProgress: { aptitude: 78, coding: 71, interview: 68, companyPrep: 74 }
  }
};

fs.mkdirSync(frontendDataDir, { recursive: true });
fs.writeFileSync(backendDataPath, `${JSON.stringify(db, null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'aptitude.json'), `${JSON.stringify(aptitude, null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'dsa.json'), `${JSON.stringify(technical.filter(q => q.subCategory === 'DSA'), null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'dbms.json'), `${JSON.stringify(technical.filter(q => q.subCategory === 'DBMS'), null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'os.json'), `${JSON.stringify(technical.filter(q => q.subCategory === 'Operating Systems'), null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'cn.json'), `${JSON.stringify(technical.filter(q => q.subCategory === 'Computer Networks'), null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'sql.json'), `${JSON.stringify(technical.filter(q => q.topic.includes('SQL')), null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'hr.json'), `${JSON.stringify(hr, null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'coding_problems.json'), `${JSON.stringify(codingProblems, null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'interview_questions.json'), `${JSON.stringify(interviewBank, null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'technical_interview.json'), `${JSON.stringify(interviewBank.filter(q => q.category === 'Technical Interview'), null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'companies_questions.json'), `${JSON.stringify(companyData, null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'company_stats.json'), `${JSON.stringify(db.dashboardStats, null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'mock_tests.json'), `${JSON.stringify(tests, null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'leaderboard.json'), `${JSON.stringify(leaderboard, null, 2)}\n`);
fs.writeFileSync(path.join(frontendDataDir, 'users_profiles.json'), `${JSON.stringify(users, null, 2)}\n`);

console.log(`Generated ${aptitude.length} aptitude questions`);
console.log(`Generated ${codingProblems.length} coding problems`);
console.log(`Generated ${interviewBank.length} interview questions`);
console.log(`Generated ${tests.length} mock tests with ${tests.reduce((sum, t) => sum + t.questions.length, 0)} total test questions`);
console.log(`Generated ${companyData.length} company profiles`);
