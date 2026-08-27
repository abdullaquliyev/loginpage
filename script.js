/**
 * Aura Auth - Client-side Logic & Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const tabGlider = document.getElementById('tabGlider');
  const loginTabBtn = document.getElementById('loginTabBtn');
  const registerTabBtn = document.getElementById('registerTabBtn');
  const formsSlider = document.getElementById('formsSlider');
  
  // Forms
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotForm');
  
  // Buttons
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const regSubmitBtn = document.getElementById('regSubmitBtn');
  const forgotSubmitBtn = document.getElementById('forgotSubmitBtn');
  const resetAuthBtn = document.getElementById('resetAuthBtn');
  
  // Password Strength & Toggles
  const regPassword = document.getElementById('regPassword');
  const passwordStrength = document.getElementById('passwordStrength');
  const strengthText = document.getElementById('strengthText');
  const passwordToggles = document.querySelectorAll('.password-toggle');
  
  // Modal Elements
  const forgotModal = document.getElementById('forgotModal');
  const openForgotModalBtn = document.getElementById('openForgotModal');
  const closeForgotModalBtn = document.getElementById('closeForgotModal');
  
  // Success Screen
  const successScreen = document.getElementById('successScreen');
  const successTitle = document.getElementById('successTitle');
  const successDesc = document.getElementById('successDesc');

  // Ambient Blobs for Parallax
  const blob1 = document.getElementById('blob1');
  const blob2 = document.getElementById('blob2');
  const blob3 = document.getElementById('blob3');

  /* ==========================================================================
     1. Tab Switching System (Daxil Ol / Qeydiyyat)
     ========================================================================== */
  function switchTab(target) {
    if (target === 'register') {
      tabGlider.style.transform = 'translateX(100%)';
      loginTabBtn.classList.remove('active');
      registerTabBtn.classList.add('active');
      formsSlider.style.transform = 'translateX(-50%)';
    } else {
      tabGlider.style.transform = 'translateX(0%)';
      registerTabBtn.classList.remove('active');
      loginTabBtn.classList.add('active');
      formsSlider.style.transform = 'translateX(0%)';
    }
  }

  loginTabBtn.addEventListener('click', () => switchTab('login'));
  registerTabBtn.addEventListener('click', () => switchTab('register'));

  /* ==========================================================================
     2. Password Show / Hide Toggle
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
     3. Password Strength Checker
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

  regPassword.addEventListener('input', (e) => {
    const val = e.target.value;
    const result = calculatePasswordStrength(val);

    passwordStrength.className = 'password-strength-container ' + result.level;
    strengthText.textContent = result.text;
  });

  /* ==========================================================================
     4. Form Validation & Helpers
     ========================================================================== */
  function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const wrapper = input ? input.closest('.input-wrapper') : null;
    const errorEl = document.getElementById(errorId);

    if (wrapper) wrapper.classList.add('has-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const wrapper = input ? input.closest('.input-wrapper') : null;
    const errorEl = document.getElementById(errorId);

    if (wrapper) wrapper.classList.remove('has-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  // Clear errors on user input
  ['loginEmail', 'loginPassword', 'regName', 'regEmail', 'regPassword', 'forgotEmail'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        clearError(id, id + 'Error');
      });
    }
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ==========================================================================
     5. Toast Notification System
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

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, 4000);
  }

  /* ==========================================================================
     6. Login Form Submission
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

    // Simulate API Request
    loginSubmitBtn.classList.add('loading');
    loginSubmitBtn.disabled = true;

    setTimeout(() => {
      loginSubmitBtn.classList.remove('loading');
      loginSubmitBtn.disabled = false;

      // Show success
      showToast('Uğurlu Giriş!', 'Sistemə daxil olursunuz...', 'success');
      
      successTitle.textContent = 'Xoş Gəldiniz!';
      successDesc.textContent = `Hesabınıza (${emailVal}) uğurla daxil oldunuz. İdarəetmə panelinə yönləndirilirsiniz...`;
      successScreen.classList.add('active');
    }, 1200);
  });

  /* ==========================================================================
     7. Register Form Submission
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
    } else {
      const termsError = document.getElementById('regTermsError');
      if (termsError) termsError.classList.remove('visible');
    }

    if (hasError) return;

    // Simulate API Request
    regSubmitBtn.classList.add('loading');
    regSubmitBtn.disabled = true;

    setTimeout(() => {
      regSubmitBtn.classList.remove('loading');
      regSubmitBtn.disabled = false;

      showToast('Qeydiyyat Uğurlu!', 'Hesabınız aktivləşdirildi.', 'success');
      
      successTitle.textContent = `Salam, ${nameVal}!`;
      successDesc.textContent = 'Qeydiyyatınız uğurla tamamlandı. Aura platformasına xoş gəldiniz!';
      successScreen.classList.add('active');
    }, 1400);
  });

  // Checkbox terms change clear error
  document.getElementById('regTerms').addEventListener('change', (e) => {
    if (e.target.checked) {
      const termsError = document.getElementById('regTermsError');
      if (termsError) termsError.classList.remove('visible');
    }
  });

  /* ==========================================================================
     8. Reset / Back to Auth Screen
     ========================================================================== */
  resetAuthBtn.addEventListener('click', () => {
    successScreen.classList.remove('active');
    loginForm.reset();
    registerForm.reset();
    passwordStrength.className = 'password-strength-container';
    strengthText.textContent = 'Şifrə gücü: Daxil edilməyib';
  });

  /* ==========================================================================
     9. Forgot Password Modal Handling
     ========================================================================== */
  function openModal() {
    forgotModal.classList.add('active');
  }

  function closeModal() {
    forgotModal.classList.remove('active');
    forgotForm.reset();
    clearError('forgotEmail', 'forgotEmailError');
  }

  openForgotModalBtn.addEventListener('click', openModal);
  closeForgotModalBtn.addEventListener('click', closeModal);

  forgotModal.addEventListener('click', (e) => {
    if (e.target === forgotModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && forgotModal.classList.contains('active')) {
      closeModal();
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
      closeModal();
      showToast('Bərpa Linki Göndərildi', `${emailVal} ünvanına təlimat göndərildi.`, 'info');
    }, 1200);
  });

  /* ==========================================================================
     10. Social Login Simulation
     ========================================================================== */
  ['googleLoginBtn', 'githubLoginBtn', 'appleLoginBtn'].forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const provider = btn.querySelector('span').textContent;
      showToast(`${provider} ilə Əlaqə`, 'Sosial hesabınızla təhlükəsiz giriş edilir...', 'info');

      setTimeout(() => {
        successTitle.textContent = `${provider} ilə Giriş Edildi`;
        successDesc.textContent = `${provider} hesabınız uğurla təsdiqləndi. Xoş gəldiniz!`;
        successScreen.classList.add('active');
      }, 1000);
    });
  });

  /* ==========================================================================
     11. Interactive Mouse Parallax Effect on Ambient Blobs
     ========================================================================== */
  window.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const moveX = (clientX - centerX) / 40;
    const moveY = (clientY - centerY) / 40;

    if (blob1) blob1.style.transform = `translate(${moveX * 1.5}px, ${moveY * 1.5}px)`;
    if (blob2) blob2.style.transform = `translate(${-moveX * 1.2}px, ${-moveY * 1.2}px)`;
    if (blob3) blob3.style.transform = `translate(${moveX * 0.8}px, ${-moveY * 0.8}px)`;
  });
});
