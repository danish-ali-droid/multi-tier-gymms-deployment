import { useState, useEffect, FormEvent, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, User } from 'lucide-react';
import Modal from '../ui/Modal';
import { membersApi } from '../../api/members';
import type { Member } from '../../types';
import axios from 'axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

const defaultForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  membership_type: 'basic',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  status: 'active',
  health_notes: '',
};

export default function MemberFormModal({ isOpen, onClose, member }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const isEditing = !!member;

  useEffect(() => {
    if (member) {
      setForm({
        name: member.user?.name || '',
        email: member.user?.email || '',
        password: '',
        phone: member.phone || '',
        membership_type: member.membership_type,
        start_date: member.start_date.slice(0, 10),
        end_date: member.end_date.slice(0, 10),
        status: member.status,
        health_notes: member.health_notes || '',
      });
      setImagePreview(member.user?.profile_image_url || null);
    } else {
      setForm(defaultForm);
      setImagePreview(null);
    }
    setImageFile(null);
    setError('');
  }, [member, isOpen]);

  const mutation = useMutation({
    mutationFn: (fd: FormData) =>
      isEditing ? membersApi.update(member!.id, fd) : membersApi.create(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Request failed.');
      } else {
        setError('An unexpected error occurred.');
      }
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

  const f = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Member' : 'Add New Member'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-600/10 border border-red-600/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Avatar upload */}
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-2xl bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-brand-500 transition-colors flex-shrink-0"
            onClick={() => fileRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-gray-600" />
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
            <input required className="input" placeholder="John Doe" value={form.name} onChange={(e) => f('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Email Address *</label>
            <input required type="email" className="input" placeholder="john@example.com" value={form.email} onChange={(e) => f('email', e.target.value)} />
          </div>
          {!isEditing && (
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min. 8 characters" value={form.password} onChange={(e) => f('password', e.target.value)} />
            </div>
          )}
          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="+1-555-0000" value={form.phone} onChange={(e) => f('phone', e.target.value)} />
          </div>
          <div>
            <label className="label">Membership Plan *</label>
            <select required className="input" value={form.membership_type} onChange={(e) => f('membership_type', e.target.value)}>
              <option value="basic">Basic — $29.99/mo</option>
              <option value="standard">Standard — $59.99/mo</option>
              <option value="premium">Premium — $99.99/mo</option>
              <option value="vip">VIP — $149.99/mo</option>
            </select>
          </div>
          <div>
            <label className="label">Status *</label>
            <select required className="input" value={form.status} onChange={(e) => f('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div>
            <label className="label">Start Date *</label>
            <input required type="date" className="input" value={form.start_date} onChange={(e) => f('start_date', e.target.value)} />
          </div>
          <div>
            <label className="label">End Date *</label>
            <input required type="date" className="input" value={form.end_date} onChange={(e) => f('end_date', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Health Notes</label>
          <textarea className="input resize-none" rows={3} placeholder="Any injuries, allergies, or health conditions..." value={form.health_notes} onChange={(e) => f('health_notes', e.target.value)} />
        </div>

        <div className="flex gap-3 justify-end pt-2 border-t border-gray-800">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
