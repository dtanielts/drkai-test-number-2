import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  FileText, 
  Activity, 
  Pill, 
  History, 
  Share2, 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  Upload, 
  Bell, 
  CheckCircle2, 
  ArrowRight,
  Menu,
  X,
  Lock,
  Globe,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


// --- Components ---

const Navbar = ({ onSignup }: { onSignup: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Stethoscope className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-brand-900">Dr. KAI</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">How it Works</a>
          <a href="#doctors" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">For Doctors</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={onSignup}
            className="bg-brand-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-700 transition-all shadow-md shadow-brand-500/10"
          >
            Sign up for beta
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-slate-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-t border-slate-100 p-6 shadow-xl md:hidden"
          >
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-lg font-medium text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="text-lg font-medium text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
              <a href="#doctors" className="text-lg font-medium text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>For Doctors</a>
              <hr className="border-slate-100" />
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onSignup();
                }}
                className="w-full bg-brand-600 text-white py-4 rounded-xl font-semibold"
              >
                Sign up for beta
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const BetaSignupModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('patient');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const signupData = { name, email, role };
    console.log('Submitting signup to /api/signup:', signupData);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      console.log('Signup response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Something went wrong';
        try {
          const data = await response.json();
          console.log('Error response data:', data);
          if (data.error) {
            errorMessage = typeof data.error === 'string' 
              ? data.error 
              : JSON.stringify(data.error);
          } else if (data.message) {
            errorMessage = data.message;
          } else {
            errorMessage = JSON.stringify(data);
          }
        } catch (e) {
          // If body is not JSON, use the status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Signup error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-10">
              {!isSubmitted ? (
                <>
                  <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-8">
                    <Stethoscope className="text-brand-600 w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">Join the Dr. KAI Beta</h3>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    Be among the first to experience the future of healthcare coordination.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">I am a...</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRole('patient')}
                          className={`py-3 rounded-xl border font-bold text-sm transition-all ${role === 'patient' ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-brand-200'}`}
                        >
                          Patient
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('doctor')}
                          className={`py-3 rounded-xl border font-bold text-sm transition-all ${role === 'doctor' ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-brand-200'}`}
                        >
                          Doctor
                        </button>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium">
                        {error}
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-brand-600 text-white py-5 rounded-2xl text-lg font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Processing...' : 'Request Early Access'}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-emerald-600 w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">You're on the list!</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Thank you, {name.split(' ')[0]}. We've received your request and will reach out to {email} soon.
                  </p>
                  <button 
                    onClick={onClose}
                    className="mt-8 text-brand-600 font-bold hover:text-brand-700"
                  >
                    Back to site
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
const Hero = ({ onSignup }: { onSignup: () => void }) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-brand-50 to-transparent opacity-50" />
      <div className="absolute -top-24 -left-24 -z-10 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-30" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full text-brand-700 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            Now in Private Beta
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6">
            Your personal AI <span className="text-brand-600">healthcare coordinator</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
            Prepare for appointments, understand your health, and keep your entire medical history organized.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onSignup}
              className="bg-brand-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 group"
            >
              Sign up for beta
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <img key={i} src={`https://picsum.photos/seed/user${i}/100/100`} className="w-8 h-8 rounded-full border-2 border-white" alt="User" referrerPolicy="no-referrer" />
              ))}
            </div>
            <span>Joined by 2,000+ patients this month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Mockup UI */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
              </div>
              <div className="text-xs font-medium text-slate-400">Dr. KAI Dashboard</div>
              <div className="w-6 h-6 rounded-full bg-brand-100" />
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Upcoming Appointment</h3>
                <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-md font-bold">In 2 days</span>
              </div>
              <div className="bg-brand-50/50 rounded-2xl p-4 border border-brand-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Calendar className="text-brand-600 w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Cardiology Review</div>
                    <div className="text-xs text-slate-500">Dr. Sarah Jenkins • 10:30 AM</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-brand-200 rounded-full w-full" />
                  <div className="h-2 bg-brand-100 rounded-full w-3/4" />
                </div>
                <button className="mt-4 w-full bg-brand-600 text-white text-xs font-bold py-2 rounded-lg">
                  Complete Visit Prep
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-100 rounded-2xl p-4">
                  <Activity className="text-emerald-500 w-5 h-5 mb-2" />
                  <div className="text-xs text-slate-500">Avg. Heart Rate</div>
                  <div className="text-lg font-bold text-slate-900">72 BPM</div>
                </div>
                <div className="border border-slate-100 rounded-2xl p-4">
                  <Pill className="text-orange-500 w-5 h-5 mb-2" />
                  <div className="text-xs text-slate-500">Meds Adherence</div>
                  <div className="text-lg font-bold text-slate-900">98%</div>
                </div>
              </div>
            </div>
          </div>
          {/* Floating Element */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-10 -left-10 z-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 max-w-[240px]"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="text-emerald-600 w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Lab Results Analyzed</div>
              <div className="text-[10px] text-slate-500">"Your cholesterol levels are improving. Keep it up!"</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Problem = () => {
  const problems = [
    {
      icon: <Clock className="w-6 h-6 text-brand-600" />,
      title: "Forgetting Symptoms",
      desc: "It's hard to remember every detail and symptom when you're finally in front of the doctor."
    },
    {
      icon: <Database className="w-6 h-6 text-brand-600" />,
      title: "Fragmented Records",
      desc: "Your medical history is scattered across different clinics, portals, and paper files."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-brand-600" />,
      title: "Confusing Results",
      desc: "Lab reports are full of medical jargon that's impossible to understand without a degree."
    },
    {
      icon: <History className="w-6 h-6 text-brand-600" />,
      title: "Repeating Your Story",
      desc: "Having to explain your entire medical history from scratch to every new specialist."
    }
  ];

  return (
    <section className="section-padding bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Healthcare is complex. Managing it shouldn't be.</h2>
          <p className="text-lg text-slate-600">We solve the most common frustrations patients face when navigating the healthcare system.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {problems.map((p, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-6">
                {p.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{p.title}</h3>
              <p className="text-slate-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = ({ onSignup }: { onSignup: () => void }) => {
  const steps = [
    {
      title: "Prepare",
      desc: "AI gathers your symptoms, medications, and history before your appointment through a simple chat.",
      benefits: [
        "Save 15+ minutes of paperwork at the clinic",
        "Ensure every symptom and concern is documented"
      ],
      mockup: (
        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4 text-brand-600" />
            </div>
            <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-xs text-slate-700 max-w-[80%]">
              Hello! I'm preparing your report for Dr. Jenkins. Can you describe the discomfort you've been feeling?
            </div>
          </div>
          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
            <div className="bg-brand-600 p-3 rounded-2xl rounded-tr-none text-xs text-white max-w-[80%]">
              It's a dull ache in my chest that started yesterday after my morning run.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4 text-brand-600" />
            </div>
            <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-xs text-slate-700 max-w-[80%]">
              I've noted that. Does the ache move to your arm or neck?
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Visit",
      desc: "You bring a structured, AI-generated report to your doctor. No more forgetting important details.",
      benefits: [
        "Give your doctor a professional clinical summary",
        "Spend your visit time on care, not repeating history"
      ],
      mockup: (
        <div className="p-6 space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <div className="text-[10px] font-bold text-brand-600 uppercase mb-1">Patient Summary Report</div>
            <div className="text-lg font-bold text-slate-900">Chest Discomfort Analysis</div>
          </div>
          <div className="space-y-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Chief Complaint</div>
              <div className="text-xs text-slate-700">Dull chest ache, onset 24h ago post-exertion. Radiates to left neck.</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Current Medications</div>
              <div className="text-xs text-slate-700">Lisinopril (10mg), Multivitamin.</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Patient Questions</div>
              <ul className="text-xs text-slate-700 list-disc ml-4">
                <li>Is this related to my recent increase in cardio?</li>
                <li>Should I adjust my Lisinopril dosage?</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Follow-up",
      desc: "Dr. KAI tracks your medications, explains lab results, and reminds you of the next steps in your care plan.",
      benefits: [
        "Understand lab results in plain, simple English",
        "Smart reminders for medications and follow-ups"
      ],
      mockup: (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900">Health Insights</h4>
            <Bell className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Activity className="text-emerald-600 w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900">LDL Cholesterol</div>
                <div className="text-lg font-bold text-emerald-600">110 mg/dL <span className="text-[10px] font-normal text-emerald-500">(-15%)</span></div>
              </div>
            </div>
            <div className="p-4 border border-slate-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Medication Adherence</span>
                <span className="text-brand-600 font-bold">98%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 w-[98%]" />
              </div>
              <div className="text-[10px] text-slate-500 italic">"You've missed 0 doses this week. Excellent work!"</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="how-it-works" className="section-padding">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">How Dr. KAI works</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">A patient-owned coordination layer that works independently of any clinic system.</p>
        </div>
        <div className="space-y-24">
          {steps.map((step, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}>
              <div className="flex-1">
                <div className="text-brand-600 font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-sm">0{i + 1}</span>
                  Step {i + 1}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{step.title}</h3>
                <p className="text-xl text-slate-600 leading-relaxed mb-8">{step.desc}</p>
                <ul className="space-y-4">
                  {step.benefits.map((benefit, j) => (
                    <li key={j} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle2 className="text-brand-500 w-5 h-5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="group relative bg-white rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 aspect-video cursor-pointer" onClick={onSignup}>
                  {/* Browser Header Mockup */}
                  <div className="bg-slate-50 border-b border-slate-100 p-3 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                    </div>
                    <div className="text-[10px] font-medium text-slate-400">Dr. KAI • {step.title}</div>
                    <div className="w-4 h-4 rounded-full bg-brand-100" />
                  </div>
                  
                  {/* Mockup Content */}
                  <div className="relative h-full bg-white group-hover:scale-[1.02] transition-transform duration-500">
                    {step.mockup}
                  </div>
                  
                  {/* Join Beta Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-300">
                    <div className="bg-brand-600 text-white px-6 py-3 rounded-full font-bold shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                      Join Private Beta
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    { icon: <Calendar />, title: "AI Visit Preparation", desc: "Structured intake before you walk in." },
    { icon: <Activity />, title: "Symptom Timeline", desc: "Visual history of how you feel over time." },
    { icon: <MessageSquare />, title: "Lab Result Explanation", desc: "Complex data turned into plain English." },
    { icon: <Pill />, title: "Medication Tracking", desc: "Smart reminders and interaction checks." },
    { icon: <Upload />, title: "Medical Record Upload", desc: "One home for all your PDFs and photos." },
    { icon: <FileText />, title: "Doctor-Ready Reports", desc: "Professional summaries for your visits." },
    { icon: <Bell />, title: "Smart Reminders", desc: "Never miss a pill or an appointment." },
    { icon: <Lock />, title: "AI Chat on Health Data", desc: "Ask questions about your own history." }
  ];

  return (
    <section id="features" className="section-padding bg-brand-900 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-brand-500 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-400 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to <br />manage your care</h2>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto">Powerful tools designed for patients with complex needs and chronic conditions.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 bg-brand-600/20 rounded-2xl flex items-center justify-center mb-6 text-brand-400 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-brand-200 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ForDoctors = () => {
  return (
    <section id="doctors" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-brand-50 rounded-[40px] p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8">Doctors love Dr. KAI too.</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <Clock className="text-brand-600 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Save 5–8 minutes per visit</h4>
                  <p className="text-slate-600">Receive structured patient intake before the appointment even starts.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <FileText className="text-brand-600 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">AI-Structured Reports</h4>
                  <p className="text-slate-600">No more digging through messy notes. Get clear, concise summaries.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <Stethoscope className="text-brand-600 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Better Prepared Patients</h4>
                  <p className="text-slate-600">Patients arrive with clear questions and a full understanding of their history.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-brand-100">
              <div className="flex items-center gap-4 mb-8">
                <img src="https://picsum.photos/seed/doctor/100/100" className="w-16 h-16 rounded-full" alt="Doctor" referrerPolicy="no-referrer" />
                <div>
                  <div className="font-bold text-slate-900">Dr. Michael Chen</div>
                  <div className="text-sm text-slate-500">Internal Medicine, Berlin</div>
                </div>
              </div>
              <p className="text-lg text-slate-700 italic leading-relaxed mb-6">
                "Dr. KAI has completely changed how I interact with my chronic patients. I spend less time on data entry and more time on actual care. The reports are exactly what I need."
              </p>
              <div className="flex items-center gap-1 text-orange-400">
                {[1,2,3,4,5].map(i => <CheckCircle2 key={i} className="w-5 h-5 fill-current" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Trust = () => {
  return (
    <section className="py-20 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-md">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Your data, your control.</h3>
            <p className="text-slate-600">Dr. KAI is built on a privacy-first architecture. We never sell your data to insurance companies or third parties.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-3">
              <ShieldCheck className="w-10 h-10 text-brand-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">GDPR Compliant</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Lock className="w-10 h-10 text-brand-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">End-to-End Encrypted</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Share2 className="w-10 h-10 text-brand-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Patient Owned</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Globe className="w-10 h-10 text-brand-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">HIPAA Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Vision = () => {
  return (
    <section className="section-padding bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-8">The future of healthcare coordination</h2>
        <p className="text-xl text-brand-100 max-w-3xl mx-auto leading-relaxed mb-16">
          Dr. KAI is more than an app. We are building the universal infrastructure layer for healthcare—a patient-owned timeline that integrates seamlessly with clinics and systems worldwide.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 border border-white/10 rounded-3xl bg-white/5">
            <div className="text-4xl font-bold text-brand-400 mb-4">01</div>
            <h4 className="text-xl font-bold mb-4">Infrastructure Layer</h4>
            <p className="text-brand-200">The connective tissue between fragmented healthcare providers.</p>
          </div>
          <div className="p-8 border border-white/10 rounded-3xl bg-white/5">
            <div className="text-4xl font-bold text-brand-400 mb-4">02</div>
            <h4 className="text-xl font-bold mb-4">System Integration</h4>
            <p className="text-brand-200">Directly syncing with hospital EMRs while keeping you in control.</p>
          </div>
          <div className="p-8 border border-white/10 rounded-3xl bg-white/5">
            <div className="text-4xl font-bold text-brand-400 mb-4">03</div>
            <h4 className="text-xl font-bold mb-4">Universal Timeline</h4>
            <p className="text-brand-200">A lifelong, portable health record that travels with you anywhere.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const FinalCTA = ({ onSignup }: { onSignup: () => void }) => {
  return (
    <section className="section-padding bg-brand-600 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 skew-x-12 transform translate-x-1/2" />
      </div>
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8">Take control of your healthcare journey today.</h2>
        <p className="text-xl text-brand-100 mb-12">Join thousands of patients who are finally understanding their health and getting better care.</p>
        <button 
          onClick={onSignup}
          className="bg-white text-brand-600 px-10 py-5 rounded-full text-xl font-bold hover:bg-brand-50 transition-all shadow-2xl shadow-black/10"
        >
          Sign up for beta
        </button>
      </div>
    </section>
  );
};

// --- Main App ---

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        console.log('Server health check:', data);
      } catch (err) {
        console.error('Server health check failed:', err);
      }
    };
    checkHealth();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen selection:bg-brand-100 selection:text-brand-900">
      <Navbar onSignup={openModal} />
      <main>
        <Hero onSignup={openModal} />
        <Problem />
        <HowItWorks onSignup={openModal} />
        <Features />
        <ForDoctors />
        <Trust />
        <Vision />
        <FinalCTA onSignup={openModal} />
      </main>
      <footer className="bg-slate-50 py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Stethoscope className="text-brand-600 w-6 h-6" />
                <span className="font-bold text-xl text-slate-900">Dr. KAI</span>
              </div>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                The future of healthcare coordination. Empowering patients with AI-driven insights and organized medical history.
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-slate-400 text-sm">© 2026 Dr. KAI. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-brand-600 transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-brand-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
      <BetaSignupModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}

