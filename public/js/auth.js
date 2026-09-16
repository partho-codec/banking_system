/**
 * Authentication Client Controller
 * Handles form validation, role selection, JWT storage, and redirection.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check URL parameters for tab switching (?tab=register)
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab');
  if (tab === 'register') {
    switchAuthTab('register');
  }

  // Pre-fill demo credentials if set from index.html
  const quickEmail = sessionStorage.getItem('quick_email');
  const quickPass = sessionStorage.getItem('quick_pass');
  const quickRole = sessionStorage.getItem('quick_role');

  if (quickEmail && quickPass) {
    document.getElementById('login-email').value = quickEmail;
    document.getElementById('login-password').value = quickPass;
    if (quickRole) {
      const radio = document.querySelector(`input[name="login_role"][value="${quickRole}"]`);
      if (radio) radio.checked = true;
      updateLoginRoleDisplay();
    }
    // Clean up session storage
    sessionStorage.removeItem('quick_email');
    sessionStorage.removeItem('quick_pass');
    sessionStorage.removeItem('quick_role');
  }
});

/**
 * Switch between Login and Register tabs
 */
function switchAuthTab(targetTab) {
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');

  if (targetTab === 'register') {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
  } else {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  }
}

/**
 * Toggle password input visibility
 */
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🔒';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

/**
 * Update UI hints based on selected login role
 */
function updateLoginRoleDisplay() {
  const selectedRole = document.querySelector('input[name="login_role"]:checked').value;
  const title = document.getElementById('login-title');
  const submitBtn = document.getElementById('login-submit-btn');

  if (selectedRole === 'admin') {
    title.innerHTML = 'Administrator Portal';
    submitBtn.textContent = 'Access Admin Console →';
    submitBtn.className = 'btn btn-primary';
  } else {
    title.innerHTML = 'Customer Sign In';
    submitBtn.textContent = 'Sign In to Banking Portal →';
    submitBtn.className = 'btn btn-primary';
  }
}

/**
 * Clear validation error message on a field
 */
function clearError(fieldId) {
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
}

/**
 * Display validation error message on a field
 */
function setError(fieldId, message) {
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

/**
 * Handle Login Submission
 */
async function handleLoginSubmit(event) {
  event.preventDefault();
  clearError('login-email');
  clearError('login-password');

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const selectedRole = document.querySelector('input[name="login_role"]:checked').value;
  const submitBtn = document.getElementById('login-submit-btn');

  // Basic validation
  if (!email || !email.includes('@')) {
    setError('login-email', 'Please provide a valid email address.');
    return;
  }
  if (!password) {
    setError('login-password', 'Please enter your password.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Authenticating...';

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data.success) {
      Auth.setToken(data.token);
      Auth.setUser(data.user);

      showToast(`Welcome back, ${data.user.name}!`, 'success');

      setTimeout(() => {
        if (data.user.role === 'admin') {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/dashboard.html';
        }
      }, 700);
    }
  } catch (error) {
    showToast(error.message || 'Login failed. Please check credentials.', 'error');
    submitBtn.disabled = false;
    updateLoginRoleDisplay();
  }
}

/**
 * Handle Registration Submission
 */
async function handleRegisterSubmit(event) {
  event.preventDefault();
  ['reg-name', 'reg-email', 'reg-password', 'reg-confirm-password'].forEach(clearError);

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const role = document.getElementById('reg-role').value;
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;
  const submitBtn = document.getElementById('reg-submit-btn');

  let hasError = false;

  if (name.length < 2) {
    setError('reg-name', 'Name must be at least 2 characters.');
    hasError = true;
  }
  if (!email || !email.includes('@')) {
    setError('reg-email', 'Please enter a valid email address.');
    hasError = true;
  }
  if (password.length < 6) {
    setError('reg-password', 'Password must be at least 6 characters long.');
    hasError = true;
  }
  if (password !== confirmPassword) {
    setError('reg-confirm-password', 'Passwords do not match.');
    hasError = true;
  }

  if (hasError) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';

  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });

    if (data.success) {
      Auth.setToken(data.token);
      Auth.setUser(data.user);

      const msg = data.account 
        ? `Account #${data.account.accountNumber} opened successfully!`
        : 'User registered successfully!';

      showToast(msg, 'success');

      setTimeout(() => {
        if (data.user.role === 'admin') {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/dashboard.html';
        }
      }, 900);
    }
  } catch (error) {
    showToast(error.message || 'Registration failed. Please try again.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Complete Registration →';
  }
}
