/* MEDICORE — auth.js
   DEMO AUTHENTICATION ONLY.
   There is no server, no password hashing, and no real account security
   here — this exists purely to let a portfolio viewer explore the three
   role experiences. Never enter real credentials. See README for the
   backend architecture this would require in production. */

const Auth = (() => {

  const DEFAULT_USERS = [
    { id:'u_patient', name:'Alex Johnson', email:'patient@medicore.demo', password:'demo1234', role:'patient' },
    { id:'u_doctor', name:'Dr. Amara Chen', email:'doctor@medicore.demo', password:'demo1234', role:'doctor' },
    { id:'u_admin', name:'Jordan Reyes', email:'admin@medicore.demo', password:'demo1234', role:'admin' },
  ];

  function ensureUsers(){
    if (!Storage.has('users')) Storage.set('users', DEFAULT_USERS);
  }

  function users(){ return Storage.get('users', DEFAULT_USERS); }

  function findByEmail(email){
    return users().find(u => u.email.toLowerCase() === String(email).toLowerCase());
  }

  function login(email, password){
    const user = findByEmail(email);
    if (!user) return { ok:false, error:'No demo account found with that email.' };
    if (user.password !== password) return { ok:false, error:'Incorrect demo password.' };
    setSession(user);
    return { ok:true, user };
  }

  function register({ name, email, password, role }){
    ensureUsers();
    if (findByEmail(email)) return { ok:false, error:'An account with that email already exists in this demo.' };
    const all = users();
    const user = { id: Utils.uid('u'), name, email, password, role };
    all.push(user);
    Storage.set('users', all);
    setSession(user);
    return { ok:true, user };
  }

  function setSession(user){
    Storage.set('session', { userId:user.id, name:user.name, email:user.email, role:user.role });
  }

  function currentUser(){
    ensureUsers();
    let session = Storage.get('session');
    if (!session){
      // Auto-demo session so a portfolio viewer landing on an inner page
      // still sees a populated experience without a forced redirect.
      const fallback = DEFAULT_USERS[0];
      setSession(fallback);
      session = Storage.get('session');
    }
    return session;
  }

  function switchRole(role){
    const session = currentUser();
    const match = DEFAULT_USERS.find(u => u.role === role) || DEFAULT_USERS[0];
    setSession({ ...match, name: session.name && session.role === role ? session.name : match.name });
  }

  function logout(){
    Storage.remove('session');
  }

  function isLoggedIn(){
    return Storage.has('session');
  }

  return { ensureUsers, users, login, register, currentUser, switchRole, logout, isLoggedIn };
})();
