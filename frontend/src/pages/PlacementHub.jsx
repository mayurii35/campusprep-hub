import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Search, Calendar, MapPin, DollarSign, Award, Users, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function PlacementHub() {
  const { executeApi } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  // Apply state
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]); // stores IDs of successfully applied jobs

  const tabs = ['All', 'Internship', 'Placement Drive', 'Job Opportunity'];

  useEffect(() => {
    fetchJobsList();
  }, []);

  const fetchJobsList = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await executeApi('/api/jobs/list');
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      } else {
        setError('Failed to retrieve job listings.');
      }
    } catch (err) {
      setError('Network error fetching career opportunities.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    setApplyingJobId(jobId);
    try {
      const res = await executeApi('/api/jobs/apply', {
        method: 'POST',
        body: JSON.stringify({ jobId })
      });

      if (res.ok) {
        setAppliedJobs(prev => [...prev, jobId]);
        // Re-fetch list to increment count visually
        fetchJobsList();
      }
    } catch (err) {
      console.error('Apply job error:', err);
    } finally {
      setApplyingJobId(null);
    }
  };

  // Filter criteria
  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          j.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || j.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const getLogoColor = (company) => {
    const colors = {
      google: 'from-blue-500 via-red-500 to-yellow-500',
      amazon: 'from-amber-500 to-orange-600',
      microsoft: 'from-blue-600 to-teal-500',
      tcs: 'from-blue-800 to-indigo-900'
    };
    return colors[company.toLowerCase()] || 'from-indigo-500 to-purple-500';
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-455 animate-pulse">Scanning placement drives...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Module Title */}
      <div className="flex items-center space-x-3 border-b border-slate-900 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-200">Recruitment & Placements</h2>
          <p className="text-xs text-slate-455 mt-0.5">Explore active career campaigns, internships, and submit instant applications.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-450 rounded-xl flex items-center space-x-2 text-xs">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex border-b border-slate-900 space-x-4 overflow-x-auto pb-1 scrollbar-hide w-full sm:w-auto">
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
              {tab}s
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roles, locations..."
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredJobs.map((job) => {
          const isApplied = appliedJobs.includes(job._id || job.id);
          const isApplying = applyingJobId === (job._id || job.id);

          return (
            <div key={job.id} className="p-6 rounded-2xl glass-card flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getLogoColor(job.companyName)} flex items-center justify-center font-bold text-white text-base shadow uppercase`}>
                      {job.companyName.substring(0, 1)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-200 text-sm sm:text-base leading-snug">{job.title}</h3>
                      <p className="text-xs text-indigo-400 font-bold">{job.companyName}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] text-indigo-400 font-bold uppercase tracking-wider shrink-0">
                    {job.type}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 leading-relaxed pt-1">
                  <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {job.location}</span>
                  <span className="flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {job.salary}</span>
                  <span className="flex items-center sm:col-span-2"><Award className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Eligibility: {job.eligibility}</span>
                </div>

                {job.description && (
                  <p className="text-xs text-slate-450 leading-relaxed border-t border-slate-900 pt-3">
                    {job.description}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex justify-between items-center border-t border-slate-900 pt-4 text-xs">
                <span className="flex items-center text-slate-500">
                  <Users className="w-4 h-4 mr-1 text-slate-650" />
                  {job.applicantsCount} student applicants
                </span>
                
                {isApplied ? (
                  <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Applied</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleApply(job._id || job.id)}
                    disabled={isApplying}
                    className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-755 disabled:cursor-not-allowed font-bold text-slate-100 rounded-xl transition-all flex items-center"
                  >
                    {isApplying ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Apply Now</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 text-slate-550 text-xs col-span-2">
            No matching placement opportunities found.
          </div>
        )}
      </div>
    </div>
  );
}
