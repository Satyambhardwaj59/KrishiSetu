'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Landmark, FileText, Upload, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function KYCPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    idType: '',
    idNumber: '',
    bankAccount: '',
    bankIFSC: '',
    bankName: '',
    accountHolderName: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please upload an ID proof document');

    setLoading(true);
    try {
      const data = new FormData();
      data.append('document', file);
      Object.keys(formData).forEach(key => data.append(key, formData[key]));

      await api.post('/users/kyc', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('KYC Submitted Successfully!');
      setStep(3); // Show success state
    } catch (err) {
      toast.error(err.response?.data?.message || 'KYC Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.idType || !formData.idNumber)) {
      return toast.error('Please fill ID details');
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-slate-900 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl -z-10 animate-pulse delay-700" />

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Complete Your KYC</h1>
          <p className="text-slate-400">Verify your identity to unlock all premium marketplace features</p>
        </div>

        {/* Stepper */}
        {step < 3 && (
          <div className="flex items-center justify-center mb-12">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= i ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-800 text-slate-500'}`}>
                  {i}
                </div>
                {i === 1 && <div className={`w-20 h-1 transition-colors duration-300 ${step > 1 ? 'bg-blue-600' : 'bg-slate-800'}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="text-xl font-semibold text-white">Identity Verification</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Government ID Type</label>
                  <select 
                    name="idType"
                    value={formData.idType}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all"
                  >
                    <option value="">Select ID Type</option>
                    <option value="aadhar">Aadhar Card</option>
                    <option value="pan">PAN Card</option>
                    <option value="voter">Voter ID</option>
                    <option value="passport">Passport</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">ID Number</label>
                  <input 
                    type="text" 
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    placeholder="Enter unique identification number"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button 
                onClick={nextStep}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-4"
              >
                Continue to Bank Details <ChevronRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-600/20 rounded-lg text-green-400">
                  <Landmark size={24} />
                </div>
                <h2 className="text-xl font-semibold text-white">Bank Account Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Account Holder Name</label>
                  <input 
                    type="text" 
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:border-green-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Bank Name</label>
                  <input 
                    type="text" 
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:border-green-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">IFSC Code</label>
                  <input 
                    type="text" 
                    name="bankIFSC"
                    value={formData.bankIFSC}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:border-green-600 transition-all uppercase"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Account Number (Dummy)</label>
                  <input 
                    type="password" 
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:border-green-600 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                   <FileText size={16} /> Upload ID Document Proof (Front View)
                </label>
                <div className="relative group/upload h-40 border-2 border-dashed border-slate-700 rounded-2xl hover:border-blue-600/50 hover:bg-slate-900/30 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    accept="image/*"
                  />
                  {file ? (
                    <div className="text-center p-4">
                      <CheckCircle2 className="mx-auto mb-2 text-green-500" size={32} />
                      <p className="text-white font-medium truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-1">Click to change</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-3 text-slate-500 group-hover/upload:text-blue-500 group-hover/upload:scale-110 transition-all" size={32} />
                      <p className="text-slate-400 text-sm">Drag & drop or <span className="text-blue-400">browse</span></p>
                      <p className="text-slate-600 text-xs mt-1">PNG, JPG, PDF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={prevStep}
                  className="w-1/3 py-4 bg-slate-800 text-slate-300 rounded-xl font-bold border border-slate-700 hover:bg-slate-750 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? 'Submitting...' : 'Submit Records'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-10 animate-in zoom-in-95 duration-500">
               <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 size={48} className="text-green-500" />
               </div>
               <h2 className="text-2xl font-bold text-white mb-3">Verification Submitted!</h2>
               <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                 We've received your data. Our admin team will verify it within 24-48 hours. You'll receive a notification once verified.
               </p>
               <button 
                 onClick={() => router.push('/dashboard')}
                 className="px-8 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-all border border-slate-700"
               >
                 Back to Dashboard
               </button>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-slate-500 text-xs">
           <div className="flex items-center gap-1.5"><ShieldCheck size={14} /> 256-bit Encrypted</div>
           <div className="flex items-center gap-1.5"><ShieldCheck size={14} /> PCI-DSS Compliant</div>
           <div className="flex items-center gap-1.5"><ShieldCheck size={14} /> Secure Storage</div>
        </div>
      </div>
    </div>
  );
}
