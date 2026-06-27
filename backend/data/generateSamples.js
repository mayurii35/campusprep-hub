const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '../../frontend/src/data');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
let idCounter = 1;
const nextId = (prefix) => `${prefix}-${idCounter++}`;

// Utilities for creating aptitude MCQs
const aptitudeTopics = {
  Quantitative: ['Percentages','Ratio & Proportion','Time & Work','Averages','Profit & Loss','SI & CI','Speed & Distance','Geometry','Algebra','Permutation & Combination','Probability'],
  Logical: ['Series','Syllogism','Blood Relations','Seating Arrangement','Venn Diagram','Coding-Decoding','Directions','Data Interpretation'],
  Verbal: ['Vocabulary','Synonyms','Antonyms','Sentence Correction','Para Jumbles','Reading Comprehension']
};
const difficulties = ['Easy','Medium','Hard'];
const generateAptitude = (count=200) => {
  const arr = [];
  for (let i=0;i<count;i++){
    const cat = Math.random() < 0.6 ? 'Quantitative Aptitude' : (Math.random()<0.5?'Logical Reasoning':'Verbal Ability');
    const topic = rand(Object.values(aptitudeTopics).flat());
    const difficulty = rand(difficulties);
    const id = nextId('apt');
    // generate a templated question depending on topic type
    let q = {};
    if (cat === 'Quantitative Aptitude'){
      // simple numeric templates
      const a = Math.floor(Math.random()*90)+10;
      const b = Math.floor(Math.random()*50)+5;
      q = {
        id,
        category: 'aptitude',
        subCategory: 'Quantitative Aptitude',
        topic,
        difficulty,
        questionText: `If ${a} is increased by ${b}% and then decreased by ${Math.floor(b/2)}%, what is the net percentage change?`,
        options: [],
        correctOptionIndex: 0,
        explanation: ''
      };
      const after = (a*(1+b/100)*(1 - (Math.floor(b/2))/100));
      const net = ((after - a)/a)*100;
      const opts = [net.toFixed(2)+'%',(net+2).toFixed(2)+'%',(net-2).toFixed(2)+'%',(net+4).toFixed(2)+'%'];
      q.options = opts;
      q.correctOptionIndex = 0;
      q.explanation = `Apply successive percentage multipliers: (${a}*${1+b/100}*${1 - (Math.floor(b/2))/100} - ${a}) / ${a} => ${net.toFixed(2)}%`;
    } else if (cat === 'Logical Reasoning'){
      q = {
        id,
        category: 'aptitude',
        subCategory: 'Logical Reasoning',
        topic,
        difficulty,
        questionText: `Find the next number in the sequence: ${i%5===0? '2, 6, 12, 20, 30, ?': '3, 5, 9, 17, 33, ?'}`,
        options: ['42','40','64','66'],
        correctOptionIndex: i%5===0?0:2,
        explanation: i%5===0? 'Differences increase by 2 => next difference 12 => 30+12=42.' : 'Sequence doubles previous difference pattern leading to 64.'
      };
    } else {
      q = {
        id,
        category: 'aptitude',
        subCategory: 'Verbal Ability',
        topic,
        difficulty,
        questionText: `Choose the best synonym of the word "${rand(['Prudent','Resilient','Amiable','Loquacious','Pervasive'])}" in a professional context.`,
        options: ['Careful','Hostile','Lazy','Ambiguous'],
        correctOptionIndex: 0,
        explanation: 'Prudent/Resilient/Amiable synonyms mapping; correct answer is the careful/positive trait.'
      };
    }
    arr.push(q);
  }
  return arr;
};

