import React, { useState } from 'react';
import { X, Plus, PawPrint } from 'lucide-react';
import { Pet, ExpenseCategory, PriorityLevel, AppointmentCategory } from '../types';
import { CATEGORIES } from './ExpenseTrackerView';

interface AddModalProps {
  type: 'expense' | 'appointment' | 'weight' | 'vaccine' | 'pet' | null;
  onClose: () => void;
  onAddExpense: (data: any) => void;
  onAddAppointment: (data: any) => void;
  onAddWeight: (data: any) => void;
  onAddVaccine: (data: any) => void;
  onAddPet: (pet: Pet) => void;
  activePetId: string;
}

export const QuickAddModals: React.FC<AddModalProps> = ({
  type,
  onClose,
  onAddExpense,
  onAddAppointment,
  onAddWeight,
  onAddVaccine,
  onAddPet,
  activePetId,
}) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-scale-up">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'pet' && (
          <AddPetForm
            onSave={(pet) => {
              onAddPet(pet);
              onClose();
            }}
            onCancel={onClose}
          />
        )}

        {type === 'expense' && (
          <AddExpenseModalForm
            petId={activePetId}
            onSave={(data) => {
              onAddExpense(data);
              onClose();
            }}
          />
        )}

        {type === 'appointment' && (
          <AddAppointmentModalForm
            petId={activePetId}
            onSave={(data) => {
              onAddAppointment(data);
              onClose();
            }}
          />
        )}

        {type === 'weight' && (
          <AddWeightModalForm
            petId={activePetId}
            onSave={(data) => {
              onAddWeight(data);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
};

function AddPetForm({ onSave, onCancel }: { onSave: (p: Pet) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog' as Pet['species'],
    breed: '',
    gender: 'Female' as Pet['gender'],
    dob: '2024-01-01',
    weight: 10,
    weightUnit: 'kg' as Pet['weightUnit'],
    color: 'Brown & White',
    microchipId: '',
    adoptionDate: '2024-03-01',
    insuranceProvider: 'PetHealth Insurance',
    insuranceNumber: 'POL-10020',
    veterinarian: 'Dr. Smith',
    vetClinic: 'Central Animal Hospital',
    emergencyContact: '(555) 000-1111',
    allergies: 'None',
    medicalConditions: 'Healthy',
    specialInstructions: 'Regular dry food formulation',
    avatarUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave({
      id: `pet-${Date.now()}`,
      ...formData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-extrabold text-lg">
        <PawPrint className="w-5 h-5 text-amber-500" />
        <span>Add New Pet Profile</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-bold mb-1">Pet Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border font-bold"
          />
        </div>

        <div>
          <label className="block font-bold mb-1">Species</label>
          <select
            value={formData.species}
            onChange={(e) => setFormData({ ...formData, species: e.target.value as Pet['species'] })}
            className="w-full px-3 py-2 rounded-xl border font-bold cursor-pointer"
          >
            <option value="Dog">Dog 🐕</option>
            <option value="Cat">Cat 🐈</option>
            <option value="Rabbit">Rabbit 🐇</option>
            <option value="Bird">Bird 🦜</option>
            <option value="Other">Other 🐾</option>
          </select>
        </div>

        <div>
          <label className="block font-bold mb-1">Breed</label>
          <input
            type="text"
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border"
          />
        </div>

        <div>
          <label className="block font-bold mb-1">Date of Birth</label>
          <input
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold text-slate-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
        >
          Create Pet Profile
        </button>
      </div>
    </form>
  );
}

function AddExpenseModalForm({ petId, onSave }: { petId: string; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Food' as ExpenseCategory,
    description: '',
    amount: 0,
    paymentMethod: 'Credit Card',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || form.amount <= 0) return;
    onSave({ petId, ...form });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Expense</h3>

      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
              className="w-full px-3 py-2 rounded-xl border font-bold"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1">Description</label>
          <input
            type="text"
            required
            placeholder="Dry Food Bag, Grooming session..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border"
          />
        </div>

        <div>
          <label className="block font-bold mb-1">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            value={form.amount || ''}
            onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 rounded-xl border text-emerald-600 font-bold"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="submit"
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
        >
          Add Expense
        </button>
      </div>
    </form>
  );
}

function AddAppointmentModalForm({ petId, onSave }: { petId: string; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    task: '',
    category: 'Health' as AppointmentCategory,
    priority: 'Medium' as PriorityLevel,
    completed: false,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.task) return;
    onSave({ petId, ...form });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Care Visit / Task</h3>

      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as PriorityLevel })}
              className="w-full px-3 py-2 rounded-xl border font-bold"
            >
              <option value="High">High 🔴</option>
              <option value="Medium">Medium 🟠</option>
              <option value="Low">Low 🟢</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1">Task Description</label>
          <input
            type="text"
            required
            placeholder="Annual checkup, Grooming appointment..."
            value={form.task}
            onChange={(e) => setForm({ ...form, task: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="submit"
          className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow"
        >
          Save Care Task
        </button>
      </div>
    </form>
  );
}

function AddWeightModalForm({ petId, onSave }: { petId: string; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: 26.0,
    unit: 'kg' as 'kg' | 'lbs',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.weight <= 0) return;
    onSave({ petId, ...form });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Weight Entry</h3>

      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Weight Value</label>
            <input
              type="number"
              step="0.1"
              required
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl border text-purple-600 font-bold"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="submit"
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow"
        >
          Record Weight
        </button>
      </div>
    </form>
  );
}
