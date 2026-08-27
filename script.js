/**
 * Aura Auth & Notes - Full Application Client-Side Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // DOM Elements - Auth & View Containers
  // =========================================================================
  const authContainer = document.getElementById('authContainer');
  const notesAppContainer = document.getElementById('notesAppContainer');
  
  // Auth Tab Elements
  const tabGlider = document.getElementById('tabGlider');
  const loginTabBtn = document.getElementById('loginTabBtn');
  const registerTabBtn = document.getElementById('registerTabBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  // Auth Buttons
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const regSubmitBtn = document.getElementById('regSubmitBtn');
  
  // Password Strength & Toggles
  const regPassword = document.getElementById('regPassword');
  const passwordStrength = document.getElementById('passwordStrength');
  const strengthText = document.getElementById('strengthText');
  const passwordToggles = document.querySelectorAll('.password-toggle');
  
  // Forgot Password Modal
  const forgotModal = document.getElementById('forgotModal');
  const openForgotModalBtn = document.getElementById('openForgotModal');
  const closeForgotModalBtn = document.getElementById('closeForgotModal');
  const forgotForm = document.getElementById('forgotForm');
  const forgotSubmitBtn = document.getElementById('forgotSubmitBtn');

  // =========================================================================
  // DOM Elements - Notes App Dashboard
  // =========================================================================
  const userAvatar = document.getElementById('userAvatar');
  const userDisplayName = document.getElementById('userDisplayName');
  const userEmailText = document.getElementById('userEmailText');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // Search & Filter Elements
  const notesSearchInput = document.getElementById('notesSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const categoryPills = document.querySelectorAll('.cat-pill');
  const notesStats = document.getElementById('notesStats');
  
  // Notes Grid & Empty State
  const notesGrid = document.getElementById('notesGrid');
  const emptyNotesState = document.getElementById('emptyNotesState');
  const emptyStateTitle = document.getElementById('emptyStateTitle');
  const emptyStateDesc = document.getElementById('emptyStateDesc');
  const emptyStateCreateBtn = document.getElementById('emptyStateCreateBtn');
  const openCreateNoteBtn = document.getElementById('openCreateNoteBtn');

  // Note Modal Elements
  const noteModal = document.getElementById('noteModal');
  const closeNoteModalBtn = document.getElementById('closeNoteModal');
  const cancelNoteModalBtn = document.getElementById('cancelNoteModalBtn');
  const noteForm = document.getElementById('noteForm');
  const noteModalTitle = document.getElementById('noteModalTitle');
  const noteModalSubtitle = document.getElementById('noteModalSubtitle');
  const noteEditId = document.getElementById('noteEditId');
  const noteTitleInput = document.getElementById('noteTitleInput');
  const noteCategorySelect = document.getElementById('noteCategorySelect');
  const notePinCheckbox = document.getElementById('notePinCheckbox');
  const noteContentInput = document.getElementById('noteContentInput');
  const saveNoteBtn = document.getElementById('saveNoteBtn');

  // Ambient Blobs for Parallax
  const blob1 = document.getElementById('blob1');
  const blob2 = document.getElementById('blob2');
  const blob3 = document.getElementById('blob3');

  // =========================================================================
  // Application State
  // =========================================================================
  let currentUser = null;
  let currentNotes = [];
  let activeCategory = 'all';
  let searchQuery = '';

  const CATEGORY_NAMES = {
    work: '💼 İş',
    personal: '👤 Şəxsi',
    idea: '💡 İdeya',
    study: '📚 Təhsil',
    urgent: '🔥 Təcili'
  };

  /* ==========================================================================
     1. Initialization & Session Management
     ========================================================================== */
  function initApp() {
    const savedUser = localStorage.getItem('aura_current_user');
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
        showNotesDashboard();
      } catch (err) {
        localStorage.removeItem('aura_current_user');
        showAuthScreen();
      }
    } else {
      showAuthScreen();
    }
  }

  function showAuthScreen() {
    authContainer.classList.remove('hidden');
    notesAppContainer.classList.add('hidden');
    currentUser = null;
  }

  function showNotesDashboard() {
    authContainer.classList.add('hidden');
    notesAppContainer.classList.remove('hidden');

    // Update user profile info
    const name = currentUser.name || currentUser.email.split('@')[0];
    userDisplayName.textContent = name;
    userEmailText.textContent = currentUser.email;
    userAvatar.textContent = name.charAt(0).toUpperCase();

    // Load notes for current user
    loadUserNotes();
  }

  /* ==========================================================================
     2. Tab Switching System (Daxil Ol / Qeydiyyat)
     ========================================================================== */
  function switchTab(target) {
    if (target === 'register') {
      tabGlider.style.transform = 'translateX(100%)';
      loginTabBtn.classList.remove('active');
      registerTabBtn.classList.add('active');
      loginForm.classList.remove('active');
      registerForm.classList.add('active');
    } else {
      tabGlider.style.transform = 'translateX(0%)';
      registerTabBtn.classList.remove('active');
      loginTabBtn.classList.add('active');
      registerForm.classList.remove('active');
      loginForm.classList.add('active');
    }
  }

  loginTabBtn.addEventListener('click', () => switchTab('login'));
  registerTabBtn.addEventListener('click', () => switchTab('register'));

  /* ==========================================================================
     3. Password Show / Hide Toggle
     ========================================================================== */
  passwordToggles.forEach(toggleBtn => {
    toggleBtn.addEventListener('click', () => {
      const targetInputId = toggleBtn.getAttribute('data-toggle');
      const input = document.getElementById(targetInputId);
      if (!input) return;

      const isPassword = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPassword ? 'text' : 'password');
      toggleBtn.classList.toggle('showing', isPassword);
    });
  });

  /* ==========================================================================
     4. Password Strength Checker
     ========================================================================== */
  function calculatePasswordStrength(pass) {
    let score = 0;
    if (!pass) return { score: 0, text: 'Şifrə daxil edilməyib', level: '' };

    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, text: 'Şifrə gücü: Zəif', level: 'strength-weak' };
      case 2:
        return { score: 2, text: 'Şifrə gücü: Orta', level: 'strength-fair' };
      case 3:
        return { score: 3, text: 'Şifrə gücü: Yaxşı', level: 'strength-good' };
      case 4:
        return { score: 4, text: 'Şifrə gücü: Çox Güclü', level: 'strength-strong' };
      default:
        return { score: 1, text: 'Şifrə gücü: Çox qısa', level: 'strength-weak' };
    }
  }

  if (regPassword) {
    regPassword.addEventListener('input', (e) => {
      const val = e.target.value;
      const result = calculatePasswordStrength(val);
      passwordStrength.className = 'password-strength-container ' + result.level;
      strengthText.textContent = result.text;
    });
  }

  /* ==========================================================================
     5. Validation & Helper Functions
     ========================================================================== */
  function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const wrapper = input ? input.closest('.input-wrapper, .textarea-wrapper') : null;
    const errorEl = document.getElementById(errorId);

    if (wrapper) wrapper.classList.add('has-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const wrapper = input ? input.closest('.input-wrapper, .textarea-wrapper') : null;
    const errorEl = document.getElementById(errorId);

    if (wrapper) wrapper.classList.remove('has-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  ['loginEmail', 'loginPassword', 'regName', 'regEmail', 'regPassword', 'forgotEmail', 'noteTitleInput', 'noteContentInput'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        clearError(id, id.replace('Input', '') + 'Error');
      });
    }
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ==========================================================================
     6. Toast Notification System
     ========================================================================== */
  function showToast(title, message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else {
      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, 3800);
  }

  /* ==========================================================================
     7. Login Submission
     ========================================================================== */
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailVal = document.getElementById('loginEmail').value.trim();
    const passwordVal = document.getElementById('loginPassword').value;

    let hasError = false;

    if (!emailVal) {
      showError('loginEmail', 'loginEmailError', 'Zəhmət olmasa email daxil edin');
      hasError = true;
    } else if (!isValidEmail(emailVal) && !emailVal.includes('@')) {
      showError('loginEmail', 'loginEmailError', 'Düzgün email formatı daxil edin');
      hasError = true;
    }

    if (!passwordVal) {
      showError('loginPassword', 'loginPasswordError', 'Şifrəni daxil edin');
      hasError = true;
    } else if (passwordVal.length < 6) {
      showError('loginPassword', 'loginPasswordError', 'Şifrə minimum 6 simvol olmalıdır');
      hasError = true;
    }

    if (hasError) return;

    loginSubmitBtn.classList.add('loading');
    loginSubmitBtn.disabled = true;

    setTimeout(() => {
      loginSubmitBtn.classList.remove('loading');
      loginSubmitBtn.disabled = false;

      currentUser = {
        email: emailVal,
        name: emailVal.split('@')[0]
      };
      localStorage.setItem('aura_current_user', JSON.stringify(currentUser));

      showToast('Xoş Gəldiniz!', 'Qeydlərinizə uğurla daxil oldunuz.', 'success');
      showNotesDashboard();
    }, 800);
  });

  /* ==========================================================================
     8. Register Submission
     ========================================================================== */
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameVal = document.getElementById('regName').value.trim();
    const emailVal = document.getElementById('regEmail').value.trim();
    const passwordVal = document.getElementById('regPassword').value;
    const termsChecked = document.getElementById('regTerms').checked;

    let hasError = false;

    if (!nameVal || nameVal.length < 3) {
      showError('regName', 'regNameError', 'Ad və soyad ən azı 3 hərf olmalıdır');
      hasError = true;
    }

    if (!emailVal || !isValidEmail(emailVal)) {
      showError('regEmail', 'regEmailError', 'Düzgün email ünvanı daxil edin');
      hasError = true;
    }

    if (!passwordVal || passwordVal.length < 8) {
      showError('regPassword', 'regPasswordError', 'Şifrə minimum 8 simvol olmalıdır');
      hasError = true;
    }

    if (!termsChecked) {
      const termsError = document.getElementById('regTermsError');
      if (termsError) {
        termsError.textContent = 'Qaydaları qəbul etməlisiniz';
        termsError.classList.add('visible');
      }
      hasError = true;
    }

    if (hasError) return;

    regSubmitBtn.classList.add('loading');
    regSubmitBtn.disabled = true;

    setTimeout(() => {
      regSubmitBtn.classList.remove('loading');
      regSubmitBtn.disabled = false;

      currentUser = {
        email: emailVal,
        name: nameVal
      };
      localStorage.setItem('aura_current_user', JSON.stringify(currentUser));

      showToast('Qeydiyyat Uğurlu!', `Salam, ${nameVal}! Hesabınız yaradıldı.`, 'success');
      showNotesDashboard();
    }, 900);
  });

  document.getElementById('regTerms').addEventListener('change', (e) => {
    if (e.target.checked) {
      const termsError = document.getElementById('regTermsError');
      if (termsError) termsError.classList.remove('visible');
    }
  });

  /* ==========================================================================
     9. Social Login Simulation
     ========================================================================== */
  ['googleLoginBtn', 'githubLoginBtn', 'appleLoginBtn'].forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const provider = btn.querySelector('span').textContent;
      showToast(`${provider} ilə Giriş`, 'Hesabınız təsdiqlənir...', 'info');

      setTimeout(() => {
        currentUser = {
          email: `user@${provider.toLowerCase()}.com`,
          name: `${provider} İstifadəçisi`
        };
        localStorage.setItem('aura_current_user', JSON.stringify(currentUser));
        showToast('Uğurlu Giriş!', `${provider} vasitəsilə daxil oldunuz.`, 'success');
        showNotesDashboard();
      }, 700);
    });
  });

  /* ==========================================================================
     10. Logout Handling
     ========================================================================== */
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('aura_current_user');
    currentUser = null;
    loginForm.reset();
    registerForm.reset();
    switchTab('login');
    showAuthScreen();
    showToast('Çıxış Edildi', 'Hesabınızdan uğurla çıxış etdiniz.', 'info');
  });

  /* ==========================================================================
     11. Notes Management (CRUD & LocalStorage)
     ========================================================================== */
  function getNotesStorageKey() {
    return `aura_notes_${currentUser.email}`;
  }

  function loadUserNotes() {
    const savedNotes = localStorage.getItem(getNotesStorageKey());
    if (savedNotes) {
      try {
        currentNotes = JSON.parse(savedNotes);
      } catch (err) {
        currentNotes = [];
      }
    } else {
      // Create initial starter notes for brand new users
      currentNotes = [
        {
          id: 'note_' + Date.now(),
          title: 'Aura Notes-a Xoş Gəldiniz! 🚀',
          content: 'Bu sizin şəxsi qeyd dəftərinizdir.\n\n• Yeni qeydlər əlavə edin\n• Kateqoriyalara görə təsnif edin\n• Mühüm qeydləri 📌 bərkidərək yuxarıda saxlayın\n• İstədiyiniz zaman redaktə edin və ya silin.',
          category: 'idea',
          isPinned: true,
          updatedAt: new Date().toISOString()
        },
        {
          id: 'note_' + (Date.now() + 1),
          title: 'Görüləcək İşlər Siyahısı 💼',
          content: '1. Layihə tələblərini analiz etmək\n2. Yeni interfeys dizaynını təsdiq etmək\n3. Qeyd dəftəri funksiyalarını sınaqdan keçirmək',
          category: 'work',
          isPinned: false,
          updatedAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      saveNotesToStorage();
    }
    renderNotes();
  }

  function saveNotesToStorage() {
    localStorage.setItem(getNotesStorageKey(), JSON.stringify(currentNotes));
  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (isToday) {
      return `Bu gün, ${hours}:${minutes}`;
    }

    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'];
    return `${date.getDate()} ${months[date.getMonth()]}, ${hours}:${minutes}`;
  }

  /* ==========================================================================
     12. Render Notes Grid
     ========================================================================== */
  function renderNotes() {
    notesGrid.innerHTML = '';

    // Filter by Category and Search
    let filtered = currentNotes.filter(note => {
      // Category filter
      if (activeCategory === 'pinned' && !note.isPinned) return false;
      if (activeCategory !== 'all' && activeCategory !== 'pinned' && note.category !== activeCategory) return false;

      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = note.title && note.title.toLowerCase().includes(q);
        const matchContent = note.content && note.content.toLowerCase().includes(q);
        if (!matchTitle && !matchContent) return false;
      }
      return true;
    });

    // Sort: Pinned first, then by date descending
    filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    // Update stats count
    notesStats.textContent = `${filtered.length} qeyd tapıldı`;

    // Handle Empty State
    if (filtered.length === 0) {
      emptyNotesState.classList.remove('hidden');
      if (searchQuery) {
        emptyStateTitle.textContent = `"${searchQuery}" üzrə heç nə tapılmadı`;
        emptyStateDesc.textContent = 'Axtarış sözünü dəyişdirin və ya təmizləyin.';
        emptyStateCreateBtn.classList.add('hidden');
      } else if (activeCategory === 'pinned') {
        emptyStateTitle.textContent = 'Bərkidilmiş qeyd yoxdur';
        emptyStateDesc.textContent = 'Mühüm qeydlərinizin üzərindəki 📌 düyməsini klikləyərək bərkidə bilərsiniz.';
        emptyStateCreateBtn.classList.add('hidden');
      } else {
        emptyStateTitle.textContent = 'Hələ heç bir qeydiniz yoxdur';
        emptyStateDesc.textContent = 'Fikirlərinizi və ya planlarınızı yadda saxlamaq üçün ilk qeydinizi yaradın.';
        emptyStateCreateBtn.classList.remove('hidden');
      }
      return;
    }

    emptyNotesState.classList.add('hidden');

    // Build Cards
    filtered.forEach(note => {
      const card = document.createElement('article');
      card.className = `note-card ${note.isPinned ? 'is-pinned' : ''}`;
      card.dataset.id = note.id;

      const categoryLabel = CATEGORY_NAMES[note.category] || 'Qeyd';

      card.innerHTML = `
        <div class="note-card-header">
          <span class="note-badge ${note.category}">${categoryLabel}</span>
          <button type="button" class="pin-btn ${note.isPinned ? 'pinned' : ''}" data-id="${note.id}" title="${note.isPinned ? 'Bərkidilməni ləğv et' : 'Yuxarıda bərkit'}">
            <svg viewBox="0 0 24 24" fill="${note.isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M12 2l3 7h7l-5.5 4.5 2 7.5-6.5-5-6.5 5 2-7.5L2 9h7z"/>
            </svg>
          </button>
        </div>
        <h3 class="note-title">${escapeHTML(note.title)}</h3>
        <div class="note-content">${escapeHTML(note.content)}</div>
        <div class="note-card-footer">
          <span class="note-date">${formatDate(note.updatedAt)}</span>
          <div class="note-card-actions">
            <button type="button" class="card-action-btn edit-note" data-id="${note.id}" title="Redaktə et">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button type="button" class="card-action-btn delete delete-note" data-id="${note.id}" title="Sil">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>
        </div>
      `;

      notesGrid.appendChild(card);
    });

    // Attach card event listeners
    attachCardListeners();
  }

  function escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  function attachCardListeners() {
    // Pin button
    document.querySelectorAll('.pin-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        togglePinNote(id);
      });
    });

    // Edit button
    document.querySelectorAll('.edit-note').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const note = currentNotes.find(n => n.id === id);
        if (note) openNoteModal(note);
      });
    });

    // Delete button
    document.querySelectorAll('.delete-note').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        deleteNote(id);
      });
    });

    // Click anywhere on note card to edit
    document.querySelectorAll('.note-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const note = currentNotes.find(n => n.id === id);
        if (note) openNoteModal(note);
      });
    });
  }

  /* ==========================================================================
     13. Note Actions: Pin, Delete, Save
     ========================================================================== */
  function togglePinNote(id) {
    const note = currentNotes.find(n => n.id === id);
    if (!note) return;

    note.isPinned = !note.isPinned;
    note.updatedAt = new Date().toISOString();
    saveNotesToStorage();
    renderNotes();
    showToast(
      note.isPinned ? 'Qeyd Bərkidildi' : 'Bərkidilmə Ləğv Edildi',
      note.isPinned ? 'Qeyd siyahının ən yuxarısında göstəriləcək.' : 'Qeyd adi sıraya qaytarıldı.',
      'info'
    );
  }

  function deleteNote(id) {
    const note = currentNotes.find(n => n.id === id);
    if (!note) return;

    currentNotes = currentNotes.filter(n => n.id !== id);
    saveNotesToStorage();
    renderNotes();
    showToast('Qeyd Silindi', `"${note.title}" adlı qeyd silindi.`, 'info');
  }

  /* ==========================================================================
     14. Note Modal: Create & Edit Note
     ========================================================================== */
  function openNoteModal(note = null) {
    noteForm.reset();
    clearError('noteTitleInput', 'noteTitleError');
    clearError('noteContentInput', 'noteContentError');

    if (note) {
      noteModalTitle.textContent = 'Qeydi Redaktə Et';
      noteModalSubtitle.textContent = 'Mövcud qeydinizdə düzəlişlər edin.';
      noteEditId.value = note.id;
      noteTitleInput.value = note.title;
      noteCategorySelect.value = note.category || 'personal';
      notePinCheckbox.checked = !!note.isPinned;
      noteContentInput.value = note.content;
      saveNoteBtn.querySelector('.btn-text').textContent = 'Yenilə';
    } else {
      noteModalTitle.textContent = 'Yeni Qeyd Yarat';
      noteModalSubtitle.textContent = 'Fikirlərinizi, planlarınızı və ya mühüm məlumatlarınızı qeyd edin.';
      noteEditId.value = '';
      noteCategorySelect.value = activeCategory !== 'all' && activeCategory !== 'pinned' ? activeCategory : 'personal';
      notePinCheckbox.checked = false;
      saveNoteBtn.querySelector('.btn-text').textContent = 'Qeydi Yadda Saxla';
    }

    noteModal.classList.add('active');
    setTimeout(() => noteTitleInput.focus(), 150);
  }

  function closeNoteModal() {
    noteModal.classList.remove('active');
    noteForm.reset();
  }

  openCreateNoteBtn.addEventListener('click', () => openNoteModal(null));
  emptyStateCreateBtn.addEventListener('click', () => openNoteModal(null));
  closeNoteModalBtn.addEventListener('click', closeNoteModal);
  cancelNoteModalBtn.addEventListener('click', closeNoteModal);

  noteModal.addEventListener('click', (e) => {
    if (e.target === noteModal) closeNoteModal();
  });

  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleVal = noteTitleInput.value.trim();
    const contentVal = noteContentInput.value.trim();
    const categoryVal = noteCategorySelect.value;
    const isPinnedVal = notePinCheckbox.checked;
    const editId = noteEditId.value;

    let hasError = false;

    if (!titleVal) {
      showError('noteTitleInput', 'noteTitleError', 'Zəhmət olmasa qeyd başlığı daxil edin');
      hasError = true;
    }

    if (!contentVal) {
      showError('noteContentInput', 'noteContentError', 'Qeydin mətnini daxil edin');
      hasError = true;
    }

    if (hasError) return;

    if (editId) {
      // Update existing note
      const note = currentNotes.find(n => n.id === editId);
      if (note) {
        note.title = titleVal;
        note.content = contentVal;
        note.category = categoryVal;
        note.isPinned = isPinnedVal;
        note.updatedAt = new Date().toISOString();
        showToast('Qeyd Yeniləndi', 'Dəyişikliklər yadda saxlanıldı.', 'success');
      }
    } else {
      // Create new note
      const newNote = {
        id: 'note_' + Date.now(),
        title: titleVal,
        content: contentVal,
        category: categoryVal,
        isPinned: isPinnedVal,
        updatedAt: new Date().toISOString()
      };
      currentNotes.unshift(newNote);
      showToast('Yeni Qeyd Əlavə Edildi', 'Qeydiniz uğurla saxlanıldı.', 'success');
    }

    saveNotesToStorage();
    renderNotes();
    closeNoteModal();
  });

  /* ==========================================================================
     15. Filter & Search Controls
     ========================================================================== */
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-category');
      renderNotes();
    });
  });

  notesSearchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    if (searchQuery) {
      clearSearchBtn.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
    }
    renderNotes();
  });

  clearSearchBtn.addEventListener('click', () => {
    notesSearchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    renderNotes();
    notesSearchInput.focus();
  });

  /* ==========================================================================
     16. Forgot Password Modal Handling
     ========================================================================== */
  function openForgotModal() {
    forgotModal.classList.add('active');
  }

  function closeForgotModal() {
    forgotModal.classList.remove('active');
    forgotForm.reset();
    clearError('forgotEmail', 'forgotEmailError');
  }

  openForgotModalBtn.addEventListener('click', openForgotModal);
  closeForgotModalBtn.addEventListener('click', closeForgotModal);

  forgotModal.addEventListener('click', (e) => {
    if (e.target === forgotModal) closeForgotModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (forgotModal.classList.contains('active')) closeForgotModal();
      if (noteModal.classList.contains('active')) closeNoteModal();
    }
  });

  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailVal = document.getElementById('forgotEmail').value.trim();

    if (!emailVal || !isValidEmail(emailVal)) {
      showError('forgotEmail', 'forgotEmailError', 'Düzgün email ünvanı daxil edin');
      return;
    }

    forgotSubmitBtn.classList.add('loading');
    forgotSubmitBtn.disabled = true;

    setTimeout(() => {
      forgotSubmitBtn.classList.remove('loading');
      forgotSubmitBtn.disabled = false;
      closeForgotModal();
      showToast('Bərpa Linki Göndərildi', `${emailVal} ünvanına təlimat göndərildi.`, 'info');
    }, 1000);
  });

  /* ==========================================================================
     17. Ambient Parallax Mouse Movement
     ========================================================================== */
  window.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const moveX = (clientX - centerX) / 45;
    const moveY = (clientY - centerY) / 45;

    if (blob1) blob1.style.transform = `translate(${moveX * 1.5}px, ${moveY * 1.5}px)`;
    if (blob2) blob2.style.transform = `translate(${-moveX * 1.2}px, ${-moveY * 1.2}px)`;
    if (blob3) blob3.style.transform = `translate(${moveX * 0.8}px, ${-moveY * 0.8}px)`;
  });

  // =========================================================================
  // Bootstrap Application
  // =========================================================================
  initApp();
});
