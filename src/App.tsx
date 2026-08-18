import React, { useState } from 'react';
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

export default function App() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showFormulas, setShowFormulas] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<
    'expense' | 'appointment' | 'weight' | 'vaccine' | 'pet' | null
  >(null);

  // Data Store State
  const [pets, setPets] = useState<Pet[]>(INITIAL_PETS);
  const [activePetId, setActivePetId] = useState<string>('pet-bella');

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(INITIAL_HEALTH_RECORDS);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>(INITIAL_VACCINATIONS);
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [budgets, setBudgets] = useState<BudgetItem[]>(INITIAL_BUDGETS);
  const [weights, setWeights] = useState<WeightRecord[]>(INITIAL_WEIGHT_RECORDS);
  const [feedings, setFeedings] = useState<FeedingRecord[]>(INITIAL_FEEDING_RECORDS);
  const [groomings, setGroomings] = useState<GroomingRecord[]>(INITIAL_GROOMING_RECORDS);
  const [appointments, setAppointments] = useState<AppointmentTask[]>(INITIAL_APPOINTMENTS);

  // Current selected pet
  const currentPet = pets.find((p) => p.id === activePetId) || pets[0];

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

  const handleAddExpense = (exp: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      ...exp,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleAddHealthRecord = (rec: Omit<HealthRecord, 'id'>) => {
    const newRec: HealthRecord = {
      id: `health-${Date.now()}`,
      ...rec,
    };
    setHealthRecords((prev) => [newRec, ...prev]);
  };

  const handleAddVaccination = (vac: Omit<Vaccination, 'id'>) => {
    const newVac: Vaccination = {
      id: `vac-${Date.now()}`,
      ...vac,
    };
    setVaccinations((prev) => [newVac, ...prev]);
  };

  const handleAddMedication = (med: Omit<Medication, 'id'>) => {
    const newMed: Medication = {
      id: `med-${Date.now()}`,
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
      id: `weight-${Date.now()}`,
      ...rec,
    };
    setWeights((prev) => [...prev, newW]);
  };

  const handleAddFeeding = (f: Omit<FeedingRecord, 'id'>) => {
    const newF: FeedingRecord = {
      id: `feed-${Date.now()}`,
      ...f,
    };
    setFeedings((prev) => [newF, ...prev]);
  };

  const handleAddGrooming = (g: Omit<GroomingRecord, 'id'>) => {
    const newG: GroomingRecord = {
      id: `grm-${Date.now()}`,
      ...g,
    };
    setGroomings((prev) => [newG, ...prev]);
  };

  const handleAddAppointment = (apt: Omit<AppointmentTask, 'id'>) => {
    const newApt: AppointmentTask = {
      id: `apt-${Date.now()}`,
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
        activePetId={activePetId}
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 transition-all duration-300">
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
            showFormulas={showFormulas}
            onUpdatePet={handleUpdatePet}
          />
        )}

        {activeTab === 'health' && (
          <HealthRecordsView
            healthRecords={petHealth}
            showFormulas={showFormulas}
            onAddHealthRecord={handleAddHealthRecord}
            onDeleteHealthRecord={handleDeleteHealthRecord}
            onEditHealthRecord={handleEditHealthRecord}
          />
        )}

        {activeTab === 'vaccinations' && (
          <VaccinationTrackerView
            vaccinations={petVaccinations}
            showFormulas={showFormulas}
            onAddVaccination={handleAddVaccination}
            onDeleteVaccination={handleDeleteVaccination}
            onEditVaccination={handleEditVaccination}
          />
        )}

        {activeTab === 'medications' && (
          <MedicationTrackerView
            medications={petMedications}
            showFormulas={showFormulas}
            onAddMedication={handleAddMedication}
            onDeleteMedication={handleDeleteMedication}
            onEditMedication={handleEditMedication}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTrackerView
            expenses={petExpenses}
            showFormulas={showFormulas}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={handleEditExpense}
          />
        )}

        {activeTab === 'budget' && (
          <PetBudgetView
            budgets={budgets}
            expenses={petExpenses}
            showFormulas={showFormulas}
            onUpdateBudget={handleUpdateBudget}
          />
        )}

        {activeTab === 'weight' && (
          <WeightTrackerView
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
            feedings={petFeedings}
            showFormulas={showFormulas}
            onAddFeeding={handleAddFeeding}
            onDeleteFeeding={handleDeleteFeeding}
            onEditFeeding={handleEditFeeding}
          />
        )}

        {activeTab === 'grooming' && (
          <GroomingTrackerView
            groomings={petGroomings}
            showFormulas={showFormulas}
            onAddGrooming={handleAddGrooming}
            onDeleteGrooming={handleDeleteGrooming}
            onEditGrooming={handleEditGrooming}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsView
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
