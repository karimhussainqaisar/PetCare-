import React, { useState } from 'react';
import { Pet, PetSpecies } from '../types';
import { calculatePetAge } from '../utils/petCalculations';
import { FormulaTooltip } from './FormulaTooltip';
import { Save, User, Shield, Stethoscope, AlertCircle, Camera, Check, Plus, PawPrint, Trash2 } from 'lucide-react';

interface PetProfileViewProps {
  pet: Pet;
  pets?: Pet[];
  showFormulas: boolean;
  onUpdatePet: (updatedPet: Pet) => void;
  onSelectPet?: (petId: string) => void;
  onAddPetModal?: () => void;
  onDeletePet?: (petId: string) => void;
}

export const PetProfileView: React.FC<PetProfileViewProps> = ({
  pet,
  pets = [],
  showFormulas,
  onUpdatePet,
  onSelectPet,
  onAddPetModal,
  onDeletePet,
}) => {
  const [formData, setFormData] = useState<Pet>({ ...pet });
  const [isSaved, setIsSaved] = useState(false);

  // Sync if active pet changes
  React.useEffect(() => {
    setFormData({ ...pet });
  }, [pet]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'weight' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePet(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDeleteCurrentPet = () => {
    if (pets.length <= 1) {
      alert('You must have at least one pet profile.');
      return;
    }
    onDeletePet?.(pet.id);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Pet Profiles Switcher Bar */}
      {pets.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <PawPrint className="w-4 h-4 text-emerald-600" />
              <span>Pet Profiles:</span>
            </span>
            {pets.map((p) => {
              const isSelected = p.id === pet.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPet?.(p.id)}
                  type="button"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <img
                    src={p.avatarUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80'}
                    alt={p.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>{p.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-700/80 text-emerald-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                    {p.species}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {onAddPetModal && (
              <button
                type="button"
                onClick={onAddPetModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Pet</span>
              </button>
            )}

            {pets.length > 1 && onDeletePet && (
              <button
                type="button"
                onClick={handleDeleteCurrentPet}
                className="flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900/50 transition cursor-pointer"
                title="Delete this pet profile"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete Profile</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Title & Legend Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold font-mono">
              SHEET: PET PROFILE
            </span>
            <span className="text-xs text-slate-400">• Excel Form Fields</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Dedicated Pet Profile & Identification Card
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain official records, insurance info, microchip tags, and medical details.
          </p>
        </div>

        {/* Input Cell Color Legend - Exact Etsy Excel Product Feature */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
          <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wide">
            Excel Input Cell Guide:
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300">Green = Type text</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300">Blue = Dropdown</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              <span className="text-slate-600 dark:text-slate-300">Gray = Auto-calc</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Header Section */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <img
              src={formData.avatarUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80'}
              alt={formData.name}
              className="w-28 h-28 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md"
            />
            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex-1 space-y-3 w-full">
            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Photo Image URL
              </label>
              <input
                type="text"
                name="avatarUrl"
                value={formData.avatarUrl || ''}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  Pet Name (Required)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sky-700 dark:text-sky-400 mb-1">
                  Species (Dropdown)
                </label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-sky-50/50 dark:bg-slate-800 border border-sky-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="Dog">Dog 🐕</option>
                  <option value="Cat">Cat 🐈</option>
                  <option value="Rabbit">Rabbit 🐇</option>
                  <option value="Bird">Bird 🦜</option>
                  <option value="Other">Other 🐾</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Pet Identification */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Basic Biological & Identity Records</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Breed
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-sky-700 dark:text-sky-400 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-sky-50/50 dark:bg-slate-800 border border-sky-300 dark:border-slate-700 text-sm font-medium"
              >
                <option value="Female">Female ♀</option>
                <option value="Male">Male ♂</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Date of Birth (DOB)
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Calculated Age (Auto)
              </label>
              <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-200">
                {calculatePetAge(formData.dob)}
              </div>
              <FormulaTooltip
                formula='=DATEDIF(DOB, TODAY(), "Y") & " yrs "'
                showAlways={showFormulas}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Weight
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-medium"
                />
                <select
                  name="weightUnit"
                  value={formData.weightUnit}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-xl bg-sky-50/50 dark:bg-slate-800 border border-sky-300 dark:border-slate-700 text-xs font-bold"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Color / Markings
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Microchip ID
              </label>
              <input
                type="text"
                name="microchipId"
                value={formData.microchipId}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Adoption Date
              </label>
              <input
                type="date"
                name="adoptionDate"
                value={formData.adoptionDate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Vet & Insurance Information */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Shield className="w-4 h-4 text-sky-600" />
            <span>Veterinary Clinic & Insurance Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Primary Veterinarian
              </label>
              <input
                type="text"
                name="veterinarian"
                value={formData.veterinarian}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Vet Clinic Name
              </label>
              <input
                type="text"
                name="vetClinic"
                value={formData.vetClinic}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Emergency 24/7 Hotline
              </label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Insurance Provider
              </label>
              <input
                type="text"
                name="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Insurance Policy Number
              </label>
              <input
                type="text"
                name="insuranceNumber"
                value={formData.insuranceNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Medical Conditions & Instructions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>Allergies, Medical Conditions & Special Care</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Known Allergies
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Medical Conditions
              </label>
              <textarea
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Special Care & Feeding Instructions
              </label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end space-x-3">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fade-in">
              <Check className="w-4 h-4" />
              <span>Pet Profile Saved Successfully!</span>
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Pet Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
