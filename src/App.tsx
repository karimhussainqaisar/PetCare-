import React, { useState, useEffect } from 'react';
import {
  INITIAL_PETS,
  INITIAL_HEALTH_RECORDS,
  INITIAL_VACCINATIONS,
  INITIAL_MEDICATIONS,
  INITIAL_EXPENSES,
  INITIAL_BUDGETS,
  INITIAL_WEIGHT_RECORDS,
  INITIAL_FEEDING_RECORDS,
  INITIAL_GROOMING_RECORDS,
  INITIAL_APPOINTMENTS,
} from './data/initialData';

import {
  Pet,
  HealthRecord,
  Vaccination,
  Medication,
  Expense,
  BudgetItem,
  WeightRecord,
  FeedingRecord,
  GroomingRecord,
  AppointmentTask,
  ExpenseCategory,
} from './types';

import { generatePetTrackerExcel } from './utils/petCalculations';

import { ExcelHeaderBar } from './components/ExcelHeaderBar';
import { DashboardView } from './components/DashboardView';
import { PetProfileView } from './components/PetProfileView';
import { HealthRecordsView } from './components/HealthRecordsView';
import { VaccinationTrackerView } from './components/VaccinationTrackerView';
import { MedicationTrackerView } from './components/MedicationTrackerView';
import { ExpenseTrackerView } from './components/ExpenseTrackerView';
import { PetBudgetView } from './components/PetBudgetView';
import { WeightTrackerView } from './components/WeightTrackerView';
import { FeedingTrackerView } from './components/FeedingTrackerView';
import { GroomingTrackerView } from './components/GroomingTrackerView';
import { AppointmentsView } from './components/AppointmentsView';
import { AnalyticsView } from './components/AnalyticsView';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { QuickAddModals } from './components/Modals';

