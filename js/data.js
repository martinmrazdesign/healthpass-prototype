/* HealthPass prototype — entirely fake, hardcoded data. No network calls anywhere. */

const DEMO_PIN = '3225';

const PATIENT = {
  name: 'Amara Okonkwo',
  birthDate: 'March 14, 1990',
  age: 36,
  gender: 'Female',
  address: '123 Main St, Springfield, IL',
  mobile: '+1 (555) 019-2837',
  patientId: 'MRN-88213-AO',
};

const FAMILY_MEMBERS = [
  { id: 'main', name: 'Amara Okonkwo', birthYear: '1990', isMain: true },
  { id: 'child-1', name: 'Noah Okonkwo', birthYear: '2019' },
  { id: 'child-2', name: 'Ava Okonkwo', birthYear: '2021' },
];

const RECENTS = [
  { category: 'visit', label: 'New visit', title: 'Otorhinolaringology', date: "6 Feb '26, 10:00", detailUrl: '#/visits/v-1' },
  { category: 'prescription', label: 'New prescription', title: 'By Maria Silva at Turn Clinic', date: "6 Feb '26", detailUrl: '#/prescription/rx-1' },
  { category: 'allergy', label: 'New allergy', title: 'Penicillin', date: 'Jan 2018', detailUrl: '#/allergies' },
  { category: 'labresult', label: 'New test results', title: 'Comprehensive Metabolic Panel', date: 'Jul 12, 2026', detailUrl: '#/labresults/lr-1' },
  { category: 'sicknote', label: 'New sick note', title: 'Urgent care visit — ankle sprain', date: 'Apr 2, 2026', detailUrl: '#/documents' },
];

const VITALS = [
  { id: 'bp', name: 'Blood Pressure', value: '118/76 mmHg', status: 'Normal', badgeVariant: 'default', date: 'Jul 20, 2026',
    history: [ ['Jan', '124/80'], ['Mar', '121/79'], ['May', '119/77'], ['Jul', '118/76'] ] },
  { id: 'hr', name: 'Heart Rate', value: '68 bpm', status: 'Normal', badgeVariant: 'default', date: 'Jul 20, 2026',
    history: [ ['Jan', '72'], ['Mar', '70'], ['May', '69'], ['Jul', '68'] ] },
  { id: 'temp', name: 'Temperature', value: '98.4 °F', status: 'Normal', badgeVariant: 'default', date: 'Jul 20, 2026',
    history: [ ['Jan', '98.6'], ['Mar', '98.5'], ['May', '98.5'], ['Jul', '98.4'] ] },
  { id: 'weight', name: 'Weight', value: '64 kg', status: 'Stable', badgeVariant: 'secondary', date: 'Jul 20, 2026',
    history: [ ['Jan', '65'], ['Mar', '64.6'], ['May', '64.3'], ['Jul', '64'] ] },
  { id: 'spo2', name: 'Oxygen Saturation', value: '98%', status: 'Normal', badgeVariant: 'default', date: 'Jul 20, 2026',
    history: [ ['Jan', '97'], ['Mar', '98'], ['May', '98'], ['Jul', '98'] ] },
];

const MEDICATIONS = [
  { id: 'rx-1', name: 'Amoxicillin 500mg', dosage: 'Take 1 capsule 3x daily with food', form: 'Capsule', quantity: '21 capsules',
    prescriber: 'Dr. Amina Okoye', status: 'Active', badgeVariant: 'default', refills: 2, authoredDate: 'Jul 18, 2026' },
  { id: 'rx-2', name: 'Ibuprofen 400mg', dosage: 'Take 1 tablet as needed for pain, max 3x daily', form: 'Tablet', quantity: '30 tablets',
    prescriber: 'Dr. Amina Okoye', status: 'Active', badgeVariant: 'default', refills: 1, authoredDate: 'Jun 30, 2026' },
  { id: 'rx-3', name: 'Loratadine 10mg', dosage: 'Take 1 tablet daily for allergy symptoms', form: 'Tablet', quantity: '30 tablets',
    prescriber: 'Dr. Priya Nair', status: 'Completed', badgeVariant: 'secondary', refills: 0, authoredDate: 'Mar 2, 2026' },
];

