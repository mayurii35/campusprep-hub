import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Play, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

export default function MockTest() {
  return (
    <Routes>
      <Route path="/" element={<TestList />} />
      <Route path="/instructions/:id" element={<TestInstructions />} />
      <Route path="/arena/:id" element={<TestArena />} />
      <Route path="/results" element={<TestResults />} />
    </Routes>
  );
}

// 1. LIST OF AVAILABLE TESTS
function TestList() {
  const { executeApi } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await executeApi('/api/test/list');
        if (res.ok) {
          const data = await res.json();
          setTests(data);
        } else {
          setError('Failed to retrieve mock exams.');
        }
      } catch (err) {
        setError('Network error loading mock tests list.');
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, difficulty]);

  const filteredTests = tests.filter(test => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = !query ||
      test.title.toLowerCase().includes(query) ||
      test.type.toLowerCase().includes(query) ||
      test.company?.toLowerCase().includes(query);
    const matchesDifficulty = difficulty === 'All' || test.difficulty === difficulty;
    return matchesSearch && matchesDifficulty;
  });
  const totalPages = Math.max(1, Math.ceil(filteredTests.length / pageSize));
  const visibleTests = filteredTests.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-450 animate-pulse">Loading mock tests directory...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Module Title */}
      <div className="flex items-center space-x-3 border-b border-slate-900 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-200">Mock Assessments Hub</h2>
          <p className="text-xs text-slate-450 mt-0.5">Attempt timed assessments tailored to standard company recruitment models.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl flex items-center space-x-2 text-xs">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tests by company, title, or type..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full sm:w-40 px-4 py-2.5 rounded-xl glass-input text-xs"
          >
            <option>All</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleTests.map((test) => (
          <div key={test.id} className="p-6 rounded-2xl glass-card flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{test.type}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                  test.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  test.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {test.difficulty}
                </span>
              </div>
              
              <h3 className="text-base font-extrabold text-slate-100 leading-snug">{test.title}</h3>
              {test.company && <p className="text-xs text-slate-400 font-semibold">Recruiter Match: <span className="text-indigo-400 font-bold">{test.company}</span></p>}

              <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-slate-500" /> {test.duration} Mins</span>
                <span className="flex items-center"><HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-500" /> {test.questionsCount} MCQs</span>
              </div>
            </div>

            <Link
              to={`/mock-tests/instructions/${test.id}`}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-bold text-slate-100 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-650/10"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Assessment</span>
            </Link>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-900 pt-4">
        <span className="text-xs text-slate-500">Page {page} of {totalPages} • {filteredTests.length} tests</span>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. EXAM GUIDELINES / INSTRUCTIONS
function TestInstructions() {
  const { id } = useParams();
  const { executeApi } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await executeApi(`/api/test/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTest(data);
        }
      } catch (err) {
        console.error('Fetch test details error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs">
        Test details could not be found. <Link to="/mock-tests" className="text-indigo-400 underline pl-1">Back to list</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{test.type} ASSESSMENT</span>
        <h2 className="text-2xl font-black text-slate-100">{test.title}</h2>
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-900 text-center">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Duration</span>
          <span className="text-base font-extrabold text-indigo-400">{test.duration} Minutes</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Questions</span>
          <span className="text-base font-extrabold text-indigo-400">{test.questions.length} MCQs</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Difficulty</span>
          <span className="text-base font-extrabold text-indigo-400">{test.difficulty}</span>
        </div>
      </div>

      {/* Instructions list */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <h3 className="font-bold text-slate-200 border-b border-slate-900 pb-2">Exam Regulations</h3>
        
        <ul className="space-y-3 text-xs text-slate-400 leading-relaxed list-disc pl-4">
          <li>Ensure a stable network connection before starting. Leaving or refreshing the page will NOT stop the exam timer.</li>
          <li>This test is simulated in a protected workspace. Navigating away or changing tabs might trigger warnings in typical proctored systems.</li>
          <li>Every question contains multiple choice options. Marks are computed upon complete submission.</li>
          <li>Negative marking is disabled: incorrect answers carry 0 penalties. Try to attempt all questions!</li>
          <li>Review questions can be marked using the "Mark for Review" button to consult later from the index grid.</li>
        </ul>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Link to="/mock-tests" className="text-xs text-slate-400 hover:text-white flex items-center space-x-1">
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Hub</span>
        </Link>
        <button
          onClick={() => navigate(`/mock-tests/arena/${id}`)}
          className="px-8 py-3.5 bg-indigo-650 hover:bg-indigo-600 font-bold rounded-xl text-xs text-slate-100 transition-all shadow-md shadow-indigo-650/15"
        >
          Agree & Start Test
        </button>
      </div>
    </div>
  );
}

// 3. EXAM SIMULATION ARENA (FULL SCREEN LAYOUT)
function TestArena() {
  const { id } = useParams();
  const { executeApi } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Exam States
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
  const [reviewFlags, setReviewFlags] = useState({}); // { questionIndex: boolean }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await executeApi(`/api/test/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTest(data);
          setTimeLeft(data.duration * 60);
        }
      } catch (err) {
        console.error('Fetch arena test error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  // Count Down Timer Logic
  useEffect(() => {
    if (timeLeft <= 0 && !loading && test) {
      handleFinalSubmit(); // Auto submit on timer timeout
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, loading, test]);

  const handleSelectOption = (optIdx) => {
    setAnswers(prev => ({
      ...prev,
      [currentIdx]: optIdx
    }));
  };

  const handleToggleReview = () => {
    setReviewFlags(prev => ({
      ...prev,
      [currentIdx]: !prev[currentIdx]
    }));
  };

  const handleFinalSubmit = async () => {
    clearInterval(timerRef.current);
    try {
      const res = await executeApi(`/api/test/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers })
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect to results with the scores state
        navigate('/mock-tests/results', { state: { result: data } });
      }
    } catch (err) {
      console.error('Submit test error:', err);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!test) return null;

  const currentQuestion = test.questions[currentIdx];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between text-slate-100 font-sans">
      
      {/* Header bar */}
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center px-6">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[9px] font-bold uppercase tracking-wider">
            {test.type} Simulation
          </span>
          <span className="font-extrabold text-sm text-slate-200 truncate max-w-xs">{test.title}</span>
        </div>

        {/* Timer indicator */}
        <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-sm">
          <Clock className="w-4 h-4 text-indigo-455 animate-pulse" />
          <span className={timeLeft < 60 ? 'text-rose-400' : 'text-indigo-400'}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-5 py-2 bg-emerald-650 hover:bg-emerald-600 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/15"
        >
          Submit Exam
        </button>
      </header>

      {/* Main Splits layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Grid: Question Workspace */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-900 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <span className="text-xs font-bold text-slate-400">Question {currentIdx + 1} of {test.questions.length}</span>
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-bold">{currentQuestion.difficulty}</span>
            </div>

            <p className="text-base text-slate-100 font-medium leading-relaxed">
              {currentQuestion.questionText}
            </p>

            {currentQuestion.codeSnippet && (
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-xs font-mono overflow-x-auto text-emerald-450">
                <code>{currentQuestion.codeSnippet}</code>
              </pre>
            )}

            {/* Options list */}
            <div className="space-y-2.5 pt-2">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentIdx] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-indigo-600/10 border-indigo-500 text-slate-100'
                        : 'bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-350'
                    }`}
                  >
                    <span>{opt}</span>
                    <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                      isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-700'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {/* Right Drawer: Index Navigation Sheet */}
        <aside className="hidden md:flex flex-col w-72 bg-slate-900 border-l border-slate-800 shrink-0 p-5 space-y-6">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-200">Question Navigator</h4>
            <p className="text-[10px] text-slate-450 leading-normal">Click an index to jump directly.</p>
          </div>

          {/* Grid index */}
          <div className="grid grid-cols-4 gap-2.5">
            {test.questions.map((_, idx) => {
              const isCurrent = idx === currentIdx;
              const isAnswered = answers[idx] !== undefined;
              const isFlagged = reviewFlags[idx];

              let cellClass = 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-750';
              if (isAnswered) {
                cellClass = 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400 font-bold';
              }
              if (isFlagged) {
                cellClass = 'bg-purple-600/20 border-purple-500/30 text-purple-400 font-bold';
              }
              if (isCurrent) {
                cellClass = 'border-indigo-500 text-indigo-400 ring-2 ring-indigo-500/20 font-bold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all ${cellClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Color coding legend */}
          <div className="border-t border-slate-800 pt-4 space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Legend</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium">
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-emerald-600/20 border border-emerald-500/30"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-purple-600/20 border border-purple-500/30"></div>
                <span>Flagged</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-850"></div>
                <span>Unattempted</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded border border-indigo-500"></div>
                <span>Current</span>
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* Footer controls */}
      <footer className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center px-6">
        <div className="flex space-x-2">
          <button
            onClick={handleToggleReview}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              reviewFlags[currentIdx]
                ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                : 'bg-slate-950/40 border-slate-800 text-slate-450 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{reviewFlags[currentIdx] ? 'Flagged' : 'Mark for Review'}</span>
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="px-4 py-2.5 bg-slate-950 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 text-xs font-semibold rounded-xl flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>
          
          <button
            onClick={() => {
              if (currentIdx < test.questions.length - 1) {
                setCurrentIdx(prev => prev + 1);
              } else {
                setShowSubmitModal(true);
              }
            }}
            className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all"
          >
            <span>{currentIdx < test.questions.length - 1 ? 'Save & Next' : 'Verify & Submit'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Confirmation Submit modal overlay */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-sm p-6 rounded-2xl glass-card text-center space-y-4">
            <h3 className="font-extrabold text-slate-100 text-lg">Submit Assessment?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You have answered <span className="font-bold text-slate-200">{Object.keys(answers).length}</span> out of <span className="font-bold text-slate-200">{test.questions.length}</span> questions. Are you ready to verify and submit?
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="py-2.5 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-400"
              >
                Back to Test
              </button>
              <button
                onClick={handleFinalSubmit}
                className="py-2.5 bg-emerald-650 hover:bg-emerald-600 rounded-xl text-xs font-bold text-slate-100 transition-all"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 4. RESULTS DASHBOARD & ANALYSIS
function TestResults() {
  const navigate = useNavigate();
  // Fetch result payload from location state
  const { state } = useLocation();
  // Safe fallback mock object if state is missing
  const result = window.history.state?.usr?.result || {
    testTitle: 'Aptitude Diagnostic Assessment',
    totalQuestions: 3,
    correctCount: 2,
    incorrectCount: 1,
    unattemptedCount: 0,
    scorePercent: 67,
    questionsBreakdown: [
      { questionText: 'Average age of 5 students is 20. If new joins...', selectedOptionIndex: 0, correctOptionIndex: 0, explanation: 'Total total logic.', isAttempted: true, isCorrect: true, options: ['21 years', '22 years', '23 years'] },
      { questionText: 'A can do work in 12 days, B in 18...', selectedOptionIndex: 1, correctOptionIndex: 0, explanation: 'Fraction analysis logic.', isAttempted: true, isCorrect: false, options: ['4/9', '5/9', '2/3'] }
    ]
  };

  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Assessment Completed</span>
        <h2 className="text-2xl font-black text-slate-100">{result.testTitle} Results</h2>
      </div>

      {/* Core Grades Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Readiness progress ring simulation */}
        <div className="p-6 rounded-2xl glass-card flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Overall Grade</span>
          <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center text-xl font-black text-slate-100">
            {result.scorePercent}%
          </div>
        </div>

        {/* Accuracies values */}
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-center space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Correct Answers</span>
          <div className="text-2xl font-black text-slate-100 flex items-center justify-center sm:justify-start">
            <CheckCircle className="w-5 h-5 text-emerald-450 mr-1.5 shrink-0" />
            {result.correctCount} / {result.totalQuestions}
          </div>
        </div>
        
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-center space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-bold text-rose-455 uppercase tracking-wider">Wrong Answers</span>
          <div className="text-2xl font-black text-slate-100 flex items-center justify-center sm:justify-start">
            <XCircle className="w-5 h-5 text-rose-450 mr-1.5 shrink-0" />
            {result.incorrectCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card flex flex-col justify-center space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Unattempted</span>
          <div className="text-2xl font-black text-slate-100 flex items-center justify-center sm:justify-start">
            <HelpCircle className="w-5 h-5 text-slate-500 mr-1.5 shrink-0" />
            {result.unattemptedCount}
          </div>
        </div>
      </div>

      {/* Analysis and Controls */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900/60 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Placement Readiness Score adjusted slightly. See Dashboard for updates.</span>
        </div>

        <div className="flex space-x-3 shrink-0">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="px-5 py-2.5 bg-slate-950 border border-slate-850 text-indigo-400 hover:bg-slate-900 rounded-xl text-xs font-bold flex items-center space-x-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>{showExplanation ? 'Hide Key' : 'Review Answers'}</span>
          </button>

          <button
            onClick={() => navigate('/mock-tests')}
            className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-bold"
          >
            Back to Directory
          </button>
        </div>
      </div>

      {/* Explanations section */}
      {showExplanation && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-350 uppercase tracking-wider pl-1">Explanations Key</h3>
          
          {result.questionsBreakdown.map((q, idx) => (
            <div key={idx} className="p-6 rounded-2xl glass-card space-y-4 border-l-4 border-l-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">MCQ {idx + 1}</span>
                {q.isCorrect ? (
                  <span className="text-emerald-450 font-bold flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Correct</span>
                ) : q.isAttempted ? (
                  <span className="text-rose-400 font-bold flex items-center"><XCircle className="w-3.5 h-3.5 mr-1" /> Incorrect</span>
                ) : (
                  <span className="text-slate-500 font-medium">Unattempted</span>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-200 leading-normal">{q.questionText}</p>

              {/* Options mapping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options.map((opt, oIdx) => {
                  const isSelected = q.selectedOptionIndex === oIdx;
                  const isCorrect = q.correctOptionIndex === oIdx;

                  let optClass = 'bg-slate-950/20 border-slate-900 text-slate-500';
                  if (isCorrect) {
                    optClass = 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 font-semibold';
                  } else if (isSelected) {
                    optClass = 'bg-rose-500/10 border-rose-500/20 text-rose-455';
                  }

                  return (
                    <div key={oIdx} className={`p-3 rounded-lg border ${optClass}`}>
                      {opt}
                    </div>
                  );
                })}
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-400 leading-relaxed space-y-1">
                <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] block">Explanation:</span>
                <p>{q.explanation || 'Detailed mathematical/logical proof.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
