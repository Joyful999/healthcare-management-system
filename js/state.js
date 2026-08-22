/* MEDICORE — state.js
   Seeds and exposes demo application data. All of this is fictional
   demonstration content — see the DEMO DATA labels throughout the UI.
   Nothing here is a real patient, doctor, or medical record. */

const AppState = (() => {

  const DOCTORS = [
    { id:'doc_01', name:'Dr. Amara Chen', specialty:'Cardiology', experience:12, rating:4.9, reviews:214, location:'Lagos, NG', type:['In-person','Video'], availability:'Mon–Fri', bio:'Focuses on preventive cardiology and long-term heart health monitoring.' },
    { id:'doc_02', name:'Dr. Emeka Okafor', specialty:'Neurology', experience:9, rating:4.8, reviews:156, location:'Lagos, NG', type:['In-person'], availability:'Tue–Sat', bio:'Specializes in headache disorders and neurodegenerative conditions.' },
    { id:'doc_03', name:'Dr. Priya Nair', specialty:'Pediatrics', experience:7, rating:4.9, reviews:301, location:'Abuja, NG', type:['In-person','Video'], availability:'Mon–Sat', bio:'Child development and general pediatric wellness care.' },
    { id:'doc_04', name:'Dr. Michael Obi', specialty:'Dermatology', experience:11, rating:4.7, reviews:189, location:'Lagos, NG', type:['Video'], availability:'Mon, Wed, Fri', bio:'Medical and cosmetic dermatology with a focus on skin health education.' },
    { id:'doc_05', name:'Dr. Sarah Bello', specialty:'Orthopedics', experience:15, rating:4.9, reviews:245, location:'Port Harcourt, NG', type:['In-person'], availability:'Mon–Fri', bio:'Sports medicine and joint-preservation orthopedic care.' },
    { id:'doc_06', name:'Dr. David Adeyemi', specialty:'General Medicine', experience:6, rating:4.6, reviews:98, location:'Lagos, NG', type:['In-person','Video'], availability:'Daily', bio:'Primary care physician focused on holistic, ongoing patient wellness.' },
    { id:'doc_07', name:'Dr. Ngozi Umeh', specialty:'Dentistry', experience:8, rating:4.8, reviews:167, location:'Ibadan, NG', type:['In-person'], availability:'Tue–Sat', bio:'General and cosmetic dentistry with an emphasis on preventive care.' },
    { id:'doc_08', name:'Dr. James Falana', specialty:'Psychiatry', experience:10, rating:4.9, reviews:203, location:'Lagos, NG', type:['Video'], availability:'Mon–Fri', bio:'Adult psychiatry with focus on anxiety, mood and sleep disorders.' },
    { id:'doc_09', name:'Dr. Grace Ibe', specialty:'Ophthalmology', experience:13, rating:4.7, reviews:134, location:'Enugu, NG', type:['In-person'], availability:'Mon–Fri', bio:'Comprehensive eye care and surgical vision correction.' },
    { id:'doc_10', name:'Dr. Tunde Bakare', specialty:'Cardiology', experience:18, rating:4.9, reviews:322, location:'Lagos, NG', type:['In-person','Video'], availability:'Mon–Thu', bio:'Interventional cardiology and cardiac rehabilitation planning.' },
  ];

  const PATIENTS = [
    { id:'pat_01', name:'Alex Johnson', age:34, gender:'Male', lastVisit:'2026-07-28', nextAppt:'2026-08-25', status:'Active', phone:'+234 801 234 5678', emergency:'Jamie Johnson · +234 801 999 1111' },
    { id:'pat_02', name:'Fatima Yusuf', age:41, gender:'Female', lastVisit:'2026-08-02', nextAppt:'2026-08-30', status:'Active', phone:'+234 802 345 6789', emergency:'Amina Yusuf · +234 802 888 2222' },
    { id:'pat_03', name:'Chinedu Eze', age:29, gender:'Male', lastVisit:'2026-06-14', nextAppt:'—', status:'Inactive', phone:'+234 803 456 7890', emergency:'Ada Eze · +234 803 777 3333' },
    { id:'pat_04', name:'Ruth Danladi', age:52, gender:'Female', lastVisit:'2026-08-10', nextAppt:'2026-08-24', status:'Active', phone:'+234 804 567 8901', emergency:'Peter Danladi · +234 804 666 4444' },
    { id:'pat_05', name:'Segun Adewale', age:47, gender:'Male', lastVisit:'2026-07-19', nextAppt:'2026-09-02', status:'Active', phone:'+234 805 678 9012', emergency:'Bisi Adewale · +234 805 555 5555' },
    { id:'pat_06', name:'Linda Okon', age:23, gender:'Female', lastVisit:'2026-08-15', nextAppt:'—', status:'Pending', phone:'+234 806 789 0123', emergency:'Grace Okon · +234 806 444 6666' },
    { id:'pat_07', name:'Ibrahim Sule', age:60, gender:'Male', lastVisit:'2026-05-30', nextAppt:'2026-08-28', status:'Active', phone:'+234 807 890 1234', emergency:'Halima Sule · +234 807 333 7777' },
    { id:'pat_08', name:'Ngozi Chukwu', age:38, gender:'Female', lastVisit:'2026-08-05', nextAppt:'2026-08-26', status:'Active', phone:'+234 808 901 2345', emergency:'Uche Chukwu · +234 808 222 8888' },
  ];

  function seedAppointments(){
    const today = new Date();
    const iso = (offsetDays, h, m=0) => {
      const d = new Date(today); d.setDate(d.getDate() + offsetDays);
      d.setHours(h, m, 0, 0);
      return d.toISOString();
    };
    return [
      { id:Utils.uid('appt'), doctorId:'doc_01', doctorName:'Dr. Amara Chen', specialty:'Cardiology', patientName:'Alex Johnson', date:iso(1,9,30), type:'In-person', reason:'Routine heart checkup', status:'upcoming' },
      { id:Utils.uid('appt'), doctorId:'doc_04', doctorName:'Dr. Michael Obi', specialty:'Dermatology', patientName:'Alex Johnson', date:iso(4,14,0), type:'Video', reason:'Skin consultation', status:'upcoming' },
      { id:Utils.uid('appt'), doctorId:'doc_06', doctorName:'Dr. David Adeyemi', specialty:'General Medicine', patientName:'Alex Johnson', date:iso(-3,10,0), type:'In-person', reason:'Annual physical', status:'completed' },
      { id:Utils.uid('appt'), doctorId:'doc_08', doctorName:'Dr. James Falana', specialty:'Psychiatry', patientName:'Alex Johnson', date:iso(-8,16,30), type:'Video', reason:'Follow-up session', status:'completed' },
      { id:Utils.uid('appt'), doctorId:'doc_03', doctorName:'Dr. Priya Nair', specialty:'Pediatrics', patientName:'Alex Johnson', date:iso(9,11,0), type:'In-person', reason:'Vaccination review', status:'pending' },
      { id:Utils.uid('appt'), doctorId:'doc_02', doctorName:'Dr. Emeka Okafor', specialty:'Neurology', patientName:'Alex Johnson', date:iso(-1,13,0), type:'In-person', reason:'Migraine follow-up', status:'cancelled' },
    ];
  }

  function seedPrescriptions(){
    return [
      { id:Utils.uid('rx'), medication:'Amoxicillin', dosage:'500mg', frequency:'3x daily', duration:'7 days', doctor:'Dr. David Adeyemi', start:'2026-08-14', end:'2026-08-21', status:'Active', progress:0.6 },
      { id:Utils.uid('rx'), medication:'Atorvastatin', dosage:'20mg', frequency:'1x daily (night)', duration:'90 days', doctor:'Dr. Amara Chen', start:'2026-06-01', end:'2026-08-30', status:'Active', progress:0.82 },
      { id:Utils.uid('rx'), medication:'Cetirizine', dosage:'10mg', frequency:'1x daily', duration:'14 days', doctor:'Dr. Michael Obi', start:'2026-07-10', end:'2026-07-24', status:'Completed', progress:1 },
      { id:Utils.uid('rx'), medication:'Sertraline', dosage:'50mg', frequency:'1x daily (morning)', duration:'180 days', doctor:'Dr. James Falana', start:'2026-03-01', end:'2026-08-28', status:'Active', progress:0.94 },
      { id:Utils.uid('rx'), medication:'Ibuprofen', dosage:'400mg', frequency:'As needed', duration:'10 days', doctor:'Dr. Sarah Bello', start:'2026-05-01', end:'2026-05-11', status:'Expired', progress:1 },
    ];
  }

  function seedRecords(){
    return [
      { id:Utils.uid('rec'), date:'2026-08-10', type:'Consultation', doctor:'Dr. Ruth Danladi'.replace('Dr. Ruth Danladi','Dr. Amara Chen'), diagnosis:'Routine cardiac screening — normal', notes:'ECG within normal parameters. Recommended continued statin therapy.', attachments:1 },
      { id:Utils.uid('rec'), date:'2026-07-28', type:'Laboratory', doctor:'Dr. David Adeyemi', diagnosis:'Full blood panel', notes:'Lipid and glucose levels within reference range for demo profile.', attachments:2 },
      { id:Utils.uid('rec'), date:'2026-07-10', type:'Imaging', doctor:'Dr. Emeka Okafor', diagnosis:'Cranial MRI — no acute findings', notes:'Follow-up imaging recommended in 6 months.', attachments:3 },
      { id:Utils.uid('rec'), date:'2026-06-14', type:'Prescription', doctor:'Dr. Michael Obi', diagnosis:'Contact dermatitis', notes:'Topical treatment prescribed, symptoms resolving.', attachments:0 },
      { id:Utils.uid('rec'), date:'2026-05-30', type:'Follow-up', doctor:'Dr. James Falana', diagnosis:'Mood and sleep review', notes:'Reported improved sleep quality since last session.', attachments:1 },
    ];
  }

  function seedConversations(){
    const now = Date.now();
    const h = (n) => new Date(now - n*3600*1000).toISOString();
    return [
      { id:'conv_01', withName:'Dr. Amara Chen', withRole:'Cardiology', unread:2, messages:[
        { from:'them', text:'Your latest ECG results look great, Alex.', time:h(30) },
        { from:'me', text:'That is a relief to hear, thank you Dr. Chen!', time:h(29) },
        { from:'them', text:'Keep up the statin routine and we will check again in a month.', time:h(3) },
        { from:'them', text:'Also, remember your appointment tomorrow at 9:30 AM.', time:h(1) },
      ]},
      { id:'conv_02', withName:'Dr. Michael Obi', withRole:'Dermatology', unread:0, messages:[
        { from:'me', text:'The rash has mostly cleared up since starting the cream.', time:h(50) },
        { from:'them', text:'Excellent — continue for another week and stop if it fully resolves.', time:h(48) },
      ]},
      { id:'conv_03', withName:'MEDICORE Support', withRole:'Admin ↔ Staff', unread:1, messages:[
        { from:'them', text:'Your profile verification is complete.', time:h(70) },
        { from:'them', text:'Reminder: please review your notification preferences in Settings.', time:h(5) },
      ]},
    ];
  }

  function seedNotifications(){
    const now = Date.now();
    const h = (n) => new Date(now - n*3600*1000).toISOString();
    return [
      { id:Utils.uid('n'), category:'appointments', title:'Upcoming appointment', body:'Dr. Amara Chen · Tomorrow 9:30 AM', time:h(1), read:false },
      { id:Utils.uid('n'), category:'health', title:'Medication reminder', body:'Take Amoxicillin 500mg', time:h(2), read:false },
      { id:Utils.uid('n'), category:'messages', title:'New message', body:'Dr. Amara Chen sent you a message', time:h(3), read:false },
      { id:Utils.uid('n'), category:'system', title:'Profile verified', body:'Your MEDICORE demo profile is set up', time:h(70), read:true },
      { id:Utils.uid('n'), category:'appointments', title:'Appointment rescheduled', body:'Neurology follow-up moved — see calendar', time:h(96), read:true },
    ];
  }

  function seedReminders(){
    return [
      { id:Utils.uid('rem'), med:'Amoxicillin', dose:'500mg', time:'08:00 AM', state:'pending' },
      { id:Utils.uid('rem'), med:'Atorvastatin', dose:'20mg', time:'09:00 PM', state:'pending' },
      { id:Utils.uid('rem'), med:'Sertraline', dose:'50mg', time:'07:30 AM', state:'taken' },
    ];
  }

  function seedHealthMetrics(){
    // 14-day synthetic (clearly labeled demo) time series
    const days = 14;
    const out = { heartRate:[], bp:[], temperature:[], weight:[], spo2:[], bmiWeight:72 };
    let base = { hr:72, sysBase:118, diaBase:76, temp:36.7, weight:72, spo2:97 };
    for (let i = days-1; i >= 0; i--){
      const d = new Date(); d.setDate(d.getDate() - i);
      const jitter = (n) => +(n + (Math.random()-0.5)*n*0.04).toFixed(1);
      out.heartRate.push({ date:d.toISOString().slice(0,10), value: Math.round(jitter(base.hr)) });
      out.bp.push({ date:d.toISOString().slice(0,10), sys: Math.round(jitter(base.sysBase)), dia: Math.round(jitter(base.diaBase)) });
      out.temperature.push({ date:d.toISOString().slice(0,10), value: jitter(base.temp) });
      out.weight.push({ date:d.toISOString().slice(0,10), value: jitter(base.weight) });
      out.spo2.push({ date:d.toISOString().slice(0,10), value: Math.min(100, Math.round(jitter(base.spo2))) });
    }
    return out;
  }

  function ensureSeeded(){
    if (!Storage.has('doctors')) Storage.set('doctors', DOCTORS);
    if (!Storage.has('patients')) Storage.set('patients', PATIENTS);
    if (!Storage.has('appointments')) Storage.set('appointments', seedAppointments());
    if (!Storage.has('prescriptions')) Storage.set('prescriptions', seedPrescriptions());
    if (!Storage.has('records')) Storage.set('records', seedRecords());
    if (!Storage.has('conversations')) Storage.set('conversations', seedConversations());
    if (!Storage.has('notifications')) Storage.set('notifications', seedNotifications());
    if (!Storage.has('reminders')) Storage.set('reminders', seedReminders());
    if (!Storage.has('healthMetrics')) Storage.set('healthMetrics', seedHealthMetrics());
    if (!Storage.has('theme')) Storage.set('theme', 'light');
  }

  // Convenience accessors
  const doctors = () => Storage.get('doctors', DOCTORS);
  const patients = () => Storage.get('patients', PATIENTS);
  const appointments = () => Storage.get('appointments', []);
  const prescriptions = () => Storage.get('prescriptions', []);
  const records = () => Storage.get('records', []);
  const conversations = () => Storage.get('conversations', []);
  const notifications = () => Storage.get('notifications', []);
  const reminders = () => Storage.get('reminders', []);
  const healthMetrics = () => Storage.get('healthMetrics', seedHealthMetrics());

  return {
    ensureSeeded, doctors, patients, appointments, prescriptions, records,
    conversations, notifications, reminders, healthMetrics,
    DEPARTMENTS: [
      { name:'Cardiology', doctors:2, patients:184, appointments:32, status:'Operational' },
      { name:'Neurology', doctors:1, patients:96, appointments:14, status:'Operational' },
      { name:'Pediatrics', doctors:1, patients:212, appointments:41, status:'Operational' },
      { name:'Emergency', doctors:4, patients:58, appointments:19, status:'High demand' },
      { name:'General Medicine', doctors:1, patients:301, appointments:52, status:'Operational' },
      { name:'Orthopedics', doctors:1, patients:77, appointments:11, status:'Operational' },
      { name:'Radiology', doctors:0, patients:120, appointments:22, status:'Operational' },
      { name:'Laboratory', doctors:0, patients:340, appointments:60, status:'Operational' },
    ],
  };
})();
