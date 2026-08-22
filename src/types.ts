export type PetSpecies = 'Dog' | 'Cat' | 'Rabbit' | 'Bird' | 'Other';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  gender: 'Male' | 'Female';
  dob: string; // YYYY-MM-DD
  weight: number;
  weightUnit: 'kg' | 'lbs';
  color: string;
  microchipId: string;
  adoptionDate: string;
  insuranceProvider: string;
  insuranceNumber: string;
  veterinarian: string;
  vetClinic: string;
  emergencyContact: string;
  allergies: string;
  medicalConditions: string;
  specialInstructions: string;
  avatarUrl?: string;
}

export type HealthRecordType = 'Checkup' | 'Surgery' | 'Vaccination' | 'Dental' | 'Emergency' | 'Routine';

export interface HealthRecord {
  id: string;
  petId: string;
  date: string;
  type: HealthRecordType;
  description: string;
  vet: string;
  cost: number;
  followUpDate?: string;
  notes: string;
}

export interface Vaccination {
  id: string;
  petId: string;
  vaccine: string;
  dateGiven: string;
  nextDue: string;
  veterinarian: string;
  batchNumber: string;
  cost: number;
  notes: string;
}

export interface Medication {
  id: string;
  petId: string;
  medication: string;
  dose: string;
  frequency: string;
  startDate: string;
  endDate: string;
  cost: number;
  notes: string;
}

export type ExpenseCategory =
  | 'Veterinary'
  | 'Medication'
  | 'Food'
  | 'Grooming'
  | 'Toys'
  | 'Training'
  | 'Insurance'
  | 'Boarding'
  | 'Accessories'
  | 'Other';

export interface Expense {
  id: string;
  petId: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: 'Credit Card' | 'Debit Card' | 'Cash' | 'Pet Insurance' | 'Other';
  notes: string;
  source?: 'Direct' | 'Vaccination' | 'Medication' | 'Health Record' | 'Grooming';
  sourceId?: string;
}

export interface BudgetItem {
  id: string;
  petId: string;
  category: ExpenseCategory;
  monthlyBudget: number;
}

export interface WeightRecord {
  id: string;
  petId: string;
  date: string;
  weight: number;
  unit: 'kg' | 'lbs';
  notes: string;
}

export interface FeedingRecord {
  id: string;
  petId: string;
  date: string;
  meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Supplements';
  food: string;
  amount: string;
  time: string;
  notes: string;
}

export type GroomingServiceType =
  | 'Bath'
  | 'Haircut'
  | 'Nail Trimming'
  | 'Ear Cleaning'
  | 'Teeth Cleaning'
  | 'Flea Treatment'
  | 'De-shedding'
  | 'Other';

export interface GroomingRecord {
  id: string;
  petId: string;
  service: GroomingServiceType;
  lastDate: string;
  nextDue: string;
  notes: string;
}

export type AppointmentCategory = 'Health' | 'Grooming' | 'Vaccination' | 'Training' | 'Shopping' | 'Other';
export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface AppointmentTask {
  id: string;
  petId: string;
  date: string;
  task: string;
  category: AppointmentCategory;
  priority: PriorityLevel;
  completed: boolean;
  notes: string;
}

export type TabKey =
  | 'dashboard'
  | 'profile'
  | 'health'
  | 'vaccinations'
  | 'medications'
  | 'expenses'
  | 'budget'
  | 'weight'
  | 'feeding'
  | 'grooming'
  | 'appointments'
  | 'analytics';

export interface TabConfig {
  key: TabKey;
  label: string;
  excelTabName: string;
  iconName: string;
  badge?: string;
}
