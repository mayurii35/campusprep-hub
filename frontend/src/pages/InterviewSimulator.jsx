import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Mic, Send, RefreshCw, Sparkles, Award, CheckCircle, AlertCircle, Play, ChevronRight, Volume2 } from 'lucide-react';

export default function InterviewSimulator() {
  const { executeApi } = useAuth();
  
  const [activeTopic, setActiveTopic] = useState('DSA');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  
  // Active session states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [reports, setReports] = useState([]); // array of feedbacks for current session

  const topics = ['DSA', 'DBMS', 'System Design', 'Behavioral'];

  // Start Session - fetch questions
  const handleStartSession = async (topicName) => {
    setLoading(true);
    setFeedback(null);
    setReports([]);
    try {
      const res = await executeApi(`/api/interview/questions?topic=${topicName}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
        setCurrentIdx(0);
        setSessionActive(true);
      }
    } catch (err) {
      console.error('Start interview session error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    
    try {
      const res = await executeApi('/api/interview/submit', {
        method: 'POST',
        body: JSON.stringify({
          questionId: questions[currentIdx].id,
          answerText: answerText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
        setReports(prev => [...prev, { questionText: questions[currentIdx].questionText, ...data }]);
      }
    } catch (err) {
      console.error('Submit interview answer error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setAnswerText('');
      setFeedback(null);
    } else {
      // Completed all questions - view final report
      setSessionActive(false);
      setFeedback(null);
    }
  };

  // Mock voice speech-to-text
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Append a mock transcript
      const transcripts = {
        'dsa': 'A thread is basically a lightweight subprocess or execution path inside a process. They share the same heap memory segment which makes context switching faster than processes.',
        'dbms': 'Database normalization splits tables to reduce redundant fields and avoid insertion or delete anomalies.',
        'oop': 'Polymorphism allows objects to take multiple shapes or forms, like method overriding in animal classes.'
      };
      const text = transcripts[activeTopic.toLowerCase()] || 'Polymorphism allows objects to take multiple shapes.';
      setAnswerText(prev => prev + (prev ? ' ' : '') + text);
    } else {
      setIsRecording(true);
    }
  };

  const renderInterviewerCard = () => (
    <div className="p-5 rounded-2xl glass-card flex items-center space-x-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-650 flex items-center justify-center font-black text-white text-base shadow-inner">
        AI
      </div>
      <div>
        <h4 className="font-extrabold text-slate-200">Sophia</h4>
        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
          Senior Technical Recruiter
        </span>
      </div>
    </div>
  );

  const renderActiveSession = () => {
    if (questions.length === 0) return null;
    const q = questions[currentIdx];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Cols: Sophia and Question panel */}
        <div className="lg:col-span-2 space-y-6">
          {renderInterviewerCard()}

          {/* Question Text bubble */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block"> Sophia asks:</span>
            <p className="text-sm sm:text-base text-slate-100 font-semibold leading-relaxed">
              "{q.questionText}"
            </p>
            <button 
              className="flex items-center space-x-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
              onClick={() => {
                // simulated speech synthesis voice
                if ('speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance(q.questionText);
                  utterance.rate = 0.95;
                  window.speechSynthesis.speak(utterance);
                }
              }}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Read Question Aloud</span>
            </button>
          </div>

          {/* Answer Input console */}
          {!feedback && (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your response here or click the microphone to dictate..."
                  rows="5"
                  className="w-full p-4 rounded-2xl glass-input text-xs leading-relaxed"
                />
                
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`absolute bottom-4 right-4 p-3 rounded-full border transition-all ${
                    isRecording 
                      ? 'bg-rose-500/25 border-rose-500 text-rose-400 animate-pulse' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-semibold">Word count: {answerText.trim().split(/\s+/).filter(Boolean).length}</span>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !answerText.trim()}
                  className="px-6 py-3 bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-800/40 disabled:cursor-not-allowed font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-650/10"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Submit Response</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Dynamic AI Critique feedbacks */}
          {feedback && (
            <div className="space-y-6">
              {/* Scores display */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-900">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Overall</span>
                  <span className="text-xl font-black text-slate-100">{feedback.overallScore}/10</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-900">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Accuracy</span>
                  <span className="text-xl font-black text-indigo-400">{feedback.accuracyScore}/10</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-900">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Delivery</span>
                  <span className="text-xl font-black text-emerald-400">{feedback.communicationScore}/10</span>
                </div>
              </div>

              {/* Critiques list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-450 tracking-wider block">Strengths</span>
                  <ul className="space-y-1 text-[11px] text-slate-350 leading-relaxed list-disc pl-3">
                    {feedback.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                  </ul>
                </div>
                
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-rose-455 tracking-wider block">Suggestions</span>
                  <ul className="space-y-1 text-[11px] text-slate-350 leading-relaxed list-disc pl-3">
                    {feedback.improvements.map((imp, idx) => <li key={idx}>{imp}</li>)}
                  </ul>
                </div>
              </div>

              {/* Optimal model answer */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-900 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Sophia's Recommended Answer Model
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  {feedback.optimalAnswer}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'View Placement Report'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Col: Session progress grid */}
        <aside className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h4 className="font-extrabold text-sm text-slate-200">Session Navigator</h4>
          <div className="space-y-2">
            {questions.map((item, idx) => {
              const isCurrent = idx === currentIdx;
              const isDone = reports[idx] !== undefined;

              return (
                <div 
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                    isCurrent 
                      ? 'border-indigo-500 bg-indigo-600/10 text-indigo-400' 
                      : isDone 
                      ? 'border-slate-800 bg-slate-900 text-slate-500' 
                      : 'border-slate-850 text-slate-400'
                  }`}
                >
                  <span className="truncate pr-2">Q{idx + 1}: {item.topic} Question</span>
                  {isDone && <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        </aside>

      </div>
    );
  };

  const renderFinalReport = () => {
    const avgScore = Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / (reports.length || 1));
    
    return (
      <div className="space-y-6">
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 flex items-center justify-center mx-auto mb-2 animate-float">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-100">Mock Interview Complete!</h3>
          <p className="text-slate-400 text-xs mt-1">Sophia has compiled your final performance audit logs.</p>
        </div>

        {/* Scoring summary card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-900 text-center">
          <div className="p-2 border-b sm:border-b-0 sm:border-r border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Average Rating</span>
            <span className="text-2xl font-black text-indigo-400 mt-1">{avgScore} / 10</span>
          </div>
          <div className="p-2 border-b sm:border-b-0 sm:border-r border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Concept Accuracy</span>
            <span className="text-2xl font-black text-emerald-450 mt-1">
              {Math.round(reports.reduce((sum, r) => sum + r.accuracyScore, 0) / (reports.length || 1))} / 10
            </span>
          </div>
          <div className="p-2">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Interview Status</span>
            <span className={`text-base font-extrabold block mt-1.5 ${avgScore >= 7 ? 'text-emerald-450' : 'text-amber-450'}`}>
              {avgScore >= 7 ? 'RECOMMENDED' : 'FOCUS NEEDED'}
            </span>
          </div>
        </div>

        {/* Chronological review feed */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-350 text-xs uppercase tracking-wider pl-1">Question Critique breakdown</h4>
          
          {reports.map((rep, idx) => (
            <div key={idx} className="p-5 rounded-2xl glass-card space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Q{idx + 1}: {rep.questionText.substring(0, 30)}...</span>
                <span className="font-black text-indigo-400">Score: {rep.overallScore}/10</span>
              </div>
              
              <p className="text-[11px] text-slate-400 italic">"{rep.questionText}"</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[10px] text-slate-350 leading-relaxed">
                <div>
                  <span className="font-bold text-emerald-450 block mb-1">Strengths:</span>
                  <ul className="list-disc pl-3.5 space-y-0.5">
                    {rep.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-rose-455 block mb-1">Improvement Areas:</span>
                  <ul className="list-disc pl-3.5 space-y-0.5">
                    {rep.improvements.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-900">
          <button
            onClick={() => setReports([])}
            className="px-6 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-350 transition-all"
          >
            Start New Session
          </button>
          <Link
            to="/dashboard"
            className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-bold text-slate-100 transition-all flex items-center"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  };

  const renderTopicsSelection = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2 max-w-xl mx-auto py-4">
        <h3 className="text-xl font-bold text-slate-100">Start AI Interview Simulator</h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          Launch a simulated placement panel with Sophia. Sophia will audit your explanations, score your logic accuracy, highlight structural strengths, and help you land target roles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => { setActiveTopic(topic); handleStartSession(topic); }}
            className="p-6 rounded-2xl glass-card glass-card-hover text-left space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">Simulator Category</span>
              <h4 className="text-base font-extrabold text-slate-200">{topic} Panel</h4>
              <p className="text-xs text-slate-400 leading-normal">Practice technical definitions, algorithms explanation, or behavioral scenarios.</p>
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-indigo-400 font-bold pt-2 mt-auto">
              <span>Launch Session</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Module Title */}
      <div className="flex items-center space-x-3 border-b border-slate-900 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Mic className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-200">AI Interview Simulator</h2>
          <p className="text-xs text-slate-455 mt-0.5">Practice speaking or typing answers to mock questions and receive instant AI grading audits.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs text-slate-450 animate-pulse"> Sophia is organizing the interview panel...</span>
        </div>
      ) : sessionActive ? (
        renderActiveSession()
      ) : reports.length > 0 ? (
        renderFinalReport()
      ) : (
        renderTopicsSelection()
      )}
    </div>
  );
}
