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

export interface UnifiedExpense extends Expense {
  source: 'Direct' | 'Vaccination' | 'Medication' | 'Health Record' | 'Grooming';
  sourceId?: string;
  tabOrigin: string;
}

export function getUnifiedExpenses(
  petId: string,
  expenses: Expense[],
  vaccinations: Vaccination[],
  medications: Medication[],
  healthRecords: HealthRecord[]
): UnifiedExpense[] {
  const result: UnifiedExpense[] = [];
  const existingSourceIds = new Set<string>();

  // 1. Direct Ledger Expenses
  expenses
    .filter((e) => e.petId === petId)
    .forEach((e) => {
      const source = e.source || 'Direct';
      if (e.sourceId) {
        existingSourceIds.add(e.sourceId);
      }
      result.push({
        ...e,
        source,
        tabOrigin: source === 'Direct' ? 'Expense Tracker' : `${source} Tab`,
      });
    });

  // 2. Vaccinations with cost - kept in 'Vaccinations' category so it does NOT collide with Veterinary
  vaccinations
    .filter((v) => v.petId === petId && typeof v.cost === 'number' && v.cost > 0)
    .forEach((v) => {
      if (!existingSourceIds.has(v.id)) {
        result.push({
          id: `sync-vac-${v.id}`,
          petId: v.petId,
          date: v.dateGiven || new Date().toISOString().split('T')[0],
          category: 'Vaccinations' as any,
          description: `Vaccination: ${v.vaccine}`,
          amount: v.cost,
          paymentMethod: 'Credit Card',
          notes: `Administered by ${v.veterinarian || 'Veterinarian'}${v.batchNumber ? ` (Batch #${v.batchNumber})` : ''} - Synced from Vaccination Tracker`,
          source: 'Vaccination',
          sourceId: v.id,
          tabOrigin: 'Vaccinations Tab',
        });
      }
    });

  // 3. Medications with cost
  medications
    .filter((m) => m.petId === petId && typeof m.cost === 'number' && m.cost > 0)
    .forEach((m) => {
      if (!existingSourceIds.has(m.id)) {
        result.push({
          id: `sync-med-${m.id}`,
          petId: m.petId,
          date: m.startDate || new Date().toISOString().split('T')[0],
          category: 'Medication',
          description: `Medication: ${m.medication} (${m.dose || 'Dose'})`,
          amount: m.cost,
          paymentMethod: 'Credit Card',
          notes: `Frequency: ${m.frequency || 'Regular'} - Synced from Medication Tracker`,
          source: 'Medication',
          sourceId: m.id,
          tabOrigin: 'Medications Tab',
        });
      }
    });

  // 4. Health Records with cost - strictly categorized as Veterinary health visits
  healthRecords
    .filter((h) => h.petId === petId && typeof h.cost === 'number' && h.cost > 0)
    .forEach((h) => {
      if (!existingSourceIds.has(h.id)) {
        result.push({
          id: `sync-hr-${h.id}`,
          petId: h.petId,
          date: h.date || new Date().toISOString().split('T')[0],
          category: 'Veterinary',
          description: `Clinical Visit: ${h.type} - ${h.description}`,
          amount: h.cost,
          paymentMethod: 'Credit Card',
          notes: `Vet: ${h.vet || 'Clinic'} - Synced from Health Records`,
          source: 'Health Record',
          sourceId: h.id,
          tabOrigin: 'Health Records Tab',
        });
      }
    });

  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function calculatePetFinancialMetrics(
  petId: string,
  expenses: Expense[],
  vaccinations: Vaccination[],
  medications: Medication[],
  healthRecords: HealthRecord[]
) {
  const unified = getUnifiedExpenses(petId, expenses, vaccinations, medications, healthRecords);

  const totalAllExpenses = unified.reduce((sum, e) => sum + e.amount, 0);

  const directLedgerTotal = unified
    .filter((e) => e.source === 'Direct')
    .reduce((sum, e) => sum + e.amount, 0);

  // Strictly Vaccination costs
  const vaccinationTotal = vaccinations
    .filter((v) => v.petId === petId)
    .reduce((sum, v) => sum + (v.cost || 0), 0);

  // Strictly Medication costs
  const medicationTotal = medications
    .filter((m) => m.petId === petId)
    .reduce((sum, m) => sum + (m.cost || 0), 0);

  // Strictly Health Records Clinical / Vet visit costs
  const healthRecordsTotal = healthRecords
    .filter((h) => h.petId === petId)
    .reduce((sum, h) => sum + (h.cost || 0), 0);

  // Veterinary health visits (Clinical visits + direct veterinary expenses, NOT vaccinations)
  const vetCategoryTotal = unified
    .filter((e) => e.category === 'Veterinary')
    .reduce((sum, e) => sum + e.amount, 0);

  const medCategoryTotal = unified
    .filter((e) => e.category === 'Medication')
    .reduce((sum, e) => sum + e.amount, 0);

  const foodCategoryTotal = unified
    .filter((e) => e.category === 'Food')
    .reduce((sum, e) => sum + e.amount, 0);

  const groomingCategoryTotal = unified
    .filter((e) => e.category === 'Grooming')
    .reduce((sum, e) => sum + e.amount, 0);

  const categoryMap = unified.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  return {
    unified,
    totalAllExpenses,
    directLedgerTotal,
    vaccinationTotal,
    medicationTotal,
    healthRecordsTotal,
    vetCategoryTotal,
    medCategoryTotal,
    foodCategoryTotal,
    groomingCategoryTotal,
    categoryMap,
  };
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

  const metrics = calculatePetFinancialMetrics(
    pet.id,
    expenses,
    vaccinations,
    medications,
    healthRecords
  );

  const dashboardData = [
    ['🐾 MY PET TRACKER DASHBOARD'],
    ['Pet Name', pet.name],
    ['Species', pet.species],
    ['Breed', pet.breed],
    ['Age', calculatePetAge(pet.dob)],
    [''],
    ['FINANCIAL KPI METRICS (SYNCHRONIZED ACROSS ALL TABS)', 'VALUE', 'FORMULA SOURCE'],
    ['Total Combined Expenses (All Tabs)', `$${metrics.totalAllExpenses.toFixed(2)}`, '=SUM(tblExpenses[Amount], tblVaccinations[Cost], tblMedications[Cost], tblHealth[Cost])'],
    ['Veterinary & Health Visits (Clinical Visits)', `$${metrics.healthRecordsTotal.toFixed(2)}`, '=SUM(tblHealth[Cost])'],
    ['Vaccination Expenses (Immunizations & Boosters)', `$${metrics.vaccinationTotal.toFixed(2)}`, '=SUM(tblVaccinations[Cost])'],
    ['Medication Expenses (Prescriptions & Rx)', `$${metrics.medicationTotal.toFixed(2)}`, '=SUM(tblMedications[Cost])'],
    ['Pet Food & Nutrition Expenses', `$${metrics.foodCategoryTotal.toFixed(2)}`, '=SUMIFS(tblExpenses[Amount], tblExpenses[Category], "Food")'],
    ['Grooming Expenses', `$${metrics.groomingCategoryTotal.toFixed(2)}`, '=SUMIFS(tblExpenses[Amount], tblExpenses[Category], "Grooming")'],
    ['Direct Ledger Purchases', `$${metrics.directLedgerTotal.toFixed(2)}`, '=SUMIFS(tblExpenses[Amount], tblExpenses[Source], "Direct")'],
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

  // 6. Expense Tracker Sheet (Synchronized Unified Ledger)
  const wsExp = XLSX.utils.json_to_sheet(
    metrics.unified.map((e) => ({
      Date: e.date,
      Category: e.category,
      Description: e.description,
      'Amount ($)': e.amount,
      'Payment Method': e.paymentMethod,
      Source: e.source,
      'Origin Tab': e.tabOrigin,
      Notes: e.notes,
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsExp, '6. Expense Tracker');

  // 7. Pet Budget Sheet (Using Synchronized Actuals)
  const wsBgt = XLSX.utils.json_to_sheet(
    budgets.map((b) => {
      const actual = metrics.categoryMap[b.category] || 0;
      const diff = b.monthlyBudget - actual;
      return {
        Category: b.category,
        'Monthly Budget ($)': b.monthlyBudget,
        'Actual Spent ($) [Synced]': actual,
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

export function generatePetTrackerCsv(
  pet: Pet,
  healthRecords: HealthRecord[],
  vaccinations: Vaccination[],
  medications: Medication[],
  expenses: Expense[],
  budgets: BudgetItem[],
  weights: WeightRecord[],
  groomings: GroomingRecord[],
  appointments: AppointmentTask[]
): string {
  const metrics = calculatePetFinancialMetrics(
    pet.id,
    expenses,
    vaccinations,
    medications,
    healthRecords
  );

  let csv = `================================================================================\n`;
  csv += `🐾 ULTIMATE PET TRACKER MASTER EXPORT - ${pet.name.toUpperCase()}\n`;
  csv += `Generated: ${new Date().toISOString().split('T')[0]} | Species: ${pet.species} | Breed: ${pet.breed} | Age: ${calculatePetAge(pet.dob)}\n`;
  csv += `================================================================================\n\n`;

  // 1. PET PROFILE
  csv += `--- 1. PET PROFILE ---\n`;
  csv += `Field,Value\n`;
  csv += `Pet Name,"${pet.name}"\n`;
  csv += `Species,"${pet.species}"\n`;
  csv += `Breed,"${pet.breed}"\n`;
  csv += `Gender,"${pet.gender}"\n`;
  csv += `Date of Birth,"${pet.dob}"\n`;
  csv += `Current Weight,"${pet.weight} ${pet.weightUnit}"\n`;
  csv += `Microchip ID,"${pet.microchipId}"\n`;
  csv += `Veterinarian,"${pet.veterinarian}"\n`;
  csv += `Clinic,"${pet.vetClinic}"\n`;
  csv += `Emergency Contact,"${pet.emergencyContact}"\n`;
  csv += `Allergies,"${pet.allergies}"\n\n`;

  // 2. FINANCIAL SUMMARY
  csv += `--- 2. FINANCIAL KPI METRICS (SYNCHRONIZED) ---\n`;
  csv += `Metric,Amount ($),Formula\n`;
  csv += `"Total Combined Expenses (All Tabs)",${metrics.totalAllExpenses.toFixed(2)},"=SUM(tblExpenses[Amount], tblVaccinations[Cost], tblMedications[Cost], tblHealth[Cost])"\n`;
  csv += `"Veterinary & Health Visits (Clinical Visits)",${metrics.healthRecordsTotal.toFixed(2)},"=SUM(tblHealth[Cost])"\n`;
  csv += `"Vaccination Expenses (Immunizations)",${metrics.vaccinationTotal.toFixed(2)},"=SUM(tblVaccinations[Cost])"\n`;
  csv += `"Medication Expenses (Prescriptions)",${metrics.medicationTotal.toFixed(2)},"=SUM(tblMedications[Cost])"\n`;
  csv += `"Food & Nutrition Expenses",${metrics.foodCategoryTotal.toFixed(2)},"=SUMIFS(tblExpenses[Amount], Category, 'Food')"\n`;
  csv += `"Direct Ledger Expenses",${metrics.directLedgerTotal.toFixed(2)},"=SUMIFS(tblExpenses[Amount], Source, 'Direct')"\n\n`;

  // 3. EXPENSE LEDGER (SYNCHRONIZED)
  csv += `--- 3. UNIFIED EXPENSE LEDGER (tblExpenses) ---\n`;
  csv += `Date,Category,Description,Amount ($),Payment Method,Origin Source,Notes\n`;
  metrics.unified.forEach((e) => {
    csv += `"${e.date}","${e.category}","${e.description.replace(/"/g, '""')}",${e.amount.toFixed(2)},"${e.paymentMethod}","${e.tabOrigin}","${(e.notes || '').replace(/"/g, '""')}"\n`;
  });
  csv += `\n`;

  // 4. VACCINATIONS
  csv += `--- 4. VACCINATION SCHEDULE (tblVaccinations) ---\n`;
  csv += `Vaccine,Date Given,Next Due,Veterinarian,Batch #,Cost ($),Status,Notes\n`;
  vaccinations.forEach((v) => {
    const st = getVaccinationStatus(v.nextDue);
    csv += `"${v.vaccine}","${v.dateGiven}","${v.nextDue}","${v.veterinarian || ''}","${v.batchNumber || ''}",${(v.cost || 0).toFixed(2)},"${st.status}","${(v.notes || '').replace(/"/g, '""')}"\n`;
  });
  csv += `\n`;

  // 5. MEDICATIONS
  csv += `--- 5. MEDICATION & PRESCRIPTION LOG (tblMedications) ---\n`;
  csv += `Medication,Dose,Frequency,Start Date,End Date,Cost ($),Status,Days Remaining,Notes\n`;
  medications.forEach((m) => {
    const st = getMedicationStatus(m.startDate, m.endDate);
    csv += `"${m.medication}","${m.dose || ''}","${m.frequency || ''}","${m.startDate}","${m.endDate}",${(m.cost || 0).toFixed(2)},"${st.status}",${st.daysRemaining},"${(m.notes || '').replace(/"/g, '""')}"\n`;
  });
  csv += `\n`;

  // 6. HEALTH RECORDS
  csv += `--- 6. VETERINARY & HEALTH RECORDS (tblHealth) ---\n`;
  csv += `Date,Type,Description,Veterinarian,Cost ($),Follow-Up Date,Notes\n`;
  healthRecords.forEach((h) => {
    csv += `"${h.date}","${h.type}","${h.description.replace(/"/g, '""')}","${h.vet || ''}",${(h.cost || 0).toFixed(2)},"${h.followUpDate || ''}","${(h.notes || '').replace(/"/g, '""')}"\n`;
  });
  csv += `\n`;

  // 7. BUDGET VARIANCE
  csv += `--- 7. MONTHLY BUDGET & VARIANCE (tblBudget) ---\n`;
  csv += `Category,Monthly Target ($),Actual Spent ($),Difference ($),Status\n`;
  budgets.forEach((b) => {
    const actual = metrics.categoryMap[b.category] || 0;
    const diff = b.monthlyBudget - actual;
    csv += `"${b.category}",${b.monthlyBudget.toFixed(2)},${actual.toFixed(2)},${diff.toFixed(2)},"${diff >= 0 ? 'Under Budget' : 'Over Budget'}"\n`;
  });
  csv += `\n`;

  // 8. WEIGHT RECORDS
  csv += `--- 8. WEIGHT GROWTH LOG (tblWeight) ---\n`;
  csv += `Date,Weight,Unit,Notes\n`;
  weights.forEach((w) => {
    csv += `"${w.date}",${w.weight},"${w.unit}","${(w.notes || '').replace(/"/g, '""')}"\n`;
  });
  csv += `\n`;

  // 9. GROOMING
  csv += `--- 9. GROOMING SCHEDULE (tblGrooming) ---\n`;
  csv += `Service,Last Date,Next Due,Status,Notes\n`;
  groomings.forEach((g) => {
    const st = getGroomingStatus(g.nextDue);
    csv += `"${g.service}","${g.lastDate}","${g.nextDue}","${st.status}","${(g.notes || '').replace(/"/g, '""')}"\n`;
  });
  csv += `\n`;

  // 10. APPOINTMENTS
  csv += `--- 10. APPOINTMENTS & CARE TASKS (tblAppointments) ---\n`;
  csv += `Date,Task,Category,Priority,Completed,Notes\n`;
  appointments.forEach((a) => {
    csv += `"${a.date}","${a.task.replace(/"/g, '""')}","${a.category}","${a.priority}","${a.completed ? 'YES' : 'NO'}","${(a.notes || '').replace(/"/g, '""')}"\n`;
  });

  return csv;
}

export function downloadPetTrackerCsv(
  pet: Pet,
  healthRecords: HealthRecord[],
  vaccinations: Vaccination[],
  medications: Medication[],
  expenses: Expense[],
  budgets: BudgetItem[],
  weights: WeightRecord[],
  groomings: GroomingRecord[],
  appointments: AppointmentTask[]
) {
  const csvContent = generatePetTrackerCsv(
    pet,
    healthRecords,
    vaccinations,
    medications,
    expenses,
    budgets,
    weights,
    groomings,
    appointments
  );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${pet.name.toLowerCase()}_pet_tracker_master.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const generatePetTrackerExcel = exportTrackerToExcel;

