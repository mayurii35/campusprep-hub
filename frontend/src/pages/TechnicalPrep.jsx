import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Code,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Layers,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Target
} from 'lucide-react';

const categories = ['Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Dynamic Programming'];
const pageSize = 9;

export default function TechnicalPrep() {
  const { executeApi } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('Arrays');
  const [difficulty, setDifficulty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [completed, setCompleted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('coding-progress') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await executeApi('/api/prep/coding-problems');
        if (res.ok) {
          const data = await res.json();
          setProblems(data);
          setSelectedProblem(data.find(p => p.category === activeCategory) || data[0] || null);
        } else {
          setError('Failed to retrieve coding problems.');
        }
      } catch (err) {
        setError('Network error loading coding practice data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, difficulty, searchTerm]);

  const filtered = useMemo(() => {
    return problems.filter((problem) => {
      const matchesCategory = problem.category === activeCategory;
      const matchesDifficulty = difficulty === 'All' || problem.difficulty === difficulty;
      const query = searchTerm.toLowerCase();
      const matchesSearch = !query ||
        problem.title.toLowerCase().includes(query) ||
        problem.problemStatement.toLowerCase().includes(query) ||
        problem.tags?.some(tag => tag.toLowerCase().includes(query));
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [problems, activeCategory, difficulty, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const completedSet = new Set(completed);
  const completedInCategory = problems.filter(p => p.category === activeCategory && completedSet.has(p.id)).length;
  const categoryTotal = problems.filter(p => p.category === activeCategory).length || 1;
  const progress = Math.round((completedInCategory / categoryTotal) * 100);

  const toggleComplete = (problemId) => {
    const next = completedSet.has(problemId)
      ? completed.filter(id => id !== problemId)
      : [...completed, problemId];
    setCompleted(next);
    localStorage.setItem('coding-progress', JSON.stringify(next));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-450 animate-pulse">Loading coding practice library...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-3 border-b border-slate-900 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Code className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-200">Coding Practice</h2>
          <p className="text-xs text-slate-450 mt-0.5">Practice DSA problems with statements, samples, constraints, and solution guidance.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl flex items-center space-x-2 text-xs">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-slate-900 space-x-4 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`py-2 px-1 text-xs font-bold transition-all border-b-2 shrink-0 ${
                  activeCategory === category ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search problems, tags, or concepts..."
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

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {visible.map(problem => {
              const done = completedSet.has(problem.id);
              return (
                <button
                  key={problem.id}
                  onClick={() => setSelectedProblem(problem)}
                  className={`p-5 rounded-2xl glass-card text-left space-y-4 transition-all ${
                    selectedProblem?.id === problem.id ? 'ring-2 ring-indigo-500' : 'glass-card-hover'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                      problem.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      problem.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                      'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {problem.difficulty}
                    </span>
                    {done && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-100 leading-snug">{problem.title}</h3>
                    <p className="text-[11px] text-slate-450 mt-2 line-clamp-3">{problem.problemStatement}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {problem.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-900 text-[9px] text-slate-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {visible.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Layers className="w-10 h-10 mx-auto mb-2 text-slate-700" />
              No coding problems match the current filters.
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-900 pt-4">
            <span className="text-xs text-slate-500">Page {page} of {totalPages} • {filtered.length} problems</span>
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

        <aside className="space-y-6">
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Category Progress</span>
                <h3 className="font-extrabold text-slate-100">{activeCategory}</h3>
              </div>
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
              <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-400">{completedInCategory} of {categoryTotal} problems completed ({progress}%).</p>
          </div>

          {selectedProblem && (
            <div className="p-6 rounded-2xl glass-card space-y-5">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">{selectedProblem.category}</span>
                <h3 className="text-lg font-black text-slate-100 leading-tight">{selectedProblem.title}</h3>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {selectedProblem.difficulty}</span>
                  <span className="flex items-center"><BookOpen className="w-3.5 h-3.5 mr-1" /> {selectedProblem.tags?.join(', ')}</span>
                </div>
              </div>

              <p className="text-xs text-slate-350 leading-relaxed">{selectedProblem.problemStatement}</p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-900">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Sample Input</span>
                  <code className="text-emerald-400">{selectedProblem.sampleInput}</code>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-900">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Sample Output</span>
                  <code className="text-emerald-400">{selectedProblem.sampleOutput}</code>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block mb-2">Constraints</span>
                <ul className="space-y-1 text-xs text-slate-400 list-disc pl-4">
                  {selectedProblem.constraints?.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block mb-2">Solution Explanation</span>
                <p className="text-xs text-slate-350 leading-relaxed">{selectedProblem.solutionExplanation}</p>
              </div>

              <button
                onClick={() => toggleComplete(selectedProblem.id)}
                className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${
                  completedSet.has(selectedProblem.id)
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-indigo-650 hover:bg-indigo-600 text-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{completedSet.has(selectedProblem.id) ? 'Completed' : 'Mark Completed'}</span>
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