const STORAGE_PREFIX = 'pet_tracker_v2_';

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Failed to load ${key} from storage:`, err);
  }
  return fallback;
}

export default function App() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showFormulas, setShowFormulas] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<
    'expense' | 'appointment' | 'weight' | 'vaccine' | 'pet' | null
  >(null);

  // Data Store State with LocalStorage initialization
  const [pets, setPets] = useState<Pet[]>(() => loadStored('pets', INITIAL_PETS));
  const [activePetId, setActivePetId] = useState<string>(() => {
    const storedId = loadStored<string>('active_pet_id', 'pet-bella');
    return storedId;
  });

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() =>
    loadStored('health_records', INITIAL_HEALTH_RECORDS)
  );
  const [vaccinations, setVaccinations] = useState<Vaccination[]>(() =>
    loadStored('vaccinations', INITIAL_VACCINATIONS)
  );
  const [medications, setMedications] = useState<Medication[]>(() =>
    loadStored('medications', INITIAL_MEDICATIONS)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadStored('expenses', INITIAL_EXPENSES)
  );
  const [budgets, setBudgets] = useState<BudgetItem[]>(() =>
    loadStored('budgets', INITIAL_BUDGETS)
  );
  const [weights, setWeights] = useState<WeightRecord[]>(() =>
    loadStored('weights', INITIAL_WEIGHT_RECORDS)
  );
  const [feedings, setFeedings] = useState<FeedingRecord[]>(() =>
    loadStored('feedings', INITIAL_FEEDING_RECORDS)
  );
  const [groomings, setGroomings] = useState<GroomingRecord[]>(() =>
    loadStored('groomings', INITIAL_GROOMING_RECORDS)
  );
  const [appointments, setAppointments] = useState<AppointmentTask[]>(() =>
    loadStored('appointments', INITIAL_APPOINTMENTS)
  );

  // Synchronize state changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'pets', JSON.stringify(pets));
      localStorage.setItem(STORAGE_PREFIX + 'active_pet_id', JSON.stringify(activePetId));
      localStorage.setItem(STORAGE_PREFIX + 'health_records', JSON.stringify(healthRecords));
      localStorage.setItem(STORAGE_PREFIX + 'vaccinations', JSON.stringify(vaccinations));
      localStorage.setItem(STORAGE_PREFIX + 'medications', JSON.stringify(medications));
      localStorage.setItem(STORAGE_PREFIX + 'expenses', JSON.stringify(expenses));
      localStorage.setItem(STORAGE_PREFIX + 'budgets', JSON.stringify(budgets));
      localStorage.setItem(STORAGE_PREFIX + 'weights', JSON.stringify(weights));
      localStorage.setItem(STORAGE_PREFIX + 'feedings', JSON.stringify(feedings));
      localStorage.setItem(STORAGE_PREFIX + 'groomings', JSON.stringify(groomings));
      localStorage.setItem(STORAGE_PREFIX + 'appointments', JSON.stringify(appointments));
    } catch (err) {
      console.error('Failed to save data to localStorage:', err);
    }
  }, [
    pets,
    activePetId,
    healthRecords,
    vaccinations,
    medications,
    expenses,
    budgets,
    weights,
    feedings,
    groomings,
    appointments,
  ]);

  // Current selected pet (with safe fallback)
  const currentPet = pets.find((p) => p.id === activePetId) || pets[0] || INITIAL_PETS[0];

  // If activePetId is invalid, rectify it
  useEffect(() => {
    if (!pets.some((p) => p.id === activePetId) && pets.length > 0) {
      setActivePetId(pets[0].id);
    }
  }, [pets, activePetId]);

  // Filter datasets per selected pet
  const petHealth = healthRecords.filter((h) => h.petId === currentPet.id);
  const petVaccinations = vaccinations.filter((v) => v.petId === currentPet.id);
  const petMedications = medications.filter((m) => m.petId === currentPet.id);
  const petExpenses = expenses.filter((e) => e.petId === currentPet.id);
  const petWeights = weights.filter((w) => w.petId === currentPet.id);
  const petFeedings = feedings.filter((f) => f.petId === currentPet.id);
  const petGroomings = groomings.filter((g) => g.petId === currentPet.id);
  const petAppointments = appointments.filter((a) => a.petId === currentPet.id);

  // Handlers
  const handleUpdatePet = (updatedPet: Pet) => {
    setPets((prev) => prev.map((p) => (p.id === updatedPet.id ? updatedPet : p)));
  };

  const handleAddPet = (newPet: Pet) => {
    setPets((prev) => [...prev, newPet]);
    setActivePetId(newPet.id);
  };

  const handleDeletePet = (petIdToDelete: string) => {
    if (pets.length <= 1) return;
    const remaining = pets.filter((p) => p.id !== petIdToDelete);
    setPets(remaining);
    if (activePetId === petIdToDelete) {
      setActivePetId(remaining[0].id);
    }
  };

  const handleAddExpense = (exp: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      petId: exp.petId || currentPet.id,
      ...exp,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleAddHealthRecord = (rec: Omit<HealthRecord, 'id'>) => {
    const newRec: HealthRecord = {
      id: `health-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      petId: rec.petId || currentPet.id,
      ...rec,
    };
    setHealthRecords((prev) => [newRec, ...prev]);
  };

  const handleAddVaccination = (vac: Omit<Vaccination, 'id'>) => {
    const newVac: Vaccination = {
      id: `vac-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      petId: vac.petId || currentPet.id,
      ...vac,
    };
    setVaccinations((prev) => [newVac, ...prev]);
  };

  const handleAddMedication = (med: Omit<Medication, 'id'>) => {
    const newMed: Medication = {
      id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      petId: med.petId || currentPet.id,
      ...med,
    };
    setMedications((prev) => [newMed, ...prev]);
  };

  const handleUpdateBudget = (category: ExpenseCategory, monthlyBudget: number) => {
    setBudgets((prev) => {
      const exists = prev.find((b) => b.category === category);
      if (exists) {
        return prev.map((b) => (b.category === category ? { ...b, monthlyBudget } : b));
      } else {
        return [...prev, { category, monthlyBudget }];
      }
    });
  };

  const handleAddWeight = (rec: Omit<WeightRecord, 'id'>) => {
    const newW: WeightRecord = {
      id: `weight-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      petId: rec.petId || currentPet.id,
      ...rec,
    };
    setWeights((prev) => [...prev, newW]);
  };

  const handleAddFeeding = (f: Omit<FeedingRecord, 'id'>) => {
    const newF: FeedingRecord = {
      id: `feed-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      petId: f.petId || currentPet.id,
      ...f,
    };
    setFeedings((prev) => [newF, ...prev]);
  };

  const handleAddGrooming = (g: Omit<GroomingRecord, 'id'>) => {
    const newG: GroomingRecord = {
      id: `grm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      petId: g.petId || currentPet.id,
      ...g,
    };
    setGroomings((prev) => [newG, ...prev]);
  };

  const handleAddAppointment = (apt: Omit<AppointmentTask, 'id'>) => {
    const newApt: AppointmentTask = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      petId: apt.petId || currentPet.id,
      ...apt,
    };
    setAppointments((prev) => [newApt, ...prev]);
  };

  const handleToggleAppointmentComplete = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  // Edit & Delete Handlers
  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };
  const handleEditExpense = (updated: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const handleDeleteHealthRecord = (id: string) => {
    setHealthRecords((prev) => prev.filter((h) => h.id !== id));
  };
  const handleEditHealthRecord = (updated: HealthRecord) => {
    setHealthRecords((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  };

  const handleDeleteVaccination = (id: string) => {
    setVaccinations((prev) => prev.filter((v) => v.id !== id));
  };
  const handleEditVaccination = (updated: Vaccination) => {
    setVaccinations((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleDeleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };
  const handleEditMedication = (updated: Medication) => {
    setMedications((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleDeleteWeight = (id: string) => {
    setWeights((prev) => prev.filter((w) => w.id !== id));
  };
  const handleEditWeight = (updated: WeightRecord) => {
    setWeights((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const handleDeleteFeeding = (id: string) => {
    setFeedings((prev) => prev.filter((f) => f.id !== id));
  };
  const handleEditFeeding = (updated: FeedingRecord) => {
    setFeedings((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const handleDeleteGrooming = (id: string) => {
    setGroomings((prev) => prev.filter((g) => g.id !== id));
  };
  const handleEditGrooming = (updated: GroomingRecord) => {
    setGroomings((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };
  const handleEditAppointment = (updated: AppointmentTask) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleExportExcel = () => {
    generatePetTrackerExcel(
      currentPet,
      petHealth,
      petVaccinations,
      petMedications,
      petExpenses,
      budgets,
      petWeights,
      petFeedings,
      petGroomings,
      petAppointments
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-800 flex flex-col font-sans">
      {/* 1. Top Navigation Bar */}
      <ExcelHeaderBar
        pets={pets}
        activePetId={currentPet.id}
        onSelectPet={setActivePetId}
        onOpenAddPetModal={() => setQuickAddType('pet')}
        activeTab={activeTab as any}
        onSelectTab={setActiveTab as any}
        showFormulas={showFormulas}
        onToggleFormulas={() => setShowFormulas(!showFormulas)}
        onExportExcel={handleExportExcel}
        onOpenGoogleSheetsModal={() => setIsGoogleModalOpen(true)}
      />

      {/* 2. Main Sheet Canvas Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 md:p-8 transition-all duration-300">
        {activeTab === 'dashboard' && (
          <DashboardView
            pet={currentPet}
            healthRecords={petHealth}
            vaccinations={petVaccinations}
            medications={petMedications}
            expenses={petExpenses}
            weights={petWeights}
            groomings={petGroomings}
            appointments={petAppointments}
            showFormulas={showFormulas}
            onNavigateTab={setActiveTab as any}
            onOpenAddModal={(type) => setQuickAddType(type)}
            onToggleTaskComplete={handleToggleAppointmentComplete}
          />
        )}

        {activeTab === 'profile' && (
          <PetProfileView
            pet={currentPet}
            pets={pets}
            showFormulas={showFormulas}
            onUpdatePet={handleUpdatePet}
            onSelectPet={setActivePetId}
            onAddPetModal={() => setQuickAddType('pet')}
            onDeletePet={handleDeletePet}
          />
        )}

        {activeTab === 'health' && (
          <HealthRecordsView
            petId={currentPet.id}
            healthRecords={petHealth}
            showFormulas={showFormulas}
            onAddHealthRecord={handleAddHealthRecord}
            onDeleteHealthRecord={handleDeleteHealthRecord}
            onEditHealthRecord={handleEditHealthRecord}
          />
        )}

        {activeTab === 'vaccinations' && (
          <VaccinationTrackerView
            petId={currentPet.id}
            vaccinations={petVaccinations}
            showFormulas={showFormulas}
            onAddVaccination={handleAddVaccination}
            onDeleteVaccination={handleDeleteVaccination}
            onEditVaccination={handleEditVaccination}
          />
        )}

        {activeTab === 'medications' && (
          <MedicationTrackerView
            petId={currentPet.id}
            medications={petMedications}
            showFormulas={showFormulas}
            onAddMedication={handleAddMedication}
            onDeleteMedication={handleDeleteMedication}
            onEditMedication={handleEditMedication}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTrackerView
            petId={currentPet.id}
            expenses={petExpenses}
            vaccinations={petVaccinations}
            medications={petMedications}
            healthRecords={petHealth}
            showFormulas={showFormulas}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={handleEditExpense}
          />
        )}

        {activeTab === 'budget' && (
          <PetBudgetView
            petId={currentPet.id}
            budgets={budgets}
            expenses={petExpenses}
            vaccinations={petVaccinations}
            medications={petMedications}
            healthRecords={petHealth}
            showFormulas={showFormulas}
            onUpdateBudget={handleUpdateBudget}
          />
        )}

        {activeTab === 'weight' && (
          <WeightTrackerView
            petId={currentPet.id}
            weights={petWeights}
            weightUnit={currentPet.weightUnit}
            showFormulas={showFormulas}
            onAddWeight={handleAddWeight}
            onDeleteWeight={handleDeleteWeight}
            onEditWeight={handleEditWeight}
          />
        )}

        {activeTab === 'feeding' && (
          <FeedingTrackerView
            petId={currentPet.id}
            feedings={petFeedings}
            showFormulas={showFormulas}
            onAddFeeding={handleAddFeeding}
            onDeleteFeeding={handleDeleteFeeding}
            onEditFeeding={handleEditFeeding}
          />
        )}

        {activeTab === 'grooming' && (
          <GroomingTrackerView
            petId={currentPet.id}
            groomings={petGroomings}
            showFormulas={showFormulas}
            onAddGrooming={handleAddGrooming}
            onDeleteGrooming={handleDeleteGrooming}
            onEditGrooming={handleEditGrooming}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsView
            petId={currentPet.id}
            appointments={petAppointments}
            showFormulas={showFormulas}
            onAddAppointment={handleAddAppointment}
            onToggleComplete={handleToggleAppointmentComplete}
            onDeleteAppointment={handleDeleteAppointment}
            onEditAppointment={handleEditAppointment}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            pet={currentPet}
            healthRecords={petHealth}
            vaccinations={petVaccinations}
            medications={petMedications}
            expenses={petExpenses}
            budgets={budgets}
            weights={petWeights}
            feedings={petFeedings}
            groomings={petGroomings}
            appointments={petAppointments}
            onExportExcel={handleExportExcel}
            onOpenGoogleSheetsModal={() => setIsGoogleModalOpen(true)}
          />
        )}

        <footer className="mt-8 py-4 border-t border-gray-200 flex flex-wrap justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">
          <div>Excel Automation Active</div>
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Database Connected</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Sheets Protected</span>
          </div>
        </footer>
      </main>

      {/* 3. Modals */}
      <GoogleSheetsModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        pet={currentPet}
        expenses={petExpenses}
        healthRecords={petHealth}
        vaccinations={petVaccinations}
        medications={petMedications}
        budgets={budgets}
        weights={petWeights}
        groomings={petGroomings}
        appointments={petAppointments}
        onExportExcel={handleExportExcel}
      />

      <QuickAddModals
        type={quickAddType}
        onClose={() => setQuickAddType(null)}
        onAddExpense={handleAddExpense}
        onAddAppointment={handleAddAppointment}
        onAddWeight={handleAddWeight}
        onAddVaccine={handleAddVaccination}
        onAddPet={handleAddPet}
        activePetId={currentPet.id}
      />
    </div>
  );
}
