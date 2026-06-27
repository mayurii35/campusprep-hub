import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Award, CheckCircle, Activity, Edit2, Check, RefreshCw, AlertCircle, Bookmark } from 'lucide-react';

export default function Profile() {
  const { user, updateProfileFields } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.profile?.fullName || '');
  const [collegeName, setCollegeName] = useState(user?.profile?.collegeName || '');
  const [cgpa, setCgpa] = useState(user?.profile?.cgpa || '');
  const [skills, setSkills] = useState(user?.profile?.skills?.join(', ') || '');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!fullName || !collegeName || !cgpa) {
      setError('Please complete Name, College, and CGPA fields.');
      return;
    }

    const cgpaNum = parseFloat(cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      setError('Please provide a valid CGPA between 0 and 10.');
      return;
    }

    setSaving(true);
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      await updateProfileFields({
        profile: {
          fullName,
          collegeName,
          cgpa: cgpaNum,
          skills: skillsArray,
          branch: user?.profile?.branch || 'Computer Science & Engineering',
          academicYear: user?.profile?.academicYear || 'Final Year',
          targetCompanies: user?.profile?.targetCompanies || []
        }
      });
      setSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  // Badge calculations based on progress thresholds
  const badges = [
    { title: 'DSA Ninja', desc: 'Achieved SDE-ready DSA milestones.', active: (user?.progress?.dsa || 0) >= 50 },
    { title: 'DBMS Analyst', desc: 'Capable of structuring index optimizations.', active: (user?.progress?.dbms || 0) >= 30 },
    { title: 'Aptitude Pro', desc: 'Solved quantitative speed worksheets.', active: (user?.progress?.aptitude || 0) >= 40 },
    { title: 'Placement Ready', desc: 'Onboarded and established first roadmap.', active: user?.isOnboarded }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Module Title */}
      <div className="flex items-center space-x-3 border-b border-slate-900 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-200">Student Profile</h2>
          <p className="text-xs text-slate-455 mt-0.5">Manage academic details, skill tags, goals, and earned certifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Visual summary & details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main profile card */}
          <div className="p-6 rounded-2xl glass-card space-y-6 relative">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-500 flex items-center justify-center font-bold text-white uppercase text-xl shrink-0">
                  {user?.profile?.fullName?.substring(0, 2) || 'ST'}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-100">{user?.profile?.fullName || 'Alex Carter'}</h3>
                  <p className="text-xs text-slate-450 leading-relaxed">{user?.profile?.collegeName}</p>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-indigo-400 hover:text-indigo-350 transition-all flex items-center space-x-1.5"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-xs font-bold hidden sm:inline">Edit Details</span>
                </button>
              )}
            </div>

            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-xs rounded-xl flex items-center space-x-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-455 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* View / Edit Mode */}
            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-slate-350 border-t border-slate-900 pt-5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Branch</span>
                  <p className="font-semibold text-slate-200">{user?.profile?.branch || 'Computer Science & Engineering'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Academic Year</span>
                  <p className="font-semibold text-slate-200">{user?.profile?.academicYear || 'Final Year'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Cumulative CGPA</span>
                  <p className="font-semibold text-slate-200">{user?.profile?.cgpa || '8.50'} / 10</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Placement Goal</span>
                  <p className="font-semibold text-indigo-400">{user?.goal || 'Dream Company preparation'}</p>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">Verified Skill Badges</span>
                  <div className="flex flex-wrap gap-1.5">
                    {user?.profile?.skills && user.profile.skills.length > 0 ? (
                      user.profile.skills.map((s) => (
                        <span key={s} className="px-3 py-1 bg-slate-900 border border-slate-850 text-indigo-400 text-xs font-semibold rounded-lg">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">No skills registered yet.</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4 border-t border-slate-900 pt-5 text-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 pl-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 pl-1">College Name</label>
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 pl-1">Cumulative CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 pl-1">Skills (Comma separated)</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setError(''); }}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-bold transition-all flex items-center"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Save Changes</span>}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Chronological Activity Feed */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="font-extrabold text-slate-200 border-b border-slate-900 pb-3 flex items-center">
              <Activity className="w-4 h-4 text-indigo-400 mr-2" />
              Comprehensive Academic Logs
            </h3>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {user?.activity && user.activity.length > 0 ? (
                user.activity.map((act, idx) => (
                  <div key={idx} className="flex space-x-3 text-xs border-b border-slate-900/40 pb-3 last:border-b-0">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-200 leading-snug">{act.action}</p>
                      <p className="text-slate-450 leading-relaxed">{act.details}</p>
                      <span className="text-[10px] text-slate-500 block">
                        {act.date ? new Date(act.date).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No activity logged yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Achievements & Badges */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="font-extrabold text-slate-200 border-b border-slate-900 pb-3 flex items-center">
              <Award className="w-4 h-4 text-indigo-400 mr-2" />
              Achievements & Badges
            </h3>

            <div className="space-y-3.5">
              {badges.map((b) => (
                <div 
                  key={b.title} 
                  className={`p-4 rounded-xl border flex items-start space-x-3 transition-all ${
                    b.active 
                      ? 'bg-indigo-600/10 border-indigo-500/25 text-slate-100' 
                      : 'bg-slate-950/20 border-slate-900/60 opacity-40 text-slate-500'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 shrink-0 ${b.active ? 'text-indigo-400 fill-indigo-400' : 'text-slate-650'}`} />
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold">{b.title}</h4>
                    <p className="text-[10px] text-slate-450 leading-normal">{b.desc}</p>
                    {b.active && (
                      <span className="inline-flex items-center text-[9px] text-emerald-450 font-bold uppercase tracking-wider pt-1">
                        <CheckCircle className="w-3 h-3 mr-1" /> Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