// DSA coding problems
const dsaTemplates = [
  {title: 'Two Sum', desc: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.', tags:['arrays','hash-table'], difficulty:'Easy'},
  {title: 'Longest Increasing Subsequence', desc: 'Find length of longest increasing subsequence in an array.', tags:['dp','binary-search'], difficulty:'Medium'},
  {title: 'Number of Islands', desc: 'Given a grid, count the number of islands (connected components).', tags:['dfs','bfs','graph'], difficulty:'Medium'},
  {title: 'LCA in Binary Tree', desc: 'Find lowest common ancestor of two nodes in binary tree.', tags:['trees'], difficulty:'Medium'},
  {title: 'Top K Frequent Elements', desc: 'Return the k most frequent elements from an array.', tags:['heap','hash-map'], difficulty:'Medium'},
  {title: 'Trapping Rain Water', desc: 'Compute trapped rain water given elevation map.', tags:['two-pointers','stack'], difficulty:'Hard'},
  {title: 'Merge Intervals', desc: 'Merge all overlapping intervals and return the result.', tags:['intervals','sorting'], difficulty:'Easy'}
];
const generateDSA = (count=100) => {
  const arr = [];
  for (let i=0;i<count;i++){
    const tpl = rand(dsaTemplates);
    const id = nextId('dsa');
    arr.push({
      id,
      title: `${tpl.title}${i>0? ' — variant '+(i+1):''}`,
      description: tpl.desc + ' Write efficient solution and analyze complexity.',
      difficulty: tpl.difficulty,
      tags: tpl.tags,
      sampleInput: 'See problem statement examples',
      sampleOutput: 'Corresponding output',
      hints: [`Try ${tpl.tags[0]} approach`,`Optimize for time and space`]
    });
  }
  return arr;
};

// SQL questions
const sqlTemplates = [
  {q:'Write a SQL query to find the second highest salary from Employee table.', difficulty:'Medium', tags:['sql','aggregation']},
  {q:'Explain different types of JOINs with examples.', difficulty:'Easy', tags:['sql','joins']},
  {q:'Given Orders and Customers tables, write a query to find customers who have never ordered.', difficulty:'Medium', tags:['sql','subquery']}
];
const generateSQL = (count=50) => Array.from({length:count}).map((_,i)=>({id:nextId('sql'), questionText: sqlTemplates[i%sqlTemplates.length].q, difficulty: sqlTemplates[i%sqlTemplates.length].difficulty, tags: sqlTemplates[i%sqlTemplates.length].tags, answer: 'Sample correct SQL query and explanation.'}));

// OS, DBMS, CN, HR, Technical interview question generators follow similar templating
const genericTemplates = (topicName,baseTags,count,scaleTitle) => Array.from({length:count}).map((_,i)=>({id:nextId(topicName.toLowerCase()), category: topicName, topic: rand(baseTags), difficulty: rand(difficulties), questionText: `${scaleTitle} ${i+1}: Describe/solve ${rand(baseTags)} core concept question.`, options: null, answer: 'Detailed answer with examples.', tags: baseTags}));

const generateOS = (count=50) => genericTemplates('Operating Systems',['Deadlocks','Scheduling','Memory Management','Concurrency','Virtual Memory'],count,'OS Q');
const generateDBMS = (count=50) => genericTemplates('DBMS',['Normalization','Transactions','Indexing','ACID','SQL Optimization'],count,'DBMS Q');
const generateCN = (count=50) => genericTemplates('Computer Networks',['TCP/IP','Routing','Subnetting','HTTP','DNS'],count,'CN Q');
const generateHR = (count=30) => genericTemplates('HR',['Behavioral','STAR','Conflict Resolution','Strengths and Weaknesses'],count,'HR Q');
const generateTech = (count=30) => genericTemplates('Technical Interview',['System Design','OOP','Concurrency','Architecture'],count,'Tech Q');

// Companies and company-wise question banks
const companyBase = ['TCS','Infosys','Wipro','Accenture','Cognizant','Capgemini','Deloitte','HCL','IBM','Amazon','Google','Microsoft','Flipkart','Adobe','Oracle','Samsung','Intel','Uber','Paytm','Zoho','Mindtree','Larsen & Toubro','Bosch','Siemens','Qualcomm'];
const generateCompanies = (count=25) => companyBase.slice(0,count).map((name,i)=>({id:nextId('comp'), name, difficulty: i%3===0?'Medium':(i%3===1?'Hard':'Easy'), description:`Hiring profile for ${name}`, roles:['Software Engineer','Intern'], packages: `${3+i}-${8+i} LPA`, previousQuestions: Array.from({length:6}).map((_,j)=>({title:`${name} problem ${j+1}`, questionText: `Company-specific question ${j+1} from ${name}`, role: 'SDE', year: 2024+j%2}))}));

// Mock tests and leaderboards
const generateMockTests = () => {
  const full = {
    id: nextId('mock'),
    title: 'Full-Length Mock Test - Technical',
    duration: 120,
    difficulty: 'Hard',
    questions: Array.from({ length: 30 }).map(() => ({
      id: nextId('m-q'),
      questionText: 'Mixed technical or aptitude question',
      options: ['A', 'B', 'C', 'D'],
      correctOptionIndex: Math.floor(Math.random() * 4),
      explanation: 'Short explanation'
    }))
  };

  const apt = {
    id: nextId('mock'),
    title: 'Aptitude Mock Drill',
    duration: 30,
    difficulty: 'Easy',
    questions: Array.from({ length: 25 }).map(() => ({
      id: nextId('m-q'),
      questionText: 'Aptitude MCQ',
      options: ['A', 'B', 'C', 'D'],
      correctOptionIndex: Math.floor(Math.random() * 4),
      explanation: 'Short explanation'
    }))
  };

  return [full, apt];
};

const generateLeaderBoard = (count=50) => Array.from({length:count}).map((_,i)=>({rank:i+1, userId:nextId('lb'), name: rand(['Aisha Verma','Rohit Kumar','Deepa Singh','Alex Carter','Sana Khan','Vikram Patel','Priya Sharma']), score: Math.floor(50 + Math.random()*50)}));

const generateUsers = (count=100) => Array.from({length:count}).map((_,i)=>({id:nextId('user'), email:`user${i+1}@campusprep.test`, profile: {fullName:`User ${i+1}`, collegeName: rand(['NIT Trichy','IIT Delhi','IIIT Hyderabad','VIT Vellore']), branch: rand(['CSE','ECE','IT']), academicYear: rand(['Final Year','Pre-final','Third Year']), cgpa: (6 + Math.random()*3).toFixed(2), skills: [rand(['JavaScript','Java','Python','C++','SQL','React','Node.js'])], targetCompanies: [rand(companyBase)]}, progress: {aptitude: Math.floor(Math.random()*100), dsa: Math.floor(Math.random()*100)}, activity: [] }));

const generateCompanyStats = (companies) => companies.map(c=>({companyId:c.id, name:c.name, totalOffers: Math.floor(20 + Math.random()*300), averagePackage: `${(3+Math.random()*25).toFixed(1)} LPA`, placementRate: `${Math.floor(40 + Math.random()*55)}%`}));

// Generate datasets
const aptitude = generateAptitude(200);
const dsa = generateDSA(100);
const sql = generateSQL(50);
const os = generateOS(50);
const dbms = generateDBMS(50);
const cn = generateCN(50);
const hr = generateHR(30);
const tech = generateTech(30);
const companies = generateCompanies(25);
const mockTests = generateMockTests();
const leaderboard = generateLeaderBoard(100);
const users = generateUsers(200);
const companyStats = generateCompanyStats(companies);

// Write files
const write = (name,data) => fs.writeFileSync(path.join(OUT_DIR, name), JSON.stringify(data, null, 2));
write('aptitude.json', aptitude);
write('dsa.json', dsa);
write('sql.json', sql);
write('os.json', os);
write('dbms.json', dbms);
write('cn.json', cn);
write('hr.json', hr);
write('technical_interview.json', tech);
write('companies_questions.json', companies);
write('mock_tests.json', mockTests);
write('leaderboard.json', leaderboard);
write('users_profiles.json', users);
write('company_stats.json', companyStats);

console.log('Sample datasets generated in', OUT_DIR);
