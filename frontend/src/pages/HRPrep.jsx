import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, BookOpen, CheckCircle, XCircle, ArrowRight, HelpCircle, AlertCircle, RefreshCw, Star, Sparkles, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import interviewBank from '../data/interview_questions.json';

export default function HRPrep() {
  const { executeApi } = useAuth();
  
  const [activeTab, setActiveTab] = useState('Cheat Sheets');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // MCQ Practice session state
  const [practiceActive, setPracticeActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Expanded Q&A states
  const [expandedQAIdx, setExpandedQAIdx] = useState(null);
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveCategory, setArchiveCategory] = useState('All');
  const [archivePage, setArchivePage] = useState(1);

  const tabs = ['Cheat Sheets', 'Practice MCQs', 'HR Q&A Archive', 'STAR Guidelines'];

  const hrQAs = interviewBank.map(item => ({
    question: item.question,
    category: item.category,
    target: item.expectedFocus,
    tips: item.tips.join(' '),
    sampleAnswer: item.sampleAnswer
  }));
  const archiveCategories = ['All', ...new Set(interviewBank.map(item => item.category))];
  const archivePageSize = 10;
  const filteredArchive = hrQAs.filter(item => {
    const matchesCategory = archiveCategory === 'All' || item.category === archiveCategory;
    const query = archiveSearch.toLowerCase();
    const matchesSearch = !query ||
      item.question.toLowerCase().includes(query) ||
      item.target.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  const archiveTotalPages = Math.max(1, Math.ceil(filteredArchive.length / archivePageSize));
  const visibleArchive = filteredArchive.slice((archivePage - 1) * archivePageSize, archivePage * archivePageSize);

  useEffect(() => {
    setArchivePage(1);
  }, [archiveSearch, archiveCategory]);

  // Load questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await executeApi(`/api/prep/questions?category=hr`);
        if (res.ok) {
          const data = await res.json();
          setQuestions(data);
        } else {
          setError('Failed to retrieve HR prep questions.');
        }
      } catch (err) {
        setError('Network error loading questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleStartPractice = () => {
    setPracticeActive(true);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setSubmitted(false);
    setFeedback(null);
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null) return;
    const question = questions[currentQuestionIdx];

    try {
      const res = await executeApi('/api/prep/submit', {
        method: 'POST',
        body: JSON.stringify({
          questionId: question._id || question.id,
          selectedOptionIndex: selectedOption
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Submit HR answer error:', err);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setSelectedOption(null);
      setSubmitted(false);
      setFeedback(null);
    } else {
      setPracticeActive(false);
    }
  };

  const renderPractice = () => {
    if (practiceActive && questions.length > 0) {
      const question = questions[currentQuestionIdx];
      return (
        <div className="space-y-6 animate-float">
          {/* Header */}
          <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-900">
            <div>
              <h3 className="font-extrabold text-slate-200">HR Practice Arena</h3>
              <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                Question {currentQuestionIdx + 1} of {questions.length}
              </span>
            </div>
            <button
              onClick={() => setPracticeActive(false)}
              className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
            >
              Exit Practice
            </button>
          </div>

          {/* Question Card */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="inline-block px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
              {question.difficulty}
            </div>
            <p className="text-sm sm:text-base text-slate-100 font-semibold leading-relaxed">
              {question.questionText}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              {question.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                let btnClass = 'bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-300';
                
                if (isSelected) {
                  btnClass = 'bg-indigo-600/10 border-indigo-500 text-slate-100';
                }
                
                if (submitted) {
                  if (idx === question.correctOptionIndex) {
                    btnClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold';
                  } else if (isSelected) {
                    btnClass = 'bg-rose-500/10 border-rose-500/30 text-rose-455';
                  } else {
                    btnClass = 'opacity-40 bg-slate-950/20 border-slate-900 text-slate-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={submitted}
                    onClick={() => setSelectedOption(idx)}
                    className={`p-4 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnClass}`}
                  >
                    <span>{opt}</span>
                    {submitted && idx === question.correctOptionIndex && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {submitted && isSelected && idx !== question.correctOptionIndex && <XCircle className="w-4 h-4 text-rose-450 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Solution Explanation */}
          {submitted && feedback && (
            <div className="p-5 rounded-2xl bg-indigo-950/10 border border-indigo-500/20 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center">
                <HelpCircle className="w-4 h-4 mr-1.5" />
                Recruiter Rationale
              </h4>
              <p className="text-xs text-slate-350 leading-relaxed">{feedback.explanation}</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            {!submitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="px-6 py-3 bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-800/40 disabled:cursor-not-allowed font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-650/10"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center space-x-1.5 px-6 py-3 bg-emerald-600 hover:bg-emerald-550 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/10"
              >
                <span>{currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'Finish Session'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center space-y-6 max-w-xl mx-auto py-12">
        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20 text-indigo-400">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-100">Practice HR Best Practices MCQs</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Verify your understanding of proper corporate etiquette, presentation models, weaknesses framing, and situational communication guidelines.
          </p>
        </div>
        <button
          onClick={handleStartPractice}
          className="px-8 py-3 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-650/10"
        >
          Start Practice MCQ ({questions.length} Questions)
        </button>
      </div>
    );
  };

  const renderCheatSheets = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* STAR method */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-900 pb-3">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-slate-200">The STAR Framework</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The industry gold standard for answering behavioral questions. It structures your response into a logical story:
        </p>
        <div className="space-y-3 text-xs text-slate-350">
          <p>📍 <strong className="text-slate-200">Situation:</strong> Set the context of the story. Detail the project, company, or coursework. Keep it short (15% of your answer).</p>
          <p>🎯 <strong className="text-slate-200">Task:</strong> Explain the direct challenge, bug, or objective you had to solve (15% of your answer).</p>
          <p>🛠️ <strong className="text-slate-200">Action:</strong> Describe the specific steps <strong>you</strong> took. Highlight technical skills and communication decisions (50% of your answer).</p>
          <p>📈 <strong className="text-slate-200">Result:</strong> Share the concrete positive outcome. Quantify metrics wherever possible (20% of your answer).</p>
        </div>
      </div>

      {/* Salary Negotiation */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-900 pb-3">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-slate-200">Interview Etiquette Do\'s & Don\'ts</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <span className="font-bold text-emerald-400 block">DO:</span>
            <ul className="list-disc pl-3.5 space-y-1 text-slate-400">
              <li>Do research the company stack and products before.</li>
              <li>Do ask 1-2 thoughtful questions at the end.</li>
              <li>Do explain your logical steps out loud.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-rose-400 block">DON\'T:</span>
            <ul className="list-disc pl-3.5 space-y-1 text-slate-400">
              <li>Don\'t badmouth past peers or college groups.</li>
              <li>Don\'t make up fake technical accomplishments.</li>
              <li>Don\'t respond with simple "Yes/No" answers.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQAArchive = () => (
    <div className="space-y-4">
      <div className="space-y-1 pb-2">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Common HR Questions & Reference Answers</h3>
        <p className="text-xs text-slate-500">Browse HR, technical, behavioral, and resume-based interview prompts with structured answer guidance.</p>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            value={archiveSearch}
            onChange={(e) => setArchiveSearch(e.target.value)}
            placeholder="Search interview questions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={archiveCategory}
            onChange={(e) => setArchiveCategory(e.target.value)}
            className="w-full sm:w-56 px-4 py-2.5 rounded-xl glass-input text-xs"
          >
            {archiveCategories.map(category => <option key={category}>{category}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {visibleArchive.map((qa, idx) => {
          const isExpanded = expandedQAIdx === idx;
          return (
            <div key={idx} className="rounded-2xl border border-slate-900 bg-slate-900/10 overflow-hidden transition-all">
              <button
                onClick={() => setExpandedQAIdx(isExpanded ? null : idx)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-900/40 transition-all text-slate-250 hover:text-white"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {(archivePage - 1) * archivePageSize + idx + 1}
                  </span>
                  <span className="font-bold text-xs sm:text-sm">{qa.question}</span>
                </div>
                <ArrowRight className={`w-4 h-4 text-indigo-400 transition-all ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {isExpanded && (
                <div className="p-5 border-t border-slate-900 bg-slate-950/40 space-y-4 text-xs leading-relaxed text-slate-400">
                  <div>
                    <span className="font-bold text-slate-200 uppercase tracking-widest text-[9px] block mb-1">Recruiter Core Focus:</span>
                    <p className="text-slate-350">{qa.target}</p>
                  </div>
                  <div>
                    <span className="font-bold text-indigo-400 uppercase tracking-widest text-[9px] block mb-1">Interview Tips:</span>
                    <p className="text-slate-350">{qa.tips}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                    <span className="font-bold text-emerald-450 uppercase tracking-widest text-[9px] block flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1" /> Sample Optimal Answer
                    </span>
                    <p className="text-slate-300 font-medium italic">"{qa.sampleAnswer}"</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-slate-900 pt-4">
        <span className="text-xs text-slate-500">Page {archivePage} of {archiveTotalPages} • {filteredArchive.length} questions</span>
        <div className="flex gap-2">
          <button
            disabled={archivePage === 1}
            onClick={() => setArchivePage(prev => Math.max(1, prev - 1))}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={archivePage === archiveTotalPages}
            onClick={() => setArchivePage(prev => Math.min(archiveTotalPages, prev + 1))}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSTARGuidelines = () => (
    <div className="p-6 rounded-2xl glass-card space-y-6">
      <div className="flex justify-between items-center border-b border-slate-900 pb-3">
        <h3 className="font-bold text-slate-200 flex items-center">
          <Star className="w-5 h-5 text-indigo-400 mr-2" />
          The STAR Method Checklist
        </h3>
        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Guide</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2 text-center sm:text-left">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center font-bold text-indigo-400 text-sm mx-auto sm:mx-0">S</div>
          <h4 className="font-bold text-slate-200">Situation</h4>
          <p className="text-[11px] text-slate-450 leading-relaxed">
            State the project details. "During my database term project, our team struggled to align schemas..."
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2 text-center sm:text-left">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center font-bold text-indigo-400 text-sm mx-auto sm:mx-0">T</div>
          <h4 className="font-bold text-slate-200">Task</h4>
          <p className="text-[11px] text-slate-450 leading-relaxed">
            Outline the issue. "My direct responsibility was to implement the query optimization and indexing strategy."
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2 text-center sm:text-left">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center font-bold text-indigo-400 text-sm mx-auto sm:mx-0">A</div>
          <h4 className="font-bold text-slate-200">Action</h4>
          <p className="text-[11px] text-slate-450 leading-relaxed">
            List your actions. "I researched index types, split tables to 3NF normalization, and ran query profiling scripts."
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2 text-center sm:text-left">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center font-bold text-indigo-400 text-sm mx-auto sm:mx-0">R</div>
          <h4 className="font-bold text-slate-200">Result</h4>
          <p className="text-[11px] text-slate-450 leading-relaxed">
            Show outcomes. "As a result, transaction response latency was reduced by 40%."
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Module Title */}
      <div className="flex items-center space-x-3 border-b border-slate-900 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-200">HR & Behavioral Preparation</h2>
          <p className="text-xs text-slate-455 mt-0.5">Master personal pitches, conflict resolution frameworks, and behavioral questions.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs text-slate-450 animate-pulse">Loading HR prep items...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl flex items-center space-x-2 text-xs">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-900 space-x-4 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                disabled={practiceActive && tab !== 'Practice MCQs'}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 text-xs font-bold transition-all border-b-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                  activeTab === tab 
                    ? 'border-indigo-500 text-indigo-400 font-extrabold' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {activeTab === 'Cheat Sheets' && renderCheatSheets()}
            {activeTab === 'Practice MCQs' && renderPractice()}
            {activeTab === 'HR Q&A Archive' && renderQAArchive()}
            {activeTab === 'STAR Guidelines' && renderSTARGuidelines()}
          </div>
        </>
      )}
    </div>
  );
}
