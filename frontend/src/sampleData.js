// Centralized sample dataset used when backend is unavailable
import aptitude from './data/aptitude.json';
import dsa from './data/dsa.json';
import sql from './data/sql.json';
import os from './data/os.json';
import dbms from './data/dbms.json';
import cn from './data/cn.json';
import hr from './data/hr.json';
import technical from './data/technical_interview.json';
import codingProblems from './data/coding_problems.json';
import interviewQuestions from './data/interview_questions.json';
import companies from './data/companies_questions.json';
import mockTests from './data/mock_tests.json';
import leaderboard from './data/leaderboard.json';
import users from './data/users_profiles.json';
import companyStats from './data/company_stats.json';

const sampleUser = users && users.length ? users[0] : {
  id: 'sample-user-1',
  profile: { fullName: 'Sample User', collegeName: 'Institute', branch: 'CSE' }
};

export default {
  user: sampleUser,
  aptitudeQuestions: aptitude,
  technicalQuestions: dsa,
  codingProblems,
  dsaQuestions: dsa,
  sqlQuestions: sql,
  osQuestions: os,
  dbmsQuestions: dbms,
  cnQuestions: cn,
  hrQuestions: hr,
  technicalInterviewQuestions: technical,
  interviewQuestionBank: interviewQuestions,
  testsList: mockTests.map(m=>({id:m.id,title:m.title,difficulty:m.difficulty,duration:m.duration,questionsCount:m.questions.length})),
  testDetails: Object.fromEntries(mockTests.map(m=>[m.id,m])),
  companies,
  mockTests,
  leaderboard,
  users,
  companyStats
};