const LAB_RESULTS = [
  { id: 'lr-1', name: 'Comprehensive Metabolic Panel', conclusion: 'All values within normal range', category: 'Chemistry',
    status: 'Final', badgeVariant: 'default', reportDate: 'Jul 12, 2026',
    observations: [
      { name: 'Glucose', value: '92 mg/dL', range: '70–99 mg/dL', flag: 'Normal' },
      { name: 'Sodium', value: '140 mmol/L', range: '136–145 mmol/L', flag: 'Normal' },
      { name: 'Potassium', value: '4.1 mmol/L', range: '3.5–5.1 mmol/L', flag: 'Normal' },
      { name: 'Creatinine', value: '0.8 mg/dL', range: '0.6–1.2 mg/dL', flag: 'Normal' },
      { name: 'Calcium', value: '9.4 mg/dL', range: '8.5–10.2 mg/dL', flag: 'Normal' },
    ],
    aiSummary: 'This panel checks kidney function, blood sugar, and electrolyte balance. Every value came back within the expected healthy range — nothing here needs follow-up.' },
  { id: 'lr-2', name: 'TB IGRA Test', conclusion: 'Negative — no evidence of TB infection', category: 'Immunology',
    status: 'Final', badgeVariant: 'default', reportDate: 'May 4, 2026',
    observations: [
      { name: 'IGRA Result', value: 'Negative', range: 'Negative', flag: 'Normal' },
    ],
    aiSummary: 'A screening test for tuberculosis exposure. The negative result means no evidence of TB infection was found.' },
  { id: 'lr-3', name: 'Lipid Panel', conclusion: '', category: 'Chemistry',
    status: 'In Progress', badgeVariant: 'secondary', reportDate: 'Aug 1, 2026',
    observations: [],
    aiSummary: 'Your results are still being processed by the lab. Check back once the test is complete.' },
];

const ALLERGIES = [
  { substance: 'Penicillin', type: 'Medication', reaction: 'Skin rash', criticality: 'High', recordedDate: 'Jan 2018' },
  { substance: 'Peanuts', type: 'Food', reaction: 'Swelling, hives', criticality: 'High', recordedDate: 'Jun 2015' },
  { substance: 'Pollen', type: 'Environmental', reaction: 'Sneezing, itchy eyes', criticality: 'Low', recordedDate: 'Mar 2026' },
];

const IMMUNIZATIONS = [
  { vaccine: 'Influenza (seasonal)', date: 'Oct 3, 2025', status: 'Completed' },
  { vaccine: 'Tdap Booster', date: 'Feb 14, 2024', status: 'Completed' },
  { vaccine: 'COVID-19 (bivalent booster)', date: 'Nov 20, 2023', status: 'Completed' },
  { vaccine: 'MMR', date: 'Jun 9, 2012', status: 'Completed' },
];

