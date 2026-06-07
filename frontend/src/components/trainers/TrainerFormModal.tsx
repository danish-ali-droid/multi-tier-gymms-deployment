import { useState, useEffect, FormEvent, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, UserCheck } from 'lucide-react';
import Modal from '../ui/Modal';
import { trainersApi } from '../../api/trainers';
import type { Trainer } from '../../types';
import axios from 'axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trainer: Trainer | null;
}

const defaultForm = {
  name: '',
  email: '',
  password: '',
  specialization: '',
  experience_years: '1',
  bio: '',
  certifications: '',
  hourly_rate: '',
  is_available: 'true',
};

export default function TrainerFormModal({ isOpen, onClose, trainer }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const isEditing = !!trainer;

  useEffect(() => {
    if (trainer) {
      setForm({
        name: trainer.user?.name || '',
        email: trainer.user?.email || '',
        password: '',
        specialization: (trainer.specialization || []).join(', '),
        experience_years: String(trainer.experience_years),
        bio: trainer.bio || '',
        certifications: (trainer.certifications || []).join(', '),
        hourly_rate: trainer.hourly_rate ? String(trainer.hourly_rate) : '',
        is_available: String(trainer.is_available),
      });
      setImagePreview(trainer.user?.profile_image_url || null);
    } else {
      setForm(defaultForm);
      setImagePreview(null);
    }
    setImageFile(null);
    setError('');
  }, [trainer, isOpen]);

  const mutation = useMutation({
    mutationFn: (fd: FormData) =>
      isEditing ? trainersApi.update(trainer!.id, fd) : trainersApi.create(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainers'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
    onError: (err) => {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || 'Request failed.' : 'Unexpected error.');
    },
  });

  const handleImage = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (imageFile) fd.append('profile_image', imageFile);
    mutation.mutate(fd);
  };

  const f = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Trainer' : 'Add New Trainer'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-600/10 border border-red-600/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-2xl bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-brand-500 transition-colors flex-shrink-0"
            onClick={() => fileRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <UserCheck size={28} className="text-gray-600" />
            )}
          </div>
          <div>
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-sm flex items-center gap-2">
              <Upload size={14} /> Upload Photo
            </button>
            <p className="text-xs text-gray-500 mt-1.5">JPEG, PNG, WebP — max 5MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImage(e.target.files[0]); }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input required className="input" placeholder="Marcus Rivera" value={form.name} onChange={(e) => f('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Email Address *</label>
            <input required type="email" className="input" placeholder="marcus@gym.com" value={form.email} onChange={(e) => f('email', e.target.value)} />
          </div>
          {!isEditing && (
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min. 8 characters" value={form.password} onChange={(e) => f('password', e.target.value)} />
            </div>
          )}
          <div>
            <label className="label">Experience (years) *</label>
            <input required type="number" min="0" max="60" className="input" value={form.experience_years} onChange={(e) => f('experience_years', e.target.value)} />
          </div>
          <div>
            <label className="label">Hourly Rate ($)</label>
            <input type="number" min="0" step="0.01" className="input" placeholder="75.00" value={form.hourly_rate} onChange={(e) => f('hourly_rate', e.target.value)} />
          </div>
          <div>
            <label className="label">Availability</label>
            <select className="input" value={form.is_available} onChange={(e) => f('is_available', e.target.value)}>
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Specializations (comma-separated)</label>
          <input className="input" placeholder="Strength Training, HIIT, Nutrition" value={form.specialization} onChange={(e) => f('specialization', e.target.value)} />
        </div>

        <div>
          <label className="label">Certifications (comma-separated)</label>
          <input className="input" placeholder="ACE CPT, NSCA-CSCS" value={form.certifications} onChange={(e) => f('certifications', e.target.value)} />
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea className="input resize-none" rows={3} placeholder="Short trainer biography..." value={form.bio} onChange={(e) => f('bio', e.target.value)} />
        </div>

        <div className="flex gap-3 justify-end pt-2 border-t border-gray-800">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Trainer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
