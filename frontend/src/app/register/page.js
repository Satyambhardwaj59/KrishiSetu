'use client';
import { useState, useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerUser, verifyRegistration, clearError, resetOtpState } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { Phone, LockKeyhole, User, Store, ArrowRight, Leaf, MapPin, Map, Building, Home } from 'lucide-react';

function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'farmer' ? 'farmer' : 'buyer';

  const [form, setForm] = useState({
    name: '', contact: '', password: '', role: defaultRole,
    address: '', city: '', state: '', pincode: ''
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);

  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, otpSent, error, isAuthenticated, mockOtp } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
    if (mockOtp && otpSent) {
      toast.success(`Mock OTP: ${mockOtp}`, { duration: 6000 });
      setOtp(mockOtp);
    }
  }, [error, mockOtp, otpSent, dispatch]);

  const isEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Enter your name');
    if (!form.contact.trim()) return toast.error('Enter an email or phone');
    if (!form.password || form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setStep(2);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!form.address.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      return toast.error('Please complete your location details');
    }
    const payload = { ...form };
    if (isEmail(form.contact)) payload.email = form.contact;
    else payload.phone = form.contact;
    delete payload.contact;

    dispatch(registerUser(payload));
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error('Enter 6 digit OTP');
    const payload = { otp };
    if (isEmail(form.contact)) payload.email = form.contact;
    else payload.phone = form.contact;
    dispatch(verifyRegistration(payload));
  };

  return (
    <Card glass className="w-full max-w-lg relative z-10 p-8 shadow-2xl space-y-6 animate-fade-in mx-4">
      <div className="text-center space-y-2 mb-6">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="KrishiSetu Logo" className="h-16 object-contain" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Create Account</h1>
        <p className="text-slate-400">Join KrishiSetu today</p>
      </div>

      {/* Progress Tracker */}
      {!otpSent && (
        <div className="flex justify-center gap-2 mb-6">
          <div className={`h-1.5 w-12 rounded-full ${step >= 1 ? 'bg-green-500' : 'bg-slate-700'}`}></div>
          <div className={`h-1.5 w-12 rounded-full ${step >= 2 ? 'bg-green-500' : 'bg-slate-700'}`}></div>
        </div>
      )}

      {!otpSent && step === 1 && (
        <form onSubmit={handleNextStep} className="space-y-5 animate-fade-in">
          <Input
            icon={User} type="text" placeholder="John Doe"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            label="Full Name" required
          />
          <Input
            icon={Phone} type="text" placeholder="Email or Phone Number"
            value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })}
            label="Email or Phone" required
          />
          <Input
            icon={LockKeyhole} type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            label="Password" required
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 block">I want to...</label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setForm({ ...form, role: 'buyer' })} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${form.role === 'buyer' ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                <Store size={24} />
                <span className="text-sm font-medium">Buy Produce</span>
              </button>
              <button type="button" onClick={() => setForm({ ...form, role: 'farmer' })} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${form.role === 'farmer' ? 'bg-amber-600/20 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                <Leaf size={24} />
                <span className="text-sm font-medium">Sell Harvest</span>
              </button>
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" className="mt-2">
            Next Step <ArrowRight size={18} />
          </Button>

          <p className="text-center text-sm text-slate-400 mt-4">
            Already have an account? <button type="button" onClick={() => router.push('/login')} className="text-green-400 hover:text-green-300 font-medium">Login</button>
          </p>
        </form>
      )}

      {!otpSent && step === 2 && (
        <form onSubmit={handleSendOtp} className="space-y-5 animate-fade-in">
          <Input
            icon={MapPin} type="text" placeholder="123 Farm Road, Suite 4"
            value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
            label="Street Address / Farm Location" required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              icon={Building} type="text" placeholder="e.g. Pune"
              value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
              label="City" required
            />
            <Input
              icon={Home} type="text" placeholder="e.g. 411001"
              value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })}
              label="Pincode" required
            />
          </div>

          <Input
            icon={Map} type="text" placeholder="e.g. Maharashtra"
            value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
            label="State" required
          />

          <div className="flex gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => setStep(1)} size="lg" className="px-6">Back</Button>
            <Button type="submit" loading={loading} fullWidth size="lg">Send OTP</Button>
          </div>
        </form>
      )}

      {otpSent && (
        <form onSubmit={handleVerify} className="space-y-4 animate-fade-in">
          <p className="text-sm text-slate-400 text-center mb-4">OTP sent to {form.contact}</p>
          <Input
            icon={LockKeyhole} type="text" placeholder="123456" maxLength={6}
            value={otp} onChange={(e) => setOtp(e.target.value)}
            label="Enter OTP" className="text-center tracking-widest font-mono text-lg"
          />
          <Button type="submit" loading={loading} fullWidth size="lg">Verify & Complete Registration</Button>
          <button type="button" onClick={() => { dispatch(resetOtpState()); setStep(1); }} className="w-full text-sm text-slate-400 hover:text-white mt-4">
            Change Details
          </button>
        </form>
      )}
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-950 py-12">
      <div className="absolute w-[500px] h-[500px] bg-green-600/20 rounded-full blur-[120px] top-1/4 -left-1/4 mix-blend-screen pointer-events-none"></div>
      <div className="absolute w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] bottom-1/4 right-1/4 mix-blend-screen pointer-events-none"></div>
      <Suspense fallback={<div>Loading form...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
