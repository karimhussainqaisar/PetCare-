import * as XLSX from 'xlsx';
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
} from '../types';

export function calculatePetAge(dobString: string): string {
  if (!dobString) return 'N/A';
  const dob = new Date(dobString);
  const today = new Date();

  if (isNaN(dob.getTime())) return 'N/A';

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
    years--;
    months += 12;
  }

  if (years > 0) {
    return `${years} yr${years > 1 ? 's' : ''}${months > 0 ? ` ${months} mo${months > 1 ? 's' : ''}` : ''}`;
  } else {
    return `${months} mo${months !== 1 ? 's' : ''}`;
  }
}

export function getVaccinationStatus(nextDueString: string): {
  status: 'OVERDUE' | 'DUE SOON' | 'UP TO DATE';
  color: string;
  badgeClass: string;
  formula: string;
} {
  const formula = `=IF([@[Next Due]] < TODAY(), "OVERDUE", IF([@[Next Due]] <= TODAY()+30, "DUE SOON", "UP TO DATE"))`;
  if (!nextDueString) {
    return {
      status: 'UP TO DATE',
      color: 'emerald',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      formula,
    };
  }

  const nextDue = new Date(nextDueString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = nextDue.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'OVERDUE',
      color: 'rose',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse',
      formula,
    };
  } else if (diffDays <= 30) {
    return {
      status: 'DUE SOON',
      color: 'amber',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      formula,
    };
  } else {
    return {
      status: 'UP TO DATE',
      color: 'emerald',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      formula,
    };
  }
}

export function getMedicationStatus(
  startDateString: string,
  endDateString: string
): {
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING';
  daysRemaining: number;
  badgeClass: string;
  formula: string;
} {
  const formula = `=IF(TODAY() > [@[End Date]], "COMPLETED", IF(TODAY() < [@[Start Date]], "UPCOMING", "ACTIVE"))`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDateString);
  const end = new Date(endDateString);

  const endDiff = end.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(endDiff / (1000 * 60 * 60 * 24)));

  if (today > end) {
    return {
      status: 'COMPLETED',
      daysRemaining: 0,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
      formula,
    };
  } else if (today < start) {
    return {
      status: 'UPCOMING',
      daysRemaining,
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      formula,
    };
  } else {
    return {
      status: 'ACTIVE',
      daysRemaining,
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      formula,
    };
  }
}

export function getGroomingStatus(nextDueString: string): {
  status: 'OVERDUE' | 'DUE SOON' | 'OK';
  badgeClass: string;
  formula: string;
} {
  const formula = `=IF([@[Next Due]] < TODAY(), "OVERDUE", IF([@[Next Due]] <= TODAY()+7, "DUE SOON", "OK"))`;
  if (!nextDueString) {
    return {
      status: 'OK',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      formula,
    };
  }

  const nextDue = new Date(nextDueString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'OVERDUE',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      formula,
    };
  } else if (diffDays <= 7) {
    return {
      status: 'DUE SOON',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      formula,
    };
  } else {
    return {
      status: 'OK',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      formula,
    };
  }
}

