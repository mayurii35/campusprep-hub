import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Brain, CheckCircle, XCircle, ArrowRight, HelpCircle, RefreshCw, AlertCircle, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AptitudePrep() {
  const { executeApi } = useAuth();
  
  const [activeTab, setActiveTab] = useState('Quantitative Aptitude');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [page, setPage] = useState(1);

  // Practice session state
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const tabs = ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'];
  const pageSize = 9;

  // Load questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await executeApi(`/api/prep/questions?category=aptitude`);
        if (res.ok) {
          const data = await res.json();
          setQuestions(data);
        } else {
          setError('Failed to retrieve aptitude questions.');
        }
      } catch (err) {
        setError('Network error loading questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Filter topics based on active tab
  const filteredQuestions = questions.filter(q => {
    const matchesTab = q.subCategory === activeTab;
    const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    const query = searchTerm.toLowerCase();
    const matchesSearch = !query ||
      q.topic.toLowerCase().includes(query) ||
      q.title.toLowerCase().includes(query) ||
      q.questionText.toLowerCase().includes(query);
    return matchesTab && matchesDifficulty && matchesSearch;
  });
  
  // Extract unique topics for cards display
  const topics = [...new Set(filteredQuestions.map(q => q.topic))];
  const totalPages = Math.max(1, Math.ceil(topics.length / pageSize));
  const visibleTopics = topics.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchTerm, difficultyFilter]);

  // Group questions by topic
  const questionsByTopic = (topicName) => filteredQuestions.filter(q => q.topic === topicName);

  const handleStartPractice = (topicName) => {
    setSelectedTopic(topicName);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setSubmitted(false);
    setFeedback(null);
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null) return;
    
    const topicQuestions = questionsByTopic(selectedTopic);
    const question = topicQuestions[currentQuestionIdx];

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
      console.error('Submit answer error:', err);
    }
  };

  const handleNextQuestion = () => {
    const topicQuestions = questionsByTopic(selectedTopic);
    if (currentQuestionIdx < topicQuestions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setSelectedOption(null);
      setSubmitted(false);
      setFeedback(null);
    } else {
      // Completed topic practice
      setSelectedTopic(null);
    }
  };

  const handleExitPractice = () => {
    setSelectedTopic(null);
  };

  const renderPracticeArena = () => {
    const topicQuestions = questionsByTopic(selectedTopic);
    const question = topicQuestions[currentQuestionIdx];

    if (!question) return null;

    return (
      <div className="space-y-6">
        {/* Practice Header */}
        <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-900">
          <div>
            <h3 className="font-extrabold text-slate-200">{selectedTopic} Practice</h3>
            <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              Question {currentQuestionIdx + 1} of {topicQuestions.length}
            </span>
          </div>
          <button
            onClick={handleExitPractice}
            className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            Exit Practice
          </button>
        </div>

        {/* Question Area */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <div className="inline-block px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
            {question.difficulty}
          </div>
          <p className="text-base text-slate-100 font-medium leading-relaxed">
            {question.questionText}
          </p>

          {/* Options Grid */}
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
                  btnClass = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
                } else {
                  btnClass = 'opacity-50 bg-slate-950/20 border-slate-900 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={submitted}
                  onClick={() => setSelectedOption(idx)}
                  className={`p-4 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnClass}`}
                >
                  <span className="pr-2">{opt}</span>
                  {submitted && idx === question.correctOptionIndex && (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  {submitted && isSelected && idx !== question.correctOptionIndex && (
                    <XCircle className="w-4 h-4 text-rose-450 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action / Explanation Box */}
        {submitted && feedback && (
          <div className="p-5 rounded-2xl bg-indigo-950/10 border border-indigo-500/20 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center">
              <HelpCircle className="w-4 h-4 mr-1.5" />
              Explanation & Solution
            </h4>
            <p className="text-xs text-slate-350 leading-relaxed pl-1">
              {feedback.explanation}
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          {!submitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className="px-6 py-3 bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-800/50 disabled:cursor-not-allowed font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="flex items-center space-x-1.5 px-6 py-3 bg-emerald-600 hover:bg-emerald-550 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/10"
            >
              <span>{currentQuestionIdx < topicQuestions.length - 1 ? 'Next Question' : 'Finish Practice'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderTopicsGrid = () => {
    if (topics.length === 0) {
      return (
        <div className="text-center py-12 text-slate-500 text-xs">
          <HelpCircle className="w-10 h-10 text-slate-700 mx-auto mb-2" />
          No questions available in this sub-category yet.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleTopics.map((t, i) => {
          const count = questionsByTopic(t).length;
          return (
            <div key={i} className="p-6 rounded-2xl glass-card flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Topic Card</span>
                <h4 className="text-base font-extrabold text-slate-200">{t}</h4>
                <p className="text-xs text-slate-400 font-semibold">{count} solved / {count} questions practice ready</p>
              </div>

              <button
                onClick={() => handleStartPractice(t)}
                className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-indigo-650 hover:border-indigo-600 rounded-xl text-xs font-bold text-slate-350 hover:text-slate-100 transition-all flex items-center justify-center space-x-1"
              >
                <span>Start Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Module Title */}
      <div className="flex items-center space-x-3 border-b border-slate-900 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-200">Aptitude Preparation</h2>
          <p className="text-xs text-slate-450 mt-0.5">Solve topic worksheets to increase speed and accuracy.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs text-slate-450 animate-pulse">Loading questions...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-450 rounded-xl flex items-center space-x-2 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-450" />
          <span>{error}</span>
        </div>
      ) : selectedTopic ? (
        renderPracticeArena()
      ) : (
        <>
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-900 space-x-4 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 text-xs font-bold transition-all border-b-2 shrink-0 ${
                  activeTab === tab 
                    ? 'border-indigo-500 text-indigo-400 font-extrabold' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search topic, title, or question..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full sm:w-40 px-4 py-2.5 rounded-xl glass-input text-xs"
              >
                <option>All</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          {renderTopicsGrid()}

          <div className="flex items-center justify-between border-t border-slate-900 pt-4">
            <span className="text-xs text-slate-500">Page {page} of {totalPages} • {filteredQuestions.length} questions</span>
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
        </>
      )}
    </div>
  );
}
