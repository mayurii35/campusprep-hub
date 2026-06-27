/**
 * Dedicated MongoDB Seeder
 * Seeds the MongoDB database with sample data for CampusPrep Hub.
 * Usage: node seedMongo.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Question = require('./models/Question');
const Test = require('./models/Test');
const Company = require('./models/Company');
const Job = require('./models/Job');

const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusprep';

// If user requests seeding from generated JSON files, load them instead of hardcoded arrays
const fromJsonFlag = process.argv.includes('--from-json') || process.env.SEED_FROM_JSON === 'true';
if (fromJsonFlag) {
  try {
    const dataDir = require('path').resolve(__dirname, '../frontend/src/data');
    const load = (name) => JSON.parse(require('fs').readFileSync(require('path').join(dataDir, name), 'utf8'));
    const aptitude = load('aptitude.json');
    const dsa = load('dsa.json');
    const sql = load('sql.json');
    const mockTests = load('mock_tests.json');
    const companies = load('companies_questions.json');
    const users = load('users_profiles.json');

    // Map loaded data to expected seed collections
    if (Array.isArray(aptitude)) {
      // Replace SEED_QUESTIONS with aptitude + some technical questions
      SEED_QUESTIONS = aptitude.concat(Array.isArray(dsa) ? dsa.slice(0, 50) : []);
    }
    if (Array.isArray(mockTests)) {
      SEED_TESTS = mockTests;
    }
    if (Array.isArray(companies)) {
      SEED_COMPANIES = companies;
    }
    if (Array.isArray(users)) {
      // Optionally create demo users later; for now keep users available
      // SEED_USERS is not used directly but available for custom flows
      global.SAMPLE_USERS = users;
    }
    console.log('Loaded sample data from frontend/src/data for seeding.');
  } catch (err) {
    console.warn('Could not load JSON seed files:', err.message);
  }
}

let SEED_QUESTIONS = [
  // Quantitative Aptitude
  {
    category: 'aptitude',
    subCategory: 'Quantitative Aptitude',
    topic: 'Averages',
    title: 'Average Age Problem',
    difficulty: 'Easy',
    questionText: 'The average age of 5 students in a class is 20 years. If a new student of age 26 joins, what is the new average age of the class?',
    options: ['21 years', '22 years', '23 years', '24 years'],
    correctOptionIndex: 0,
    explanation: 'Total age of 5 students = 5 * 20 = 100. New total age with 6th student = 100 + 26 = 126. New average age = 126 / 6 = 21 years.'
  },
  {
    category: 'aptitude',
    subCategory: 'Quantitative Aptitude',
    topic: 'Time & Work',
    title: 'Worker Efficiency Match',
    difficulty: 'Medium',
    questionText: 'A can complete a piece of work in 12 days and B can do it in 18 days. If they work together for 4 days, how much fraction of work is left?',
    options: ['4/9', '5/9', '2/3', '1/3'],
    correctOptionIndex: 0,
    explanation: 'A\'s 1-day work = 1/12. B\'s 1-day work = 1/18. Together 1-day work = (1/12 + 1/18) = 5/36. In 4 days, they complete = 4 * (5/36) = 20/36 = 5/9. Work left = 1 - 5/9 = 4/9.'
  },
  {
    category: 'aptitude',
    subCategory: 'Quantitative Aptitude',
    topic: 'Profit & Loss',
    title: 'Discount Calculation',
    difficulty: 'Easy',
    questionText: 'A shopkeeper marks an item 40% above the cost price and then offers a 20% discount. What is the net profit percentage?',
    options: ['12%', '15%', '20%', '10%'],
    correctOptionIndex: 0,
    explanation: 'Let CP = 100. Marked Price (MP) = 100 * 1.4 = 140. Selling Price (SP) after 20% discount = 140 * 0.8 = 112. Profit = SP - CP = 12%. Profit% = 12%.'
  },
  {
    category: 'aptitude',
    subCategory: 'Quantitative Aptitude',
    topic: 'Percentages',
    title: 'Population Growth',
    difficulty: 'Medium',
    questionText: 'The population of a town increases by 10% in the first year and decreases by 10% in the next year. If the initial population is 10,000, find the population after 2 years.',
    options: ['9,900', '10,000', '9,800', '10,100'],
    correctOptionIndex: 0,
    explanation: 'After 1 year: population = 10,000 * 1.10 = 11,000. After 2 years: population = 11,000 * 0.90 = 9,900.'
  },
  {
    category: 'aptitude',
    subCategory: 'Quantitative Aptitude',
    topic: 'Simple Interest',
    title: 'Interest Rate Finder',
    difficulty: 'Easy',
    questionText: 'Find the simple interest on ₹5,000 at 8% per annum for 3 years.',
    options: ['₹1,200', '₹1,000', '₹800', '₹1,500'],
    correctOptionIndex: 0,
    explanation: 'Simple Interest (SI) = (P * R * T) / 100 = (5000 * 8 * 3) / 100 = ₹1,200.'
  },

  // Logical Reasoning
  {
    category: 'aptitude',
    subCategory: 'Logical Reasoning',
    topic: 'Syllogism',
    title: 'Logic Deduction',
    difficulty: 'Medium',
    questionText: 'Statements: All books are pens. Some pens are pencils. Conclusions: I. Some books are pencils. II. Some pens are books.',
    options: ['Only conclusion I follows', 'Only conclusion II follows', 'Both I and II follow', 'Neither follows'],
    correctOptionIndex: 1,
    explanation: 'Since all books are pens, the set of books is a subset of pens. Some pens are pencils does not guarantee books overlap pencils, so I does not necessarily follow. But since all books are pens, some pens are definitely books. Thus, II follows.'
  },
  {
    category: 'aptitude',
    subCategory: 'Logical Reasoning',
    topic: 'Blood Relations',
    title: 'Family Tree Puzzle',
    difficulty: 'Medium',
    questionText: 'A is the father of B. C is the daughter of A. D is the brother of B. How is C related to D?',
    options: ['Sister', 'Mother', 'Cousin', 'Aunt'],
    correctOptionIndex: 0,
    explanation: 'A is the father of B, C, and D. Since C is the daughter of A and D is the brother of B, C and D are siblings. C is D\'s sister.'
  },
  {
    category: 'aptitude',
    subCategory: 'Logical Reasoning',
    topic: 'Number Series',
    title: 'Next Term Pattern',
    difficulty: 'Easy',
    questionText: 'Find the missing number in the sequence: 2, 6, 12, 20, 30, ?',
    options: ['42', '40', '38', '36'],
    correctOptionIndex: 0,
    explanation: 'The differences between consecutive terms are: 6-2=4, 12-6=6, 20-12=8, 30-20=10. The difference increases by 2 each time. The next difference is 12, so the next term is 30 + 12 = 42.'
  },

  // Verbal Ability
  {
    category: 'aptitude',
    subCategory: 'Verbal Ability',
    topic: 'Reading Comprehension',
    title: 'Vocabulary Context',
    difficulty: 'Easy',
    questionText: 'Identify the synonym for "PRUDENT" as used in a professional context.',
    options: ['Careless', 'Wise/Cautious', 'Hasty', 'Rebellious'],
    correctOptionIndex: 1,
    explanation: 'Prudent means showing care and thought for the future. Therefore, "Wise/Cautious" is the closest synonym.'
  },
  {
    category: 'aptitude',
    subCategory: 'Verbal Ability',
    topic: 'Sentence Correction',
    title: 'Subject-Verb Agreement',
    difficulty: 'Easy',
    questionText: 'Choose the grammatically correct sentence from the following options.',
    options: [
      'Neither the teacher nor the students was present.',
      'Neither the teacher nor the students were present.',
      'Neither the teacher or the students was present.',
      'Neither the teacher nor the students is present.'
    ],
    correctOptionIndex: 1,
    explanation: 'When subject nouns are joined by "neither... nor", the verb agrees with the closer subject. "Students" is plural, so it takes the plural verb "were".'
  },

  // Technical Questions - DSA
  {
    category: 'technical',
    subCategory: 'DSA',
    topic: 'Linked Lists',
    title: 'Detect Loop in Linked List',
    difficulty: 'Medium',
    questionText: 'Which algorithm is commonly used to detect a cycle/loop in a singly linked list with O(1) extra space?',
    options: ['Binary Search', 'Floyd\'s Cycle Detection (Tortoise and Hare)', 'Dijkstra\'s Algorithm', 'Kruskal\'s Algorithm'],
    correctOptionIndex: 1,
    explanation: 'Floyd\'s Cycle Detection uses two pointers: a slow pointer (moves one step) and a fast pointer (moves two steps). If there is a loop, they will meet. It takes O(N) time and O(1) space.'
  },
  {
    category: 'technical',
    subCategory: 'DSA',
    topic: 'Sorting & Searching',
    title: 'Quick Sort Pivot Selection',
    difficulty: 'Medium',
    questionText: 'What is the worst-case time complexity of Quick Sort, and when does it occur?',
    options: ['O(N log N) when pivot is random', 'O(N^2) when elements are already sorted and we pick the first/last element as pivot', 'O(N) when array is empty', 'O(N^2 log N) in all cases'],
    correctOptionIndex: 1,
    explanation: 'Quick Sort worst case is O(N^2) which occurs when the partition splits are highly unbalanced. This happens when the input array is already sorted (ascending/descending) and we always pick the first or last element as the pivot.'
  },
  {
    category: 'technical',
    subCategory: 'DSA',
    topic: 'Trees',
    title: 'Binary Tree Traversal',
    difficulty: 'Easy',
    questionText: 'In which binary tree traversal order do we visit the left subtree, then the root, then the right subtree?',
    options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'],
    correctOptionIndex: 1,
    explanation: 'Inorder traversal visits: Left -> Root -> Right.'
  },
  {
    category: 'technical',
    subCategory: 'DSA',
    topic: 'Dynamic Programming',
    title: 'Fibonacci Optimization',
    difficulty: 'Medium',
    questionText: 'What is the time complexity of computing the nth Fibonacci number using bottom-up dynamic programming?',
    options: ['O(2^N)', 'O(N)', 'O(N^2)', 'O(log N)'],
    correctOptionIndex: 1,
    explanation: 'Bottom-up dynamic programming computes each Fibonacci number sequentially from 1 to N in O(1) time using simple iteration. Total time complexity is O(N).'
  },

  // Technical Questions - DBMS
  {
    category: 'technical',
    subCategory: 'DBMS',
    topic: 'SQL Queries',
    title: 'ACID Properties',
    difficulty: 'Easy',
    questionText: 'In DBMS, which property ensures that all database operations in a transaction are executed successfully or none are?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    correctOptionIndex: 0,
    explanation: 'Atomicity is the "all-or-nothing" property ensuring that a transaction is treated as a single unit, which either succeeds completely or fails completely.'
  },
  {
    category: 'technical',
    subCategory: 'DBMS',
    topic: 'Normalization',
    title: 'Third Normal Form',
    difficulty: 'Medium',
    questionText: 'A database table is in 3NF if it is in 2NF and has no ___ dependency.',
    options: ['Partial', 'Transitive', 'Multivalued', 'Trivial'],
    correctOptionIndex: 1,
    explanation: 'Third Normal Form (3NF) requires that a table is in 2NF and there are no transitive functional dependencies of non-prime attributes on the primary key.'
  },

  // Technical Questions - OS
  {
    category: 'technical',
    subCategory: 'Operating Systems',
    topic: 'Deadlocks',
    title: 'Deadlock Conditions',
    difficulty: 'Medium',
    questionText: 'Which of the following is NOT one of the Coffman conditions required for a deadlock to occur?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Process Preemption'],
    correctOptionIndex: 3,
    explanation: 'The four Coffman conditions are Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait. Process Preemption is actually a way to prevent deadlocks, not a condition for them.'
  },
  {
    category: 'technical',
    subCategory: 'Operating Systems',
    topic: 'Scheduling',
    title: 'CPU Scheduling Algorithm',
    difficulty: 'Easy',
    questionText: 'Which CPU scheduling algorithm yields the minimum average waiting time for a constant set of processes?',
    options: ['First Come First Served (FCFS)', 'Shortest Job First (SJF)', 'Round Robin (RR)', 'Priority Scheduling'],
    correctOptionIndex: 1,
    explanation: 'Shortest Job First (SJF) scheduling is optimal because it minimizes the average waiting time by executing the process with the shortest burst time first.'
  },

  // Technical Questions - CN
  {
    category: 'technical',
    subCategory: 'Computer Networks',
    topic: 'IP Addressing',
    title: 'TCP vs UDP Protocols',
    difficulty: 'Easy',
    questionText: 'Which protocol is connectionless and does not guarantee packet delivery sequence?',
    options: ['TCP', 'UDP', 'HTTP', 'FTP'],
    correctOptionIndex: 1,
    explanation: 'UDP (User Datagram Protocol) is a connectionless transport protocol that prioritizes speed and low latency over reliability and ordered delivery.'
  },
  {
    category: 'technical',
    subCategory: 'Computer Networks',
    topic: 'OSI Model',
    title: 'OSI Layer Count',
    difficulty: 'Easy',
    questionText: 'How many layers are defined in the open standard OSI reference model?',
    options: ['5', '6', '7', '8'],
    correctOptionIndex: 2,
    explanation: 'The OSI (Open Systems Interconnection) reference model defines 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.'
  },

  // Technical Questions - OOP
  {
    category: 'technical',
    subCategory: 'OOP',
    topic: 'Encapsulation',
    title: 'OOP Core Pillars',
    difficulty: 'Easy',
    questionText: 'Which OOP concept refers to wrapping data (variables) and code (methods) together as a single unit and restricting direct access?',
    options: ['Polymorphism', 'Inheritance', 'Encapsulation', 'Abstraction'],
    correctOptionIndex: 2,
    explanation: 'Encapsulation is the process of binding data members and methods into a single class unit, using private access modifiers to hide internal details.'
  },
  {
    category: 'technical',
    subCategory: 'OOP',
    topic: 'Polymorphism',
    title: 'Runtime Polymorphism',
    difficulty: 'Medium',
    questionText: 'Which object-oriented programming concept is demonstrated when a subclass provides a specific implementation of a method declared in its superclass?',
    options: ['Method Overloading', 'Method Overriding', 'Interface Inheritance', 'Operator Overloading'],
    correctOptionIndex: 1,
    explanation: 'Method Overriding allows runtime polymorphism, enabling an object to override a method at runtime to execute subclass behavior.'
  },

  // HR / Behavioral Questions (MCQs for the Practice page)
  {
    category: 'hr',
    subCategory: 'HR & Behavioral',
    topic: 'STAR Method',
    title: 'STAR Acronym Meaning',
    difficulty: 'Easy',
    questionText: 'When responding to behavioral interview questions, what does the STAR acronym stand for?',
    options: [
      'Situation, Task, Action, Result',
      'System, Technology, Architecture, Reliability',
      'Strategy, Teamwork, Agility, Resolution',
      'Strength, Talent, Ambition, Resourcefulness'
    ],
    correctOptionIndex: 0,
    explanation: 'The STAR method stands for Situation (set the context), Task (describe the responsibility/challenge), Action (explain what you did), and Result (share the outcomes/metrics).'
  },
  {
    category: 'hr',
    subCategory: 'HR & Behavioral',
    topic: 'Handling Weaknesses',
    title: 'Weakness Presentation Strategy',
    difficulty: 'Medium',
    questionText: 'When an interviewer asks you about your greatest weakness, what is the most effective strategy to respond?',
    options: [
      'State a strength disguised as a weakness, like "I work too hard."',
      'Claim you do not have any major weaknesses that would affect work.',
      'Share a real, non-critical weakness and explain the concrete actions you are taking to improve it.',
      'Admit a fundamental flaw like "I struggle to work in teams" without further comments.'
    ],
    correctOptionIndex: 2,
    explanation: 'The best strategy is to show self-awareness by sharing a genuine but manageable weakness, immediately followed by the specific steps you are taking to overcome it (e.g., taking a course, using planning tools).'
  },
  {
    category: 'hr',
    subCategory: 'HR & Behavioral',
    topic: 'Company Choice',
    title: 'Company Alignment',
    difficulty: 'Easy',
    questionText: 'Which of the following approaches is most effective when answering "Why do you want to work for our company?"',
    options: [
      'Mention the attractive compensation packages and employee perks.',
      'Align your career aspirations with the company\'s mission, products, and culture, showing you researched their recent achievements.',
      'State that you are open to any job and need experience.',
      'Compliment the interviewer\'s background and ask them to explain it.'
    ],
    correctOptionIndex: 1,
    explanation: 'Recruiters want to see that you have done your homework. Demonstrating alignment with their core values, products, and tech stack makes you stand out as a motivated candidate.'
  },
  {
    category: 'hr',
    subCategory: 'HR & Behavioral',
    topic: 'Conflict Resolution',
    title: 'Resolving Peer Conflicts',
    difficulty: 'Medium',
    questionText: 'During a group project, a peer disagrees with your implementation choice. How should you address this conflict in an interview response?',
    options: [
      'Explain how you complained to the supervisor to let them decide.',
      'State that you stood your ground until the teammate backed down.',
      'Describe how you listened to their perspective, evaluated trade-offs objectively, and found a collaborative compromise.',
      'Ignore the conflict and completed your part of the code independently.'
    ],
    correctOptionIndex: 2,
    explanation: 'Conflict resolution questions test collaboration. Showing that you listen actively, discuss options objectively based on technical merits, and seek a shared win is the ideal response.'
  },
  {
    category: 'hr',
    subCategory: 'HR & Behavioral',
    topic: 'Self Introduction',
    title: 'Elevator Pitch Structure',
    difficulty: 'Easy',
    questionText: 'What is the recommended chronological flow for a 90-second "Tell me about yourself" response?',
    options: [
      'Childhood hobbies -> Primary school -> College details -> Future dreams',
      'Present (current role/studies) -> Past (key projects/internships) -> Future (why you are excited for this role)',
      'List all technical skills -> GPA details -> College course names -> Family history',
      'Detailed resume walkthrough line-by-line starting from high school graduation'
    ],
    correctOptionIndex: 1,
    explanation: 'A clean, professional pitch uses the Present-Past-Future framework: outline what you do now, highlight 1-2 major past successes/skills, and connect them to why you are here today.'
  },
  {
    category: 'hr',
    subCategory: 'HR & Behavioral',
    topic: 'Handling Failures',
    title: 'Discussing Professional Failures',
    difficulty: 'Medium',
    questionText: 'When discussing a past failure in an interview, what is the primary quality the interviewer is evaluating?',
    options: [
      'Your ability to avoid making mistakes altogether.',
      'Who you blamed for the failure.',
      'Your resilience, self-reflection, and what you learned from the experience.',
      'How quickly you forgot about the incident.'
    ],
    correctOptionIndex: 2,
    explanation: 'Interviewers look for growth mindset and accountability. Acknowledging a mistake, taking responsibility, showing resilience, and highlighting the lessons learned are key.'
  }
];

let SEED_TESTS = [
  {
    title: 'Aptitude Diagnostic Assessment',
    type: 'Aptitude',
    duration: 15,
    difficulty: 'Easy',
    company: '',
    questions: [
      {
        questionText: 'Average age of 5 students is 20 years. If a new student of age 26 joins, what is the new average age?',
        options: ['21 years', '22 years', '23 years', '24 years'],
        correctOptionIndex: 0,
        explanation: 'Total = 5 * 20 = 100. New total = 100 + 26 = 126. New Average = 126 / 6 = 21.'
      },
      {
        questionText: 'A can do work in 12 days and B in 18 days. Working together for 4 days, what fraction of work remains?',
        options: ['4/9', '5/9', '2/3', '1/3'],
        correctOptionIndex: 0,
        explanation: '1/12 + 1/18 = 5/36. In 4 days = 20/36 = 5/9 completed. Left = 4/9.'
      },
      {
        questionText: 'Statements: All books are pens. Some pens are pencils. Conclusions: I. Some books are pencils. II. Some pens are books.',
        options: ['Only conclusion I follows', 'Only conclusion II follows', 'Both follow', 'Neither follows'],
        correctOptionIndex: 1,
        explanation: 'Some pens are books because all books are pens.'
      }
    ]
  },
  {
    title: 'Full Technical Prep Challenge',
    type: 'Technical',
    duration: 30,
    difficulty: 'Medium',
    company: '',
    questions: [
      {
        questionText: 'Which algorithm is commonly used to detect a cycle/loop in a singly linked list in O(1) space?',
        options: ['Binary Search', 'Floyd\'s Cycle Detection (Tortoise and Hare)', 'Dijkstra\'s Algorithm', 'Kruskal\'s Algorithm'],
        correctOptionIndex: 1,
        explanation: 'Floyd\'s cycle detection algorithm uses two pointers moving at different speeds.'
      },
      {
        questionText: 'What is the worst-case time complexity of Quick Sort, and when does it occur?',
        options: ['O(N log N) when pivot is random', 'O(N^2) when elements are already sorted and we pick the first/last element as pivot', 'O(N) when array is empty', 'O(N^2 log N) in all cases'],
        correctOptionIndex: 1,
        explanation: 'Quick Sort degrades to O(N^2) when the pivot choice partition splits are highly skewed.'
      },
      {
        questionText: 'In DBMS, which property ensures that all database operations in a transaction are executed successfully or none are?',
        options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
        correctOptionIndex: 0,
        explanation: 'Atomicity ensures "all-or-nothing" execution of database transactions.'
      },
      {
        questionText: 'Which OOP concept refers to wrapping data and code together as a single unit and restricting direct access?',
        options: ['Polymorphism', 'Inheritance', 'Encapsulation', 'Abstraction'],
        correctOptionIndex: 2,
        explanation: 'Encapsulation wraps data members and hides implementation details from outer classes.'
      }
    ]
  },
  {
    title: 'Google Software Engineer Simulation',
    type: 'Company-Specific',
    duration: 45,
    difficulty: 'Hard',
    company: 'Google',
    questions: [
      {
        questionText: 'Given an unsorted array of integers, which data structure allows finding the longest consecutive sequence in O(N) time?',
        options: ['Binary Search Tree', 'Hash Set', 'Max Heap', 'Singly Linked List'],
        correctOptionIndex: 1,
        explanation: 'Inserting all elements into a Hash Set allows O(1) lookups. We can then iterate through the array and check consecutive sequences efficiently in O(N) total runtime.'
      },
      {
        questionText: 'Which of the following IPC (Inter-Process Communication) mechanisms is fastest and why?',
        options: ['Sockets', 'Pipes', 'Shared Memory', 'Message Queues'],
        correctOptionIndex: 2,
        explanation: 'Shared Memory is the fastest because it avoids copying data between process address spaces and the kernel space; processes read/write directly to the memory region.'
      }
    ]
  }
];

let SEED_COMPANIES = [
  {
    name: 'Google',
    logo: 'google',
    description: 'Leading global technology giant specializing in internet-related services, cloud systems, and cutting-edge software engineering.',
    difficulty: 'Hard',
    roles: ['Software Engineer', 'Site Reliability Engineer', 'Associate Product Manager'],
    packages: '20 - 45 LPA',
    hiringProcess: [
      { roundNumber: 1, name: 'Online Coding Challenge', description: '2 complex algorithmic coding challenges hosted on Google online platform (90 mins).' },
      { roundNumber: 2, name: 'Technical Interview 1 (DS/Algo)', description: 'Problem solving on graphs, trees, or complex recursion with an engineer (45 mins).' },
      { roundNumber: 3, name: 'Technical Interview 2 (Systems)', description: 'Detailed evaluations of system design, concurrency, or advanced data layouts (45 mins).' },
      { roundNumber: 4, name: 'Googleyness & Leadership', description: 'Behavioral assessment tracking alignment with core team values, adaptability, and culture.' }
    ],
    previousQuestions: [
      { title: 'Longest Consecutive Subsequence', questionText: 'Find the length of the longest consecutive elements sequence in an unsorted array in O(n) time.', role: 'Software Engineer', year: '2025', category: 'Coding' },
      { title: 'Evaluate Reverse Polish Notation', questionText: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation using stack implementation.', role: 'Software Engineer', year: '2024', category: 'Coding' }
    ]
  },
  {
    name: 'Amazon',
    logo: 'amazon',
    description: 'Pioneering e-commerce, cloud computing, and digital streaming multinational focusing on customer obsession and leadership principles.',
    difficulty: 'Hard',
    roles: ['Software Development Engineer I', 'Cloud Support Associate', 'Data Engineer'],
    packages: '16 - 32 LPA',
    hiringProcess: [
      { roundNumber: 1, name: 'Online Assessment (OA)', description: 'Debugging questions, coding challenges, and Amazon Leadership simulation (120 mins).' },
      { roundNumber: 2, name: 'Technical Interview 1 (Coding & LP)', description: 'Algorithms questions alongside deep dive into Amazon Leadership Principles (45 mins).' },
      { roundNumber: 3, name: 'Technical Interview 2 (System Design)', description: 'High level system layout design or object oriented design evaluation.' },
      { roundNumber: 4, name: 'Bar Raiser Round', description: 'Comprehensive interview matching SDE qualifications and rigorous Leadership Principles alignment.' }
    ],
    previousQuestions: [
      { title: 'Merge K Sorted Lists', questionText: 'Merge k sorted linked lists and return it as one sorted list. Analyze its complexity.', role: 'SDE I', year: '2025', category: 'Coding' },
      { title: 'Design LRU Cache', questionText: 'Design and build a data structure for Least Recently Used (LRU) Cache supporting get and put in O(1) time.', role: 'SDE I', year: '2024', category: 'Coding' }
    ]
  },
  {
    name: 'Microsoft',
    logo: 'microsoft',
    description: 'Global developer of computer software, hardware, cloud platforms, and developer frameworks like Azure and VS Code.',
    difficulty: 'Hard',
    roles: ['Software Engineer', 'Data Scientist', 'Program Manager'],
    packages: '18 - 40 LPA',
    hiringProcess: [
      { roundNumber: 1, name: 'Coding Assessment', description: 'Online coding test focusing on arrays, strings, and hash maps (90 mins).' },
      { roundNumber: 2, name: 'Technical Screening', description: 'Phone call or MS Teams live code review exploring fundamentals of DSA and databases.' },
      { roundNumber: 3, name: 'Onsite Loop (3 Rounds)', description: 'Consecutive code design, systems structure, and program delivery interviews.' }
    ],
    previousQuestions: [
      { title: 'Lowest Common Ancestor in BST', questionText: 'Find the lowest common ancestor (LCA) node of two given nodes in a Binary Search Tree.', role: 'Software Engineer', year: '2025', category: 'Coding' }
    ]
  },
  {
    name: 'TCS',
    logo: 'tcs',
    description: 'Renowned multinational IT consulting services firm serving corporate operations around the globe.',
    difficulty: 'Medium',
    roles: ['Ninja Developer', 'Digital Developer', 'Prime Developer'],
    packages: '3.6 - 9 LPA',
    hiringProcess: [
      { roundNumber: 1, name: 'National Qualifier Test (NQT)', description: 'Online test checking Quantitative Aptitude, English, Reasoning, and 2 Coding Tasks.' },
      { roundNumber: 2, name: 'Technical & HR Interview', description: 'Unified panel evaluation reviewing OOP, SQL basics, final year projects, and resume details.' }
    ],
    previousQuestions: [
      { title: 'Find Prime Factors', questionText: 'Write a program to display all prime factors of a given positive integer.', role: 'Digital Developer', year: '2025', category: 'Coding' },
      { title: 'String Reversal Word-by-Word', questionText: 'Reverse the words in a given sentence while keeping spacing structures.', role: 'Ninja Developer', year: '2024', category: 'Coding' }
    ]
  },
  {
    name: 'Infosys',
    logo: 'infosys',
    description: 'Leading digital services and consulting company, providing next-generation digital services and engineering tracks.',
    difficulty: 'Medium',
    roles: ['Systems Engineer', 'Power Programmer', 'Digital Specialist Engineer'],
    packages: '3.6 - 9.5 LPA',
    hiringProcess: [
      { roundNumber: 1, name: 'Certification Hackathon', description: 'Programming evaluation covering relational query structure and basic DSA.' },
      { roundNumber: 2, name: 'Technical Interview', description: 'Reviewing database systems, networking concepts, and OOP core models.' }
    ],
    previousQuestions: [
      { title: 'Anagram Validation', questionText: 'Write a function to check if two strings are anagrams of each other.', role: 'Systems Engineer', year: '2025', category: 'Coding' }
    ]
  },
  {
    name: 'Wipro',
    logo: 'wipro',
    description: 'Global IT, consulting, and business process services company leveraging digital transformation frameworks.',
    difficulty: 'Medium',
    roles: ['Project Engineer', 'Graduate Trainee'],
    packages: '3.5 - 7.5 LPA',
    hiringProcess: [
      { roundNumber: 1, name: 'Elite NLTH exam', description: 'Logical reasoning, verbal ability, and 2 code assignments.' },
      { roundNumber: 2, name: 'Combined Technical/HR Panel', description: 'Reviewing key programming paradigms and situational communication.' }
    ],
    previousQuestions: [
      { title: 'Palindrome Check', questionText: 'Verify if a string reads the same forward and backward, ignoring case.', role: 'Project Engineer', year: '2025', category: 'Coding' }
    ]
  },
  {
    name: 'Flipkart',
    logo: 'flipkart',
    description: 'Multinational e-commerce leader building highly scalable system software architectures.',
    difficulty: 'Hard',
    roles: ['Software Development Engineer', 'Associate SDE', 'Data Analyst'],
    packages: '15 - 26 LPA',
    hiringProcess: [
      { roundNumber: 1, name: 'Online Coding Test', description: '3 complex algorithmic challenges focusing on graphs or dynamic programming.' },
      { roundNumber: 2, name: 'Machine Coding Round', description: 'Build a working object-oriented system under strict deadlines.' }
    ],
    previousQuestions: [
      { title: 'Trapping Rain Water', questionText: 'Calculate how much water can be trapped inside an elevation map after rainfall.', role: 'SDE', year: '2025', category: 'Coding' }
    ]
  },
  {
    name: 'Adobe',
    logo: 'adobe',
    description: 'Global developer of digital creativity tools and web advertising solutions.',
    difficulty: 'Hard',
    roles: ['Member of Technical Staff', 'Software Engineer'],
    packages: '18 - 36 LPA',
    hiringProcess: [
      { roundNumber: 1, name: 'Online Assessment', description: 'MCQs on CS fundamentals, OS, networking, and 2 advanced coding challenges.' },
      { roundNumber: 2, name: 'Technical Loops (2 rounds)', description: 'Deep dive into data layouts, threading models, and optimization.' }
    ],
    previousQuestions: [
      { title: 'Clone Graph with Random Reference', questionText: 'Deep copy a graph where nodes contain arbitrary connections.', role: 'MTS', year: '2025', category: 'Coding' }
    ]
  }
];

let SEED_JOBS = [
  {
    title: 'Software Development SDE Intern',
    companyName: 'Amazon',
    logo: 'amazon',
    location: 'Bangalore, India (Hybrid)',
    type: 'Internship',
    salary: '₹80,000 / month',
    eligibility: 'B.Tech CSE/ECE/IT (Pre-final year), CGPA > 7.5',
    description: 'Looking for enthusiastic developers to build features for Amazon Retail services. Must have strong understanding of Java/C++ and core DS/Algo.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
    applicantsCount: 245
  },
  {
    title: 'Graduate Engineer Trainee (GET) Drive',
    companyName: 'TCS Digital',
    logo: 'tcs',
    location: 'Pune / Mumbai (Onsite)',
    type: 'Placement Drive',
    salary: '₹7.0 - 9.0 LPA',
    eligibility: 'B.Tech / M.Tech (All Branches), Passing Year 2026',
    description: 'TCS National Qualifier Drive for Digital and Prime roles. Evaluates programming efficiency, system paradigms, and engineering aptitude.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    applicantsCount: 1890
  },
  {
    title: 'Associate Software Engineer - Azure Core',
    companyName: 'Microsoft',
    logo: 'microsoft',
    location: 'Hyderabad, India',
    type: 'Job Opportunity',
    salary: '₹22.5 LPA',
    eligibility: 'B.Tech CSE/ECE or equivalent, CGPA > 8.0',
    description: 'Work with the Azure Core Cloud infrastructure team to build reliable distributed services. Focuses on networking, systems code, and C#/C++ programming.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
    applicantsCount: 412
  },
  {
    title: 'Systems Engineering Intern',
    companyName: 'Google',
    logo: 'google',
    location: 'Bangalore, India',
    type: 'Internship',
    salary: '₹1,00,000 / month',
    eligibility: 'B.Tech/M.Tech/MCA pre-final year students',
    description: 'Engage with Google Site Reliability or Cloud platform groups. Focuses on Unix internals, network models, and scripting (Python/Go).',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
    applicantsCount: 520
  },
  {
    title: 'SDE-1 Campus Hiring Drive',
    companyName: 'Flipkart',
    logo: 'flipkart',
    location: 'Bangalore, India (Onsite)',
    type: 'Placement Drive',
    salary: '₹18 - 24 LPA',
    eligibility: 'B.Tech CS/IT, CGPA > 7.0',
    description: 'Contribute to core transactional services at scale. Requires proficiency in algorithms design, relational queries, and concurrency.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    applicantsCount: 380
  },
  {
    title: 'Member of Technical Staff - Creative Cloud',
    companyName: 'Adobe',
    logo: 'adobe',
    location: 'Noida, India',
    type: 'Job Opportunity',
    salary: '₹20 - 32 LPA',
    eligibility: 'B.Tech/M.Tech CS/IT, CGPA > 8.0',
    description: 'Participate in developing features for Adobe illustrator and design suites. Demands highly structural C++ programming skill.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
    applicantsCount: 295
  }
];

async function seed() {
  try {
    console.log(`Connecting to MongoDB at: ${connUri}...`);
    await mongoose.connect(connUri, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected to MongoDB.');

    await User.deleteMany({});
    await Question.deleteMany({});
    await Test.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    console.log('Cleared existing collections.');

    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('password123', salt);

    const demoUser = new User({
      email: 'student@college.edu',
      password: demoPasswordHash,
      isOnboarded: false,
      streak: 3,
      lastActive: new Date(),
      profile: {
        fullName: 'Alex Carter',
        collegeName: 'National Institute of Technology',
        branch: 'Computer Science & Engineering',
        academicYear: 'Final Year',
        cgpa: 8.7,
        skills: ['JavaScript', 'React', 'Python', 'SQL'],
        targetCompanies: ['Google', 'Amazon', 'Microsoft']
      },
      assessment: { aptitude: 8, dsa: 7, dbms: 6, os: 5, cn: 5, oop: 7, communication: 8 },
      goal: 'Dream Company Preparation',
      roadmap: {
        placementReadinessScore: 78,
        strengths: ['Aptitude & Reasoning', 'Data Structures & Algorithms', 'Object Oriented Programming', 'Communication & Soft Skills'],
        weakAreas: ['Database Management Systems', 'Operating Systems', 'Computer Networks'],
        recommendedLearningPath: [
          'Master DSA concepts (Trees, Graphs, Dynamic Programming)',
          'Practice coding challenges on LeetCode/GeeksforGeeks',
          'In-depth Operating Systems and DBMS practice',
          'Mock Interview simulations & System Design basics'
        ],
        weeklyStudyPlan: [
          { week: 1, topics: ['Database Management Systems'], tasks: ['Complete SQL indexing guide', 'Practice normalization rules'] },
          { week: 2, topics: ['Operating Systems'], tasks: ['Review semaphore scheduling', 'Solve memory allocation tasks'] },
          { week: 3, topics: ['Computer Networks'], tasks: ['Understand TCP handshake and headers', 'Complete subnets practices'] },
          { week: 4, topics: ['Mock Interviews & Company Prep'], tasks: ['Run 2 full coding interviews in DSA', 'Complete mock tests'] }
        ],
        estimatedTimeline: '6 Weeks'
      },
      progress: { aptitude: 45, dsa: 60, dbms: 30, os: 15, cn: 20, oop: 40, hr: 25, completedTasks: [] },
      activity: [
        { date: new Date(Date.now() - 1000 * 60 * 60 * 48), action: 'Joined Hub', details: 'Welcome to CampusPrep Hub!' },
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24), action: 'Completed Profile Setup', details: 'Configured academic targets.' }
      ]
    });
    await demoUser.save();
    console.log('Created demo user: student@college.edu / password123');

    await Question.insertMany(SEED_QUESTIONS);
    console.log(`Seeded ${SEED_QUESTIONS.length} questions.`);

    await Test.insertMany(SEED_TESTS);
    console.log(`Seeded ${SEED_TESTS.length} tests.`);

    await Company.insertMany(SEED_COMPANIES);
    console.log(`Seeded ${SEED_COMPANIES.length} companies.`);

    await Job.insertMany(SEED_JOBS);
    console.log(`Seeded ${SEED_JOBS.length} jobs.`);

    console.log('\n✅ MongoDB seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
