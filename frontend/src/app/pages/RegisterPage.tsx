import { useState, useRef } from 'react';
import { Flame, ArrowLeft, ArrowRight, User, Mail, Lock, Phone, Upload, Camera, KeyRound, CheckCircle2, FileImage, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { registerUser, resendOtp, verifyOtp } from '../services/auth';

interface RegisterPageProps {
  onBack: () => void;
  role: 'student' | 'admin';
  backTo?: 'landing' | 'login';
  onRegistered?: () => void;
}

const STEPS = [
  { label: 'Personal', icon: User },
  { label: 'Documents', icon: FileImage },
  { label: 'Face ID', icon: Camera },
  { label: 'Verify', icon: ShieldCheck },
];

export function RegisterPage({ onBack, role, backTo = 'login', onRegistered }: RegisterPageProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [idCard, setIdCard] = useState<File | null>(null);
  const [aadhar, setAadhar] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isStudent = role === 'student';
  const accentColor = isStudent ? 'violet' : 'amber';
  const accentGradient = isStudent
    ? 'from-violet-500 via-fuchsia-500 to-pink-500'
    : 'from-amber-500 via-orange-500 to-rose-500';

  const handleNext = async () => {
    setError('');
    setSuccessMessage('');

    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Name, email, and password are required');
        return;
      }
      setStep(2);
      return;
    }

    if (step < 4) {
      setStep(step + 1);
      return;
    }

    if (!otpSent) {
      setIsSubmitting(true);
      try {
        await registerUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phoneNumber: formData.phone.trim() || undefined,
          role,
        });
        setOtpSent(true);
        setSuccessMessage('OTP sent to your email address');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to register right now');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const otpValue = otp.join('').trim();
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtp(formData.email.trim(), otpValue);
      setSuccessMessage('Email verified. Redirecting to login...');
      setTimeout(() => {
        onRegistered?.();
      }, 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OTP verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSelfieCapture = () => {
    // Simulate selfie capture
    setSelfie('selfie_captured');
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      await resendOtp(formData.email.trim());
      setOtp(['', '', '', '', '', '']);
      setSuccessMessage('OTP resent to your email');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-1">Personal Info</h3>
              <p className="text-xs text-zinc-400">Tell us about yourself</p>
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <User className="w-4 h-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={`w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 text-sm font-medium focus:outline-none focus:border-${accentColor}-500/40 transition-all`}
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <Mail className="w-4 h-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 text-sm font-medium focus:outline-none focus:border-${accentColor}-500/40 transition-all`}
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <Lock className="w-4 h-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 text-sm font-medium focus:outline-none focus:border-${accentColor}-500/40 transition-all`}
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <Phone className="w-4 h-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
              </div>
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 text-sm font-medium focus:outline-none focus:border-${accentColor}-500/40 transition-all`}
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-1">Documents</h3>
              <p className="text-xs text-zinc-400">Upload your verification documents</p>
            </div>

            {/* ID Card Upload */}
            <label className={`group relative block w-full p-6 bg-zinc-900/30 border-2 border-dashed ${idCard ? `border-${accentColor}-500/40 bg-${accentColor}-500/5` : 'border-zinc-800 hover:border-zinc-700'} rounded-2xl cursor-pointer transition-all`}>
              <input
                type="file"
                accept="image/*"
                onChange={e => setIdCard(e.target.files?.[0] || null)}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${idCard ? `bg-${accentColor}-500/10` : 'bg-zinc-800'} flex items-center justify-center transition-colors`}>
                  {idCard ? (
                    <CheckCircle2 className={`w-5 h-5 text-${accentColor}-400`} />
                  ) : (
                    <Upload className="w-5 h-5 text-zinc-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {idCard ? idCard.name : 'College ID Card'}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-0.5">
                    {idCard ? 'File selected ✓' : 'PNG, JPG up to 5MB'}
                  </p>
                </div>
              </div>
            </label>

            {/* Aadhar Upload */}
            <label className={`group relative block w-full p-6 bg-zinc-900/30 border-2 border-dashed ${aadhar ? `border-${accentColor}-500/40 bg-${accentColor}-500/5` : 'border-zinc-800 hover:border-zinc-700'} rounded-2xl cursor-pointer transition-all`}>
              <input
                type="file"
                accept="image/*"
                onChange={e => setAadhar(e.target.files?.[0] || null)}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${aadhar ? `bg-${accentColor}-500/10` : 'bg-zinc-800'} flex items-center justify-center transition-colors`}>
                  {aadhar ? (
                    <CheckCircle2 className={`w-5 h-5 text-${accentColor}-400`} />
                  ) : (
                    <Upload className="w-5 h-5 text-zinc-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {aadhar ? aadhar.name : 'Aadhar Card'}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-0.5">
                    {aadhar ? 'File selected ✓' : 'PNG, JPG up to 5MB'}
                  </p>
                </div>
              </div>
            </label>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-6"
          >
            <div className="mb-6">
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-1">Face ID</h3>
              <p className="text-xs text-zinc-400">Quick selfie for identity verification</p>
            </div>

            <div
              onClick={handleSelfieCapture}
              className={`group relative w-full aspect-[4/3] rounded-2xl border-2 border-dashed ${selfie ? `border-emerald-500/40 bg-emerald-500/5` : 'border-zinc-800 hover:border-zinc-700'} flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden`}
            >
              {selfie ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-emerald-400">Face Captured</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Click to retake</p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-zinc-600">
                  <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-zinc-400">Capture Selfie</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest mt-1">Click to open camera</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-6"
          >
            <div className="mb-6">
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-1">Verify OTP</h3>
              <p className="text-xs text-zinc-400">Enter the code sent to your email</p>
            </div>

            {!otpSent ? (
              <div className="text-center space-y-6 py-6">
                <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
                  <KeyRound className={`w-8 h-8 text-${accentColor}-500`} />
                </div>
                <div>
                  <p className="text-sm text-zinc-400 mb-1">We'll send a 6-digit code to</p>
                  <p className="text-sm font-mono text-white font-bold">{formData.email || 'your@email.com'}</p>
                </div>
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-full bg-gradient-to-r ${accentGradient} text-${isStudent ? 'white' : 'black'} font-black uppercase italic tracking-tighter text-xs`}
                >
                  {isSubmitting ? 'Sending...' : 'Send OTP'}
                </motion.button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-lg font-black bg-zinc-900/50 border ${digit ? `border-${accentColor}-500/40` : 'border-zinc-800'} rounded-xl text-white focus:outline-none focus:border-${accentColor}-500 transition-all`}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <button
                    onClick={handleResendOtp}
                    disabled={isSubmitting}
                    className={`text-[11px] font-mono text-${accentColor}-500 hover:text-${accentColor}-400 uppercase tracking-widest transition-colors`}
                  >
                    {isSubmitting ? 'Resending...' : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br ${isStudent ? 'from-violet-600/[0.08] via-fuchsia-500/[0.04]' : 'from-amber-600/[0.08] via-orange-500/[0.04]'} to-transparent blur-[120px]`} />
        <div className={`absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-tr ${isStudent ? 'from-cyan-500/[0.06]' : 'from-rose-500/[0.06]'} to-transparent blur-[100px]`} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="relative">
              <Flame className="w-8 h-8 text-amber-500" fill="#f59e0b" />
              <div className="absolute inset-0 blur-lg bg-amber-500 opacity-40" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">HackFire</span>
          </div>
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.4em] font-bold">
            Create your {isStudent ? 'student' : 'admin'} account
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-zinc-950/60 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-zinc-800/80 relative overflow-hidden"
        >
          {/* Subtle inner glow */}
          <div className={`absolute -top-10 -right-10 w-40 h-40 bg-${accentColor}-500/5 blur-[60px] pointer-events-none`} />

          {/* Back button */}
          <button
            onClick={onBack}
            className="group flex items-center gap-2 mb-6 text-zinc-600 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] font-mono uppercase tracking-widest">{backTo === 'landing' ? 'Back to Home' : 'Back to Login'}</span>
          </button>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex items-center w-full">
                    <div className={`
                      w-full h-1 rounded-full transition-all duration-500
                      ${isCompleted ? `bg-gradient-to-r ${accentGradient}` : isActive ? `bg-${accentColor}-500/30` : 'bg-zinc-800'}
                    `} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <s.icon className={`w-3 h-3 ${isActive ? `text-${accentColor}-400` : isCompleted ? `text-${accentColor}-500` : 'text-zinc-700'} transition-colors`} />
                    <span className={`text-[9px] font-mono uppercase tracking-widest ${isActive ? `text-${accentColor}-400 font-bold` : isCompleted ? 'text-zinc-400' : 'text-zinc-700'} transition-colors`}>
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Role Tag */}
          <div className="flex items-center justify-end mb-6">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-${accentColor}-500/10 border border-${accentColor}-500/20`}>
              <Sparkles className={`w-3 h-3 text-${accentColor}-500`} />
              <span className={`text-[10px] font-black uppercase tracking-widest text-${accentColor}-400`}>
                {isStudent ? 'Student' : 'Admin'}
              </span>
            </div>
          </div>

          {/* Step Content */}
          {(error || successMessage) && (
            <div
              className={`mb-5 px-4 py-3 rounded-xl text-xs font-medium ${
                error
                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              }`}
            >
              {error || successMessage}
            </div>
          )}
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <motion.button
                onClick={() => setStep(step - 1)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-4 rounded-full border-2 border-zinc-800 text-zinc-400 font-bold uppercase tracking-tighter text-xs hover:border-zinc-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </motion.button>
            )}
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.02, boxShadow: `0 0 40px ${isStudent ? 'rgba(139, 92, 246, 0.15)' : 'rgba(251, 191, 36, 0.15)'}` }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className={`flex-1 py-4 rounded-full bg-gradient-to-r ${accentGradient} text-${isStudent ? 'white' : 'black'} font-black uppercase italic tracking-tighter text-xs flex items-center justify-center gap-2 shadow-xl ${isStudent ? 'shadow-violet-500/20' : 'shadow-amber-500/20'} transition-all`}
            >
              {step !== 4
                ? 'Continue'
                : !otpSent
                  ? (isSubmitting ? 'Sending OTP...' : 'Send OTP')
                  : (isSubmitting ? 'Verifying...' : 'Complete')}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
