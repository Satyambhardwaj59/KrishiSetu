'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser, verifyRegistration, clearError, resetOtpState } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { Phone, LockKeyhole, Leaf, User } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');

  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, otpSent, error, isAuthenticated, mockOtp } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (mockOtp && otpSent) {
      toast.success(`Mock OTP: ${mockOtp}`, { duration: 6000 });
      setOtp(mockOtp);
    }
  }, [error, mockOtp, otpSent, dispatch]);

  const isEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contact.trim()) return toast.error('Enter valid email or phone');
    if (!password.trim() || password.length < 6) return toast.error('Password must be at least 6 characters');

    const payload = isEmail(contact) ? { email: contact, password } : { phone: contact, password };

    if (isLogin) {
      dispatch(loginUser(payload));
    } else {
      if (!name.trim()) return toast.error('Name is required');
      dispatch(registerUser({ ...payload, name }));
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error('Enter 6 digit OTP');
    const payload = isEmail(contact) ? { email: contact, otp } : { phone: contact, otp };
    dispatch(verifyRegistration(payload));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    dispatch(resetOtpState());
    setOtp('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-950">
      <div className="absolute w-[500px] h-[500px] bg-green-600/20 rounded-full blur-[120px] top-1/4 left-1/4 mix-blend-screen pointer-events-none"></div>
      <div className="absolute w-[400px] h-[400px] bg-amber-600/20 rounded-full blur-[100px] bottom-1/4 right-1/4 mix-blend-screen pointer-events-none"></div>

      <Card glass className="w-full max-w-md relative z-10 p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-slate-800 rounded-2xl mb-4 shadow-inner">
            <Leaf className="text-green-500 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{isLogin ? 'Login' : 'Sign Up'}</h1>
          <p className="text-slate-400">
            {isLogin ? 'Welcome back to KrishiSetu' : 'Join KrishiSetu today'}
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                icon={User}
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="Full Name"
              />
            )}
            <Input
              icon={Phone}
              type="text"
              placeholder="Email or Phone Number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              label="Email or Phone"
            />
            <Input
              icon={LockKeyhole}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
            />

            <Button type="submit" loading={loading} fullWidth size="lg">
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>

            <button
              type="button"
              onClick={toggleMode}
              className="w-full text-sm text-green-400 hover:text-green-300 mt-4 font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4 animate-fade-in">
            <p className="text-sm text-slate-400 text-center mb-4">OTP sent to {contact}</p>
            <Input
              icon={LockKeyhole}
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              label="Enter OTP"
              className="text-center tracking-widest font-mono text-lg"
            />
            <Button type="submit" loading={loading} fullWidth size="lg">
              Verify & Complete Registration
            </Button>
            <button
              type="button"
              onClick={() => dispatch(resetOtpState())}
              className="w-full text-sm text-slate-400 hover:text-white mt-4"
            >
              Go Back
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
