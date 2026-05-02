'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestPasswordReset, resetPassword, clearError, resetOtpState } from '@/store/slices/authSlice';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { User, Phone, Mail, MapPin, Shield, LockKeyhole } from 'lucide-react';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading, error, otpSent, mockOtp } = useSelector((state) => state.auth);

  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');

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

  const handleRequestReset = () => {
    if (!user?.phone && !user?.email) return toast.error('No contact method found');
    dispatch(requestPasswordReset(user.phone ? { phone: user.phone } : { email: user.email }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error('Enter a valid 6-digit OTP');
    if (!newPassword || newPassword.length < 6) return toast.error('Password must be at least 6 characters');

    const payload = user.phone ? { phone: user.phone, otp, newPassword } : { email: user.email, otp, newPassword };
    const res = await dispatch(resetPassword(payload));

    if (!res.error) {
      toast.success('Password changed successfully');
      setNewPassword('');
      setOtp('');
    }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen pt-24 px-6 max-w-4xl mx-auto pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account details and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="text-blue-400" /> Account Details
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400">Full Name</p>
              <p className="text-white font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Role</p>
              <p className="text-white font-medium capitalize">{user.role}</p>
            </div>
            {user.phone && (
              <div>
                <p className="text-sm text-slate-400">Phone</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" /> {user.phone}
                </p>
              </div>
            )}
            {user.email && (
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" /> {user.email}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-400">KYC Status</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.kycStatus === 'verified' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                <Shield size={12} /> {user.kycStatus}
              </span>
            </div>
          </div>
        </Card>

        <Card className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <LockKeyhole className="text-amber-400" /> Security
          </h2>
          <p className="text-sm text-slate-400">
            Reset your password by requesting an OTP to your registered {user.phone ? 'phone' : 'email'}.
          </p>

          {!otpSent ? (
            <Button onClick={handleRequestReset} loading={loading} variant="outline" className="w-full justify-center">
              Request Password Reset
            </Button>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
              <Input
                icon={LockKeyhole}
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                label="Enter OTP"
              />
              <Input
                icon={LockKeyhole}
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                label="New Password"
              />
              <div className="flex gap-3">
                <Button type="submit" loading={loading} className="flex-1">
                  Save Password
                </Button>
                <Button type="button" variant="outline" onClick={() => dispatch(resetOtpState())}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