const VISITS = [
  { id: 'v-1', title: 'Annual Checkup', provider: 'Dr. Amina Okoye', location: 'Springfield Family Clinic', date: 'Jun 30, 2026',
    aiSummary: 'Your annual physical came back normal. Vitals are stable and within a healthy range. Keep up your current routine — no follow-up needed for a year.',
    soap: {
      reported: 'No specific complaints. Here for a routine annual physical.',
      examination: 'Temp 98.4°F, heart rate 68 bpm, blood pressure 118/76 mmHg, oxygen saturation 98%. Heart and lungs clear. No abnormal findings.',
      diagnosis: 'Healthy adult, routine exam — no acute findings.',
      recommendation: 'Continue current diet and exercise routine. Discussed seasonal allergy management. Follow-up in 12 months unless symptoms arise.',
    },
    documents: [] },
  { id: 'v-2', title: 'Urgent Care (Sprained Ankle)', provider: 'Dr. Wei Zhang', location: 'Springfield Urgent Care', date: 'Apr 2, 2026',
    aiSummary: 'You have a grade 1 ankle sprain from a fall. The X-ray shows no fracture. Rest, ice, and ibuprofen should help. Follow up if it hasn’t improved within 2 weeks.',
    soap: {
      reported: 'Right ankle pain and swelling after a fall earlier today. Difficulty bearing weight.',
      examination: 'Right ankle: mild swelling and tenderness over the lateral ligaments, no bony tenderness. Range of motion limited by pain. X-ray negative for fracture.',
      diagnosis: 'Grade 1 lateral ankle sprain.',
      recommendation: 'RICE protocol (rest, ice, compression, elevation). Ibuprofen 400mg as needed for pain. Follow up if symptoms persist beyond 2 weeks.',
    },
    documents: [
      { kind: 'Prescription', description: 'Ibuprofen for ankle sprain', date: 'Apr 2, 2026' },
      { kind: 'Sick note', description: 'Urgent care visit — ankle sprain', date: 'Apr 2, 2026' },
    ] },
  { id: 'v-3', title: 'Allergy Consultation', provider: 'Dr. Priya Nair', location: 'Springfield Family Clinic', date: 'Mar 2, 2026',
    aiSummary: 'Seasonal allergy symptoms confirmed. You’ve started a daily antihistamine and discussed avoiding triggers — nothing here needs urgent attention.',
    soap: {
      reported: 'Sneezing, itchy eyes, and nasal congestion during spring. Symptoms recur seasonally.',
      examination: 'Nasal mucosa mildly swollen. Eyes mildly red, no discharge. Lungs clear.',
      diagnosis: 'Seasonal allergic rhinitis.',
      recommendation: 'Start Loratadine 10mg daily during allergy season. Discussed environmental triggers and avoidance strategies.',
    },
    documents: [
      { kind: 'Prescription', description: 'Loratadine for seasonal allergies', date: 'Mar 2, 2026' },
    ] },
];

const DOCUMENTS = [
  { id: 'doc-1', kind: 'Prescription', relatedVisit: 'Otorhinolaringology', provider: 'Dr. Amina Okoye at Turn Clinic', date: 'Feb 6, 2026',
    message: 'Hey Amara, this is your prescription. Please pick up this medicine as soon as possible and you should be fine in a few days.' },
  { id: 'doc-2', kind: 'Prescription', relatedVisit: 'Urgent Care (Sprained Ankle)', provider: 'Dr. Wei Zhang at Turn Clinic', date: 'Apr 2, 2026',
    message: 'Hey Amara, this is your prescription. Please pick up this medicine as soon as possible and you should be fine in a few days.' },
  { id: 'doc-3', kind: 'Prescription', relatedVisit: 'Allergy Consultation', provider: 'Dr. Priya Nair at Turn Clinic', date: 'Mar 2, 2026',
    message: 'Hey Amara, this is your prescription. Please pick up this medicine as soon as possible and you should be fine in a few days.' },
  { id: 'doc-4', kind: 'Sick note', relatedVisit: 'Urgent Care (Sprained Ankle)', provider: 'Dr. Wei Zhang at Turn Clinic', date: 'Apr 2, 2026',
    message: 'Hey Amara, here’s your sick note for work covering your recovery time after the ankle sprain.' },
  { id: 'doc-5', kind: 'Referral', relatedVisit: 'Allergy Consultation', provider: 'Dr. Priya Nair at Turn Clinic', date: 'Mar 2, 2026',
    message: 'Hey Amara, you’ve been referred to a specialist for further allergy testing. Please book an appointment at your convenience.' },
  { id: 'doc-6', kind: 'Referral', relatedVisit: 'Urgent Care (Sprained Ankle)', provider: 'Dr. Wei Zhang at Turn Clinic', date: 'Apr 2, 2026',
    message: 'Hey Amara, you’ve been referred to physical therapy to support your ankle recovery. Please book an appointment at your convenience.' },
];
