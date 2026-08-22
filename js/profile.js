/* MEDICORE — profile.js */
const Profile = (() => {
  function init(){
    const user = Auth.currentUser();
    document.getElementById('profileAvatar').textContent = Utils.initials(user.name);
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileRole').textContent = Layout.roleLabel(user.role);
    document.getElementById('profileEmail').textContent = user.email;

    renderRoleFields(user.role);
    wireForm();
  }

  function renderRoleFields(role){
    const el = document.getElementById('roleSpecificFields');
    if (!el) return;
    if (role === 'patient'){
      el.innerHTML = `
        <div class="form-row"><div class="field"><label>Phone</label><input class="input" value="+234 801 234 5678"></div><div class="field"><label>Date of birth</label><input class="input" type="date" value="1992-04-12"></div></div>
        <div class="field"><label>Emergency contact</label><input class="input" value="Jamie Johnson · +234 801 999 1111"></div>`;
    } else if (role === 'doctor'){
      el.innerHTML = `
        <div class="form-row"><div class="field"><label>Specialty</label><input class="input" value="Cardiology"></div><div class="field"><label>Experience</label><input class="input" value="12 years"></div></div>
        <div class="field"><label>Availability</label><input class="input" value="Mon–Fri, 9:00 AM – 4:00 PM"></div>`;
    } else {
      el.innerHTML = `
        <div class="form-row"><div class="field"><label>Role</label><input class="input" value="System Administrator" disabled></div><div class="field"><label>Permissions</label><input class="input" value="Full access (demo)" disabled></div></div>
        <div class="field"><label>Recent activity</label><input class="input" value="Reviewed department report — 2h ago" disabled></div>`;
    }
  }

  function wireForm(){
    document.getElementById('profileForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      Notify.toast('Demo profile updated.', 'good');
    });
  }

  return { init };
})();
