import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Calendar,
  CheckSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Award,
  ChevronRight,
  Zap,
  CheckCircle2,
  ListTodo,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import leaderboard from '../data/leaderboard.json';
import dashboardStats from '../data/company_stats.json';

export default function Dashboard() {
  const { user, updateProfileFields } = useAuth();
  
  // Local checklists loaded from user weekly roadmap
  const currentWeek = 1;
  const weeklyPlan = user?.roadmap?.weeklyStudyPlan?.find(w => w.week === currentWeek) || {
    topics: ['Database Management Systems'],
    tasks: ['Complete SQL indexing guide', 'Practice normalization rules', 'Solve 15 practice questions']
  };

  const [tasks, setTasks] = useState(
    weeklyPlan.tasks.map((t, i) => ({ id: `task-${i}`, text: t, completed: user?.progress?.completedTasks?.includes(`task-${i}`) || false }))
  );

  const toggleTask = async (taskId) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    setTasks(updatedTasks);
    
    // Save to user progress on server
    const completedTaskIds = updatedTasks.filter(t => t.completed).map(t => t.id);
    try {
      await updateProfileFields({
        progress: {
          ...user.progress,
          completedTasks: completedTaskIds
        }
      });
    } catch (err) {
      console.error('Failed to save task update:', err);
    }
  };

  // Radial Gauge Math
  const readiness = user?.roadmap?.placementReadinessScore || 70;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (readiness / 100) * circumference;

  // Render SVG Performance Trend Line Chart
  const testTrendData = leaderboard.slice(0, 5).map(item => item.accuracy);
  const points = testTrendData.map((val, idx) => {
    const x = 50 + idx * 80;
    const y = 180 - (val / 100) * 130;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
      {/* Background glow effects */}
      <div className="bg-glow-purple top-10 right-20"></div>
      <div className="bg-glow-green bottom-20 left-10"></div>

      {/* Welcome & Streak Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/50 via-purple-900/30 to-slate-900 border border-slate-800 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Week 1 in Progress</span>
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100">
            Welcome back, {user?.profile?.fullName || 'Alex'}!
          </h2>
          <p className="text-sm text-slate-350 max-w-xl leading-relaxed">
            Your placement targets are actively monitoring candidates. Keep up your streak and solve mock worksheets to increase your score!
          </p>
        </div>

        <div className="shrink-0 flex items-center space-x-4 z-10 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400">
            <Flame className="w-6 h-6 fill-orange-400 animate-pulse" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-200">{user?.streak || 3} Day Streak</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Solve 1 task to keep alive</div>
          </div>
        </div>
      </div>

      {/* Grid of Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placement Readiness circular gauge */}
        <div className="p-6 rounded-2xl glass-card flex items-center justify-between">
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Readiness Rating</h3>
            <div className="text-3xl font-black text-slate-100">{readiness}%</div>
            <p className="text-[11px] text-slate-450 leading-snug">
              Based on academics, ratings, and active test records.
            </p>
          </div>

          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-800 fill-transparent"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-indigo-500 fill-transparent transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute font-black text-base text-indigo-400">
              {readiness}%
            </div>
          </div>
        </div>

        {/* Study Target status */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Prep Track</span>
              <h4 className="text-base font-extrabold text-slate-200 truncate">{user?.goal || 'Dream Company Track'}</h4>
            </div>
            <Award className="w-6 h-6 text-indigo-400" />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Goal Target:</span>
              <span className="font-semibold text-slate-200">
                {user?.profile?.targetCompanies?.slice(0, 2)?.join(', ') || 'FAANG'}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>CGPA Metric:</span>
              <span className="font-semibold text-slate-200">{user?.profile?.cgpa || '8.50'} / 10</span>
            </div>
          </div>
        </div>

        {/* Action center links */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Next Action Point</span>
            <p className="text-sm font-semibold text-slate-200">Attempt Mock Test for Google SDE Simulation</p>
          </div>
          
          <Link 
            to="/mock-tests" 
            className="flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-550 rounded-xl text-xs font-bold text-slate-100 transition-all shadow-md shadow-indigo-650/15"
          >
            <span>Launch Mock Exam</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Completed Tests', value: dashboardStats.completedTests, tone: 'text-indigo-400' },
          { label: 'Average Accuracy', value: `${dashboardStats.averageAccuracy}%`, tone: 'text-emerald-400' },
          { label: 'Strong Areas', value: dashboardStats.strengths.length, tone: 'text-amber-400' },
          { label: 'Weak Areas', value: dashboardStats.weakAreas.length, tone: 'text-rose-400' }
        ].map((item) => (
          <div key={item.label} className="p-5 rounded-2xl glass-card">
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">{item.label}</span>
            <div className={`text-2xl font-black mt-1 ${item.tone}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Main Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Checklist & Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Weekly checklist cards */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <div className="flex items-center space-x-2">
                <ListTodo className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-200">Weekly Milestones Checklist</h3>
              </div>
              <span className="text-xs text-slate-450 font-medium">Week {currentWeek} Tasks</span>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                    task.completed 
                      ? 'bg-slate-900/40 border-slate-900 text-slate-500' 
                      : 'bg-slate-900/10 border-slate-850 hover:border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 pr-4">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      task.completed ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-600'
                    }`}>
                      {task.completed && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={`text-xs ${task.completed ? 'line-through' : ''}`}>
                      {task.text}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line Chart for test scores */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-200">Diagnostic Assessment Scores</h3>
              </div>
              <span className="text-xs text-indigo-400 font-semibold flex items-center">
                Score Accuracy <ArrowRight className="w-3 h-3 ml-1" />
              </span>
            </div>

            {/* Inline SVG Chart */}
            <div className="relative w-full h-[200px] border border-slate-900/60 rounded-xl bg-slate-950/45 p-2 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="30" y1="50" x2="380" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="30" y1="115" x2="380" y2="115" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="30" y1="180" x2="380" y2="180" stroke="#1e293b" />

                {/* Y Axis Labels */}
                <text x="5" y="55" fill="#64748b" className="text-[10px] font-mono">80%</text>
                <text x="5" y="120" fill="#64748b" className="text-[10px] font-mono">50%</text>
                <text x="5" y="185" fill="#64748b" className="text-[10px] font-mono">20%</text>

                {/* Chart Path */}
                <polyline
                  fill="none"
                  stroke="url(#chart-gradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
                
                {/* Dots on points */}
                {testTrendData.map((val, idx) => {
                  const x = 50 + idx * 80;
                  const y = 180 - (val / 100) * 130;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="4.5"
                      className="fill-indigo-500 stroke-slate-950"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Gradients */}
                <defs>
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between px-10 text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                <span>Diag 1</span>
                <span>Diag 2</span>
                <span>Mock A</span>
                <span>Mock B</span>
                <span>Mock C</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Subject progress & activity feed */}
        <div className="space-y-6">
          
          {/* Progress by Subjects */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="font-bold text-slate-200 border-b border-slate-900 pb-3">Topic Core Progress</h3>
            
            <div className="space-y-3.5">
              {[
                { name: 'Quantitative Aptitude', score: user?.progress?.aptitude || 45 },
                { name: 'Data Structures (DSA)', score: user?.progress?.dsa || 60 },
                { name: 'Databases (DBMS)', score: user?.progress?.dbms || 30 },
                { name: 'Operating Systems', score: user?.progress?.os || 15 },
                { name: 'Object Oriented (OOP)', score: user?.progress?.oop || 40 },
                { name: 'HR & Behavioral Prep', score: user?.progress?.hr || 25 }
              ].map((prog) => (
                <div key={prog.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-350 truncate">{prog.name}</span>
                    <span className="text-indigo-400">{prog.score}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500" 
                      style={{ width: `${prog.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="font-bold text-slate-200 border-b border-slate-900 pb-3">Leaderboard</h3>
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
                      {entry.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-200 truncate">{entry.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{entry.strongArea}</p>
                    </div>
                  </div>
                  <span className="font-black text-emerald-400">{entry.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="font-bold text-slate-200 border-b border-slate-900 pb-3">Strengths & Weak Areas</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Strengths</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {dashboardStats.strengths.map(item => <span key={item} className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{item}</span>)}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Weak Areas</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {dashboardStats.weakAreas.map(item => <span key={item} className="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">{item}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="font-bold text-slate-200 border-b border-slate-900 pb-3">Recent Activity</h3>
            
            <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
              {user?.activity && user.activity.length > 0 ? (
                user.activity.slice().reverse().map((act, idx) => (
                  <div key={idx} className="flex space-x-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-200 leading-snug">{act.action}</p>
                      <p className="text-slate-450 leading-relaxed">{act.details}</p>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {act.date ? new Date(act.date).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  <Clock className="w-8 h-8 text-slate-650 mx-auto mb-2" />
                  No actions logged yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
