'use client';
import { useState } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';

// Cloudinary direct upload utility for components without Redux action
export const uploadToCloudinary = async (file) => {
  const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'krishisetu_frontend'); // Ensure you make a preset!
  const res = await fetch(url, { method: 'POST', body: formData });
  const data = await res.json();
  return data.secure_url;
};

export default function ImageUpload({ value = [], onChange, maxImages = 5 }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setUploading(true);
    try {
      const newImages = files.map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      onChange([...value, ...newImages].slice(0, maxImages));
    } catch (error) {
       console.error("Upload error details", error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newVals = [...value];
    newVals.splice(index, 1);
    onChange(newVals);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {value.map((image, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 group">
             {/* Using standard img for blob urls to avoid Next Image config issues for arbitrary blobs */}
             <img src={image.url || image} alt={`preview ${i}`} className="w-full h-full object-cover" />
             <button 
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-500 rounded-lg backdrop-blur text-white opacity-0 group-hover:opacity-100 transition-all"
             >
               <X size={16} />
             </button>
          </div>
        ))}
        {value.length < maxImages && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 hover:border-green-500 flex flex-col items-center justify-center cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors">
             <UploadCloud className="text-slate-400 mb-2" size={24} />
             <span className="text-sm font-medium text-slate-300">Upload Image</span>
             <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} disabled={uploading} />
          </label>
        )}
      </div>
    </div>
  );
}
