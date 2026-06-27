import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Search, Filter, ArrowRight, Clock, HelpCircle, ChevronRight, X, Briefcase, RefreshCw, AlertCircle } from 'lucide-react';

export default function CompanyHub() {
  const { executeApi } = useAuth();
  
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  
  // Selected Company Details Panel State
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await executeApi('/api/jobs/companies');
        if (res.ok) {
          const data = await res.json();
          setCompanies(data);
        } else {
          setError('Failed to retrieve target company profiles.');
        }
      } catch (err) {
        setError('Network error loading companies directory.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Filter Logic
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  const getLogoColor = (name) => {
    const colors = {
      google: 'from-blue-500 via-red-500 to-yellow-500',
      amazon: 'from-amber-500 to-orange-600',
      microsoft: 'from-blue-600 to-teal-500',
      tcs: 'from-blue-800 to-indigo-900'
    };
    return colors[name.toLowerCase()] || 'from-indigo-500 to-purple-500';
  };

  const toggleQuestion = (idx) => {
    setExpandedQuestionIdx(expandedQuestionIdx === idx ? null : idx);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-450 animate-pulse">Loading company profiles...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Module Title */}
      <div className="flex items-center space-x-3 border-b border-slate-900 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-200">Company Prep Hub</h2>
          <p className="text-xs text-slate-455 mt-0.5">Understand hiring structures, packages, and practice previous interview questions.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl flex items-center space-x-2 text-xs">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Listing vs Details Modal Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Cols: Search, Filters, and Cards list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search companies (e.g. Google, SDE roles)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
            
            <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl glass-input text-xs"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredCompanies.map((c) => (
              <div 
                key={c.id} 
                className={`p-6 rounded-2xl glass-card flex flex-col justify-between space-y-5 transition-all cursor-pointer ${
                  selectedCompany?.id === c.id 
                    ? 'ring-2 ring-indigo-500 border-transparent shadow-lg shadow-indigo-500/10' 
                    : 'glass-card-hover'
                }`}
                onClick={() => { setSelectedCompany(c); setExpandedQuestionIdx(null); }}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getLogoColor(c.name)} flex items-center justify-center font-bold text-white text-base shadow-md uppercase`}>
                      {c.name.substring(0, 1)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-200">{c.name}</h3>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                        c.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450' :
                        c.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-450' :
                        'bg-rose-500/10 border-rose-500/20 text-rose-450'
                      }`}>
                        {c.difficulty} Difficulty
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-normal line-clamp-2">
                    {c.description}
                  </p>
                </div>

                <div className="border-t border-slate-900 pt-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Average CTC</span>
                    <span className="font-extrabold text-indigo-400">{c.packages}</span>
                  </div>
                  <button
                    className="flex items-center space-x-1 text-xs text-slate-350 hover:text-white font-bold"
                  >
                    <span>View Roadmap</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredCompanies.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs sm:col-span-2">
                No matching company profiles.
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Col: Selected Company Details Panel */}
        <div className="space-y-6">
          {selectedCompany ? (
            <div className="p-6 rounded-2xl glass-card space-y-6 animate-float relative">
              
              {/* Close handler for mobile/tablet */}
              <button 
                onClick={() => setSelectedCompany(null)}
                className="absolute top-4 right-4 p-1 rounded-full bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-450 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getLogoColor(selectedCompany.name)} flex items-center justify-center font-bold text-white text-lg uppercase`}>
                  {selectedCompany.name.substring(0, 1)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-lg leading-tight">{selectedCompany.name}</h3>
                  <span className="text-xs text-indigo-400 font-extrabold">{selectedCompany.packages}</span>
                </div>
              </div>

              {/* Roles */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block">Hiring Roles</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCompany.roles.map((role, rIdx) => (
                    <span key={rIdx} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-900 text-[10px] text-slate-300 font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hiring process timeline */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block">Hiring Rounds</span>
                <div className="space-y-3 border-l border-slate-800 ml-2.5 pl-4 relative">
                  {selectedCompany.hiringProcess.map((round) => (
                    <div key={round.roundNumber} className="relative">
                      {/* Timeline node */}
                      <span className="absolute -left-[22px] top-0.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/25 shrink-0"></span>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-200">{round.name}</h4>
                        <p className="text-[10px] text-slate-450 leading-relaxed">{round.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedCompany.aptitudePattern && (
                <div className="space-y-2 border-t border-slate-900 pt-4">
                  <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block">Aptitude Pattern</span>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-[11px] text-slate-400 space-y-1">
                    <p><span className="font-bold text-slate-200">Sections:</span> {selectedCompany.aptitudePattern.sections.join(', ')}</p>
                    <p><span className="font-bold text-slate-200">Duration:</span> {selectedCompany.aptitudePattern.duration}</p>
                    <p><span className="font-bold text-slate-200">Questions:</span> {selectedCompany.aptitudePattern.questions}</p>
                  </div>
                </div>
              )}

              {selectedCompany.codingRounds && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block">Coding Rounds</span>
                  <div className="space-y-2">
                    {selectedCompany.codingRounds.map((round, idx) => (
                      <div key={`${round.name}-${idx}`} className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-[11px] text-slate-400">
                        <p className="font-bold text-slate-200">{round.name} • {round.problems} problems</p>
                        <p>{round.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expandable Previous Questions */}
              <div className="space-y-3 border-t border-slate-900 pt-4">
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block">Interview Archives</span>
                <div className="space-y-2">
                  {selectedCompany.previousQuestions && selectedCompany.previousQuestions.map((q, idx) => {
                    const isExpanded = expandedQuestionIdx === idx;
                    return (
                      <div key={idx} className="rounded-xl border border-slate-900 bg-slate-950/40 overflow-hidden">
                        <button
                          onClick={() => toggleQuestion(idx)}
                          className="w-full flex justify-between items-center p-3 text-left hover:bg-slate-900/40 text-slate-200 hover:text-white"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="block text-xs font-bold truncate">{q.title}</span>
                            <span className="text-[9px] text-slate-450 font-semibold">{q.role} • {q.year}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-indigo-400 shrink-0 transform transition-all ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                        {isExpanded && (
                          <div className="p-3 pt-0 border-t border-slate-900 text-[11px] text-slate-400 leading-relaxed bg-slate-900/10 font-medium">
                            <p className="bg-slate-950 p-2 rounded-lg font-mono text-emerald-450 border border-slate-900/60 overflow-x-auto text-[10px]">
                              {q.questionText}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-6 rounded-2xl glass-card text-center py-16 text-slate-500 text-xs">
              <Building2 className="w-10 h-10 text-slate-755 mx-auto mb-2" />
              Select a company from the directory to review recruitment timelines and interview questions.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