export function exportTrackerToExcel(
  pet: Pet,
  healthRecords: HealthRecord[],
  vaccinations: Vaccination[],
  medications: Medication[],
  expenses: Expense[],
  budgets: BudgetItem[],
  weights: WeightRecord[],
  feedings: FeedingRecord[],
  groomings: GroomingRecord[],
  appointments: AppointmentTask[]
) {
  const wb = XLSX.utils.book_new();

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const vetExpenses = expenses.filter((e) => e.category === 'Veterinary').reduce((sum, e) => sum + e.amount, 0);
  const medExpenses = expenses.filter((e) => e.category === 'Medication').reduce((sum, e) => sum + e.amount, 0);
  const foodExpenses = expenses.filter((e) => e.category === 'Food').reduce((sum, e) => sum + e.amount, 0);

  const dashboardData = [
    ['🐾 MY PET TRACKER DASHBOARD'],
    ['Pet Name', pet.name],
    ['Species', pet.species],
    ['Breed', pet.breed],
    ['Age', calculatePetAge(pet.dob)],
    [''],
    ['KPI METRICS', 'VALUE', 'FORMULA SOURCE'],
    ['Vet Expenses', `$${vetExpenses.toFixed(2)}`, '=SUMIFS(tblExpenses[Amount], tblExpenses[Category], "Veterinary")'],
    ['Medication Expenses', `$${medExpenses.toFixed(2)}`, '=SUMIFS(tblExpenses[Amount], tblExpenses[Category], "Medication")'],
    ['Pet Food Expenses', `$${foodExpenses.toFixed(2)}`, '=SUMIFS(tblExpenses[Amount], tblExpenses[Category], "Food")'],
    ['Total Expenses', `$${totalExpenses.toFixed(2)}`, '=SUM(tblExpenses[Amount])'],
  ];
  const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardData);
  XLSX.utils.book_append_sheet(wb, wsDashboard, '1. Dashboard');

  // 2. Pet Profile Sheet
  const profileData = [
    ['PET PROFILE', pet.name],
    ['Field', 'Value', 'Instructions'],
    ['Pet Name', pet.name, 'Editable Field'],
    ['Species', pet.species, 'Select species'],
    ['Breed', pet.breed, 'Breed info'],
    ['Gender', pet.gender, 'Gender'],
    ['Date of Birth', pet.dob, 'YYYY-MM-DD'],
    ['Age', calculatePetAge(pet.dob), '=DATEDIF(DOB, TODAY(), "Y") & " yrs"'],
    ['Current Weight', `${pet.weight} ${pet.weightUnit}`, 'Latest weight'],
    ['Color', pet.color, 'Coat color'],
    ['Microchip ID', pet.microchipId, 'Microchip tag'],
    ['Adoption Date', pet.adoptionDate, 'Adoption date'],
    ['Insurance Provider', pet.insuranceProvider, 'Provider name'],
    ['Insurance Number', pet.insuranceNumber, 'Policy ID'],
    ['Veterinarian', pet.veterinarian, 'Primary vet doctor'],
    ['Vet Clinic', pet.vetClinic, 'Clinic location'],
    ['Emergency Contact', pet.emergencyContact, '24/7 hotline'],
    ['Allergies', pet.allergies, 'Known food/env allergies'],
    ['Medical Conditions', pet.medicalConditions, 'Diagnoses'],
    ['Special Instructions', pet.specialInstructions, 'Daily care notes'],
  ];
  const wsProfile = XLSX.utils.aoa_to_sheet(profileData);
  XLSX.utils.book_append_sheet(wb, wsProfile, '2. Pet Profile');

  // 3. Health Records Sheet
  const wsHealth = XLSX.utils.json_to_sheet(
    healthRecords.map((r) => ({
      Date: r.date,
      Type: r.type,
      Description: r.description,
      Vet: r.vet,
      'Cost ($)': r.cost,
      'Follow-Up Date': r.followUpDate || '—',
      Notes: r.notes,
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsHealth, '3. Health Records');

  // 4. Vaccination Tracker Sheet
  const wsVac = XLSX.utils.json_to_sheet(
    vaccinations.map((v) => ({
      Vaccine: v.vaccine,
      'Date Given': v.dateGiven,
      'Next Due': v.nextDue,
      Veterinarian: v.veterinarian,
      'Batch/Lot #': v.batchNumber,
      'Cost ($)': v.cost,
      Status: getVaccinationStatus(v.nextDue).status,
      Notes: v.notes,
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsVac, '4. Vaccination Tracker');

  // 5. Medication Tracker Sheet
  const wsMed = XLSX.utils.json_to_sheet(
    medications.map((m) => {
      const st = getMedicationStatus(m.startDate, m.endDate);
      return {
        Medication: m.medication,
        Dose: m.dose,
        Frequency: m.frequency,
        'Start Date': m.startDate,
        'End Date': m.endDate,
        'Cost ($)': m.cost,
        Status: st.status,
        'Days Remaining': st.daysRemaining,
        Notes: m.notes,
      };
    })
  );
  XLSX.utils.book_append_sheet(wb, wsMed, '5. Medication Tracker');

  // 6. Expense Tracker Sheet
  const wsExp = XLSX.utils.json_to_sheet(
    expenses.map((e) => ({
      Date: e.date,
      Category: e.category,
      Description: e.description,
      'Amount ($)': e.amount,
      'Payment Method': e.paymentMethod,
      Notes: e.notes,
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsExp, '6. Expense Tracker');

  // 7. Pet Budget Sheet
  const wsBgt = XLSX.utils.json_to_sheet(
    budgets.map((b) => {
      const actual = expenses
        .filter((e) => e.category === b.category)
        .reduce((sum, e) => sum + e.amount, 0);
      const diff = b.monthlyBudget - actual;
      return {
        Category: b.category,
        'Monthly Budget ($)': b.monthlyBudget,
        'Actual Spent ($)': actual,
        'Difference ($)': diff,
        Status: diff >= 0 ? 'Under Budget' : 'Over Budget',
      };
    })
  );
  XLSX.utils.book_append_sheet(wb, wsBgt, '7. Pet Budget');

  // 8. Weight Tracker Sheet
  const wsWgt = XLSX.utils.json_to_sheet(
    weights.map((w) => ({
      Date: w.date,
      Weight: w.weight,
      Unit: w.unit,
      Notes: w.notes,
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsWgt, '8. Weight Tracker');

  // 9. Feeding Tracker Sheet
  const wsFeed = XLSX.utils.json_to_sheet(
    feedings.map((f) => ({
      Date: f.date,
      Meal: f.meal,
      Food: f.food,
      Amount: f.amount,
      Time: f.time,
      Notes: f.notes,
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsFeed, '9. Feeding Tracker');

  // 10. Grooming Tracker Sheet
  const wsGrm = XLSX.utils.json_to_sheet(
    groomings.map((g) => ({
      Service: g.service,
      'Last Date': g.lastDate,
      'Next Due': g.nextDue,
      Status: getGroomingStatus(g.nextDue).status,
      Notes: g.notes,
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsGrm, '10. Grooming Tracker');

  // 11. Appointments & To-Do Calendar Sheet
  const wsApt = XLSX.utils.json_to_sheet(
    appointments.map((a) => ({
      Date: a.date,
      Task: a.task,
      Category: a.category,
      Priority: a.priority,
      Completed: a.completed ? 'YES' : 'NO',
      Notes: a.notes,
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsApt, '11. Appointments Calendar');

  // Write file
  XLSX.writeFile(wb, `${pet.name.toLowerCase()}_pet_tracker_ultimate.xlsx`);
}

export const generatePetTrackerExcel = exportTrackerToExcel;

