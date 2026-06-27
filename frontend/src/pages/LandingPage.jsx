import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ArrowRight, 
  Brain, 
  Code2, 
  FileCheck, 
  Building2, 
  Mic2, 
  Sparkles, 
  Users, 
  Compass, 
  MessageSquare,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);

  const stats = [
    { label: 'Successful Placements', value: '15,000+' },
    { label: 'Active College Partners', value: '120+' },
    { label: 'Highest Package Offered', value: '45.5 LPA' },
    { label: 'DSA & Coding Challenges', value: '2,500+' }
  ];

  const features = [
    {
      icon: Compass,
      title: 'AI Study Roadmap',
      desc: 'Get a personalized visual study path dynamically constructed based on your branch, target packages, and self-assessment scores.'
    },
    {
      icon: Code2,
      title: 'Technical Practice',
      desc: 'Revise core theory and practice interview questions in DSA, Database Management, Operating Systems, Networks, and OOP.'
    },
    {
      icon: Brain,
      title: 'Aptitude & Reasoning',
      desc: 'Master quantitative aptitude, logical reasoning, and verbal comprehension with structured tests and clear explanations.'
    },
    {
      icon: FileCheck,
      title: 'Mock Placement Tests',
      desc: 'Attempt simulated exam environments with countdown timers, question bookmarks, topic breakdowns, and performance analytics.'
    },
    {
      icon: Mic2,
      title: 'AI Mock Interview',
      desc: 'Simulate face-to-face panels with our feedback engine that audits response accuracy, highlights missing keywords, and shares suggestions.'
    },
    {
      icon: Building2,
      title: 'Company Archives',
      desc: 'Explore previous exam patterns, coding questions, and detailed hiring processes for Google, Amazon, Microsoft, TCS, and more.'
    }
  ];

  const testimonials = [
    {
      name: 'Manav Shinde ',
      role: 'SDE at Google (Class of 2025)',
      college: 'NIT Trichy',
      text: 'The personalized roadmap was a game changer for me. It pointed out DBMS and Operating Systems as my weak areas, which I polished before my final interviews. I landed my dream job!'
    },
    {
      name: 'Vrushali Patil',
      role: 'Software Engineer at Amazon',
      college: 'BITS Pilani',
      text: 'The AI Interview Simulator gave me realistic feedback on my DS/Algo explanations. Speaking into the text analyzer helped me build structure.'
    },
    {
      name: 'Manthan Bhosale',
      role: 'Digital Analyst at TCS',
      college: 'SRM University',
      text: 'Quantitative aptitude became easy with structured practice modules.'
    }
  ];

  const faqs = [
    {
      q: 'How does the AI Roadmap calculate my placement readiness?',
      a: 'It analyzes CGPA, weak subjects, and goals to build a weekly plan.'
    },
    {
      q: 'Can I practice company-specific interview rounds?',
      a: 'Yes, you get company-wise questions and patterns.'
    },
    {
      q: 'How does the AI Interview Simulator evaluate answers?',
      a: 'It checks keywords, structure, and accuracy.'
    },
    {
      q: 'Is this platform mobile-friendly?',
      a: 'Yes, fully responsive on all devices.'
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col">

      {/* GLOW EFFECTS */}
      <div className="bg-glow-purple top-10 left-[15%]"></div>
      <div className="bg-glow-green top-60 right-[10%]"></div>
      <div className="bg-glow-purple bottom-40 left-[5%]"></div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="w-8 h-8 text-indigo-500" />
            <span className="font-extrabold text-xl tracking-tight">
              CampusPrep <span className="text-indigo-400">Hub</span>
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <Link 
                to="/dashboard"
                className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/30 rounded-xl font-medium text-sm transition-all duration-200 shadow-md shadow-indigo-600/10"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-slate-350 hover:text-white font-medium text-sm px-3 py-2 transition-all">
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  <span>Register Free</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-20 pb-24 px-6 flex-1 max-w-7xl mx-auto w-full z-10">

        <div className="text-center space-y-8 max-w-4xl mx-auto">

          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider animate-float">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Career Accelerator</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold">
            Supercharge Your <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Placement Preparation
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-350 max-w-2xl mx-auto">
            The all-in-one platform for DSA, aptitude, interviews, and company prep.
          </p>

          {/* FIXED BUTTON ONLY */}
          <div className="flex justify-center">
            <Link 
              to="/login"
              className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-indigo-650 to-purple-650 hover:from-indigo-600 hover:to-purple-600 rounded-xl font-bold shadow-lg"
            >
              <span>Start My Placement Journey</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>

        {/* HERO MOCK UI (UNCHANGED) */}
        <div className="mt-16 relative rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-900/60 p-4 max-w-5xl mx-auto glass-card">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-800">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <div className="text-xs text-slate-500 pl-4 font-mono font-bold">
              campusprep-hub-dashboard
            </div>
          </div>
        </div>
      </section>

      {/* STATS (UNCHANGED) */}
      <section className="bg-slate-900/40 border-y border-slate-900 py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-black text-indigo-400">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES (UNCHANGED) */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold">Structured Training Modules</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-8 bg-slate-900 rounded-2xl">
                <Icon className="text-indigo-400 w-6 h-6 mb-3" />
                <h3 className="font-bold">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS (UNCHANGED) */}
      <section className="py-24 px-6 bg-slate-900/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Success Stories</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 bg-slate-900 rounded-xl">
                <p className="text-sm">"{t.text}"</p>
                <div className="mt-4 text-indigo-400 font-semibold">{t.name}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ (UNCHANGED) */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-10">FAQs</h2>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="border border-slate-800 rounded-xl">
              <button
                onClick={() => toggleFaq(i)}
                className="w-full flex justify-between p-4"
              >
                {f.q}
                <span>{activeFaq === i ? '−' : '+'}</span>
              </button>

              {activeFaq === i && (
                <div className="p-4 text-slate-400 border-t border-slate-800">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-slate-500 border-t border-slate-800">
        © {new Date().getFullYear()} CampusPrep Hub
      </footer>

    </div>
  );
}