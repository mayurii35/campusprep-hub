import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  AlertCircle, 
  Briefcase, 
  Sliders, 
  Star, 
  Layers 
} from 'lucide-react';

export default function Onboarding() {
  const { user, submitOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 2 Form State
  const [fullName, setFullName] = useState(user?.profile?.fullName || '');
  const [collegeName, setCollegeName] = useState(user?.profile?.collegeName || '');
  const [branch, setBranch] = useState(user?.profile?.branch || 'Computer Science & Engineering');
  const [academicYear, setAcademicYear] = useState(user?.profile?.academicYear || 'Final Year');
  const [cgpa, setCgpa] = useState(user?.profile?.cgpa || '');
  const [skills, setSkills] = useState(user?.profile?.skills?.join(', ') || '');
  const [targetCompanies, setTargetCompanies] = useState(user?.profile?.targetCompanies?.join(', ') || '');

  // Step 3 Ratings State (1-10)
  const [ratings, setRatings] = useState({
    aptitude: 5,
    dsa: 5,
    dbms: 5,
    os: 5,
    cn: 5,
    oop: 5,
    communication: 5
  });

  // Step 4 Goal Selection
  const [goal, setGoal] = useState('Dream Company Preparation');

  // Step 5 Generated Roadmap State (retrieved from backend)
  const [roadmap, setRoadmap] = useState(null);

  const handleRatingChange = (subject, val) => {
    setRatings(prev => ({
      ...prev,
      [subject]: Number(val)
    }));
  };

  const handleGenerateRoadmap = async () => {
    setError('');
    
    // Validations for Step 2
    if (!fullName || !collegeName || !cgpa) {
      setError('Please fill out your Name, College, and CGPA before proceeding.');
      setStep(2);
      return;
    }

    const cgpaNum = parseFloat(cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      setError('Please enter a valid CGPA between 0 and 10.');
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const companiesArray = targetCompanies.split(',').map(c => c.trim()).filter(c => c.length > 0);

      const onboardingData = {
        profile: {
          fullName,
          collegeName,
          branch,
          academicYear,
          cgpa: cgpaNum,
          skills: skillsArray,
          targetCompanies: companiesArray
        },
        assessment: ratings,
        goal
      };

      const res = await submitOnboarding(onboardingData);
      if (res && res.roadmap) {
        setRoadmap(res.roadmap);
        setStep(5);
      }
    } catch (err) {
      setError(err.message || 'Error compiling your career roadmap. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setError('');
    if (step === 2) {
      if (!fullName || !collegeName || !cgpa) {
        setError('Please complete the Name, College, and CGPA fields.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const renderWelcome = () => (
    <div className="text-center space-y-6 max-w-2xl mx-auto py-8">
      {/* Visual illustration with CSS/SVG */}
      <div className="w-40 h-40 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20 shadow-xl shadow-indigo-600/5 relative">
        <GraduationCap className="w-20 h-20 text-indigo-400" />
        <Sparkles className="w-8 h-8 text-emerald-400 absolute top-4 right-4 animate-float" />
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-slate-100">Welcome to CampusPrep Hub</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Your personal AI-powered mentor. We will help you audit your technical readiness, structure a weekly roadmap, practice aptitude worksheets, and simulate mock interviews to secure your target placements.
        </p>
      </div>

      <button
        onClick={nextStep}
        className="inline-flex items-center space-x-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-550 font-bold rounded-xl text-sm transition-all duration-200 shadow-md shadow-indigo-600/25 mt-6"
      >
        <span>Start My Placement Journey</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-100">Student Profile Setup</h3>
        <p className="text-slate-400 text-xs mt-1">Let's gather your academic credentials</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 pl-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Alex Carter"
            className="w-full px-4 py-3 rounded-xl glass-input text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 pl-1">College Name</label>
          <input
            type="text"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            placeholder="e.g. Indian Institute of Technology"
            className="w-full px-4 py-3 rounded-xl glass-input text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 pl-1">Department / Branch</label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl glass-input text-xs"
          >
            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Communication">Electronics & Communication</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Other Science/Engineering">Other Science/Engineering</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 pl-1">Academic Year</label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full px-4 py-3 rounded-xl glass-input text-xs"
          >
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
            <option value="Third Year">Third Year</option>
            <option value="Final Year">Final Year</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 pl-1">CGPA (Out of 10.0)</label>
          <input
            type="number"
            step="0.01"
            value={cgpa}
            onChange={(e) => setCgpa(e.target.value)}
            placeholder="e.g. 8.75"
            className="w-full px-4 py-3 rounded-xl glass-input text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 pl-1">Skills (Comma separated)</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. React, Java, SQL, Python"
            className="w-full px-4 py-3 rounded-xl glass-input text-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5 pl-1">Target Companies (Comma separated)</label>
        <input
          type="text"
          value={targetCompanies}
          onChange={(e) => setTargetCompanies(e.target.value)}
          placeholder="e.g. Google, Amazon, Microsoft, TCS"
          className="w-full px-4 py-3 rounded-xl glass-input text-xs"
        />
      </div>

      <div className="flex justify-between items-center pt-4">
        <button onClick={prevStep} className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={nextStep}
          className="flex items-center space-x-1.5 px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderAssessment = () => {
    const subjects = [
      { key: 'aptitude', label: 'Quantitative & Logical Aptitude' },
      { key: 'dsa', label: 'Data Structures & Algorithms' },
      { key: 'dbms', label: 'Database Management Systems (DBMS)' },
      { key: 'os', label: 'Operating Systems (OS)' },
      { key: 'cn', label: 'Computer Networks (CN)' },
      { key: 'oop', label: 'Object Oriented Programming' },
      { key: 'communication', label: 'Communication & Interview Skills' }
    ];

    return (
      <div className="space-y-5">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-slate-100">Preparation Assessment</h3>
          <p className="text-slate-400 text-xs mt-1">Rate your current self-confidence (1 = Beginner, 10 = Expert)</p>
        </div>

        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
          {subjects.map((sub) => (
            <div key={sub.key} className="p-3 bg-slate-900/40 rounded-xl border border-slate-900 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-200">{sub.label}</span>
                <span className="text-indigo-400 font-bold flex items-center">
                  <Star className="w-3.5 h-3.5 fill-indigo-400 mr-1" />
                  {ratings[sub.key]}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={ratings[sub.key]}
                onChange={(e) => handleRatingChange(sub.key, e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4">
          <button onClick={prevStep} className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            onClick={nextStep}
            className="flex items-center space-x-1.5 px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderGoal = () => {
    const goals = [
      { id: 'Internship Preparation', label: 'Internship Preparation', desc: 'Secure technical roles or developer internships at premier firms.' },
      { id: 'Campus Placement', label: 'General Campus Placement', desc: 'Succeed in general college selection drives and mass recruiters.' },
      { id: 'Product-Based Companies', label: 'Product-Based Companies', desc: 'Crack top tier technology companies focusing on advanced DSA (FAANG/MAMAA).' },
      { id: 'Service-Based Companies', label: 'Service-Based Companies', desc: 'Focus on aptitude testing and developer basics for service industries.' },
      { id: 'Dream Company Preparation', label: 'Dream Company Preparation', desc: 'Custom curriculum aligned specifically to your target recruiter guidelines.' }
    ];

    return (
      <div className="space-y-5">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-100">Select Placement Goal</h3>
          <p className="text-slate-400 text-xs mt-1">Which track aligns with your placement strategy?</p>
        </div>

        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
          {goals.map((g) => (
            <button
              key={g.id}
              onClick={() => setGoal(g.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                goal === g.id
                  ? 'bg-indigo-600/15 border-indigo-500 text-slate-100 shadow-md shadow-indigo-600/5'
                  : 'bg-slate-900/30 border-slate-900 text-slate-350 hover:border-slate-800'
              }`}
            >
              <div className="min-w-0 pr-4">
                <span className="block text-sm font-bold">{g.label}</span>
                <span className="block text-[11px] text-slate-400 mt-1 leading-normal">{g.desc}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center ${
                goal === g.id ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-700'
              }`}>
                {goal === g.id && <Check className="w-3.5 h-3.5" />}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4">
          <button onClick={prevStep} className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            onClick={handleGenerateRoadmap}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-550 font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Generate Roadmap</span>
                <Sparkles className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderRoadmap = () => {
    if (!roadmap) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 animate-float">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-100">Personalized Roadmap Generated!</h3>
          <p className="text-slate-400 text-xs mt-1">Calculated path for target: <span className="text-indigo-400 font-semibold">{goal}</span></p>
        </div>

        {/* Scoring Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-900">
          <div className="text-center p-2 border-b sm:border-b-0 sm:border-r border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Readiness Score</span>
            <div className="text-3xl font-black text-indigo-400 mt-1">{roadmap.placementReadinessScore}%</div>
          </div>
          <div className="text-center p-2 border-b sm:border-b-0 sm:border-r border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prep Duration</span>
            <div className="text-3xl font-black text-emerald-400 mt-1">{roadmap.estimatedTimeline}</div>
          </div>
          <div className="text-center p-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Weekly Mode</span>
            <div className="text-3xl font-black text-purple-400 mt-1">Accelerated</div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <span className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Strengths</span>
            <ul className="space-y-1.5 text-xs text-slate-350">
              {roadmap.strengths.map((str, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <span className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Focus Areas</span>
            <ul className="space-y-1.5 text-xs text-slate-350">
              {roadmap.weakAreas.map((weak, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></div>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Learning Steps */}
        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-850">
          <span className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center">
            <BookOpen className="w-4 h-4 text-indigo-400 mr-2" />
            Learning Path Directives
          </span>
          <div className="space-y-2">
            {roadmap.recommendedLearningPath.map((stepStr, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-xs text-slate-350">
                <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </span>
                <p className="pt-0.5 leading-normal">{stepStr}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r from-indigo-650 to-indigo-650 hover:from-indigo-600 hover:to-indigo-600 font-bold rounded-xl text-sm transition-all duration-200"
        >
          <span>Enter Placement Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative">
      {/* Decorative Glows */}
      <div className="bg-glow-purple top-1/4 left-1/4"></div>
      <div className="bg-glow-green bottom-1/4 right-1/4"></div>

      <div className="w-full max-w-2xl glass-card p-8 rounded-2xl z-10 relative">
        {/* Logo Header inside card */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-900">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-indigo-500" />
            <span className="font-extrabold text-sm tracking-tight text-slate-200">CampusPrep Hub</span>
          </div>
          {step < 5 && (
            <span className="text-xs text-slate-450 font-semibold">
              Step {step} of 4
            </span>
          )}
        </div>

        {step === 1 && renderWelcome()}
        {step === 2 && renderProfile()}
        {step === 3 && renderAssessment()}
        {step === 4 && renderGoal()}
        {step === 5 && renderRoadmap()}
      </div>
    </div>
  );
}
