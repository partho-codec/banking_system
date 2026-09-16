/**
 * Customer Dashboard Client Controller
 * Manages profile loading, live account stats, KYC submission, and profile/password modals.
 */

let currentAccount = null;
let currentUser = null;
let isBalanceHidden = false;

document.addEventListener('DOMContentLoaded', () => {
  // Enforce customer auth
  if (!Auth.requireAuth('customer')) {
    return;
  }

  // Live Clock
  updateClock();
  setInterval(updateClock, 30000);

  // Load User and Account Data
  loadDashboardData();
});

/**
 * Update real-time clock header
 */
function updateClock() {
  const timeEl = document.getElementById('current-datetime');
  if (timeEl) {
    const now = new Date();
    timeEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

/**
 * Load User Profile and Account from Backend API
 */
async function loadDashboardData() {
  try {
    const data = await apiFetch('/auth/profile');

    if (data.success) {
      currentUser = data.user;
      currentAccount = data.account;

      // Update header
      document.getElementById('user-header-name').textContent = currentUser.name;
      document.getElementById('welcome-name').textContent = currentUser.name;

      // Update Profile Details Card
      document.getElementById('prof-name').textContent = currentUser.name;
      document.getElementById('prof-email').textContent = currentUser.email;
      document.getElementById('prof-nid').textContent = currentUser.nid || 'Not Registered';
      document.getElementById('prof-phone').textContent = currentUser.phone || 'Not provided';
      document.getElementById('prof-address').textContent = currentUser.address || 'Not provided';
      document.getElementById('prof-created').textContent = formatDate(currentUser.created_at);

      // Pre-fill Profile Edit form
      document.getElementById('edit-name').value = currentUser.name || '';
      document.getElementById('edit-phone').value = currentUser.phone || '';
      document.getElementById('edit-address').value = currentUser.address || '';

      // Pre-fill KYC form
      document.getElementById('kyc-name').value = currentUser.name || '';
      document.getElementById('kyc-nid').value = currentUser.nid || '';
      document.getElementById('kyc-phone').value = currentUser.phone || '';
      document.getElementById('kyc-address').value = currentUser.address || '';

      // Update Account Card
      if (currentAccount) {
        document.getElementById('display-account-number').textContent = currentAccount.account_number;
        document.getElementById('display-account-type').textContent = currentAccount.account_type.toUpperCase();
        document.getElementById('spec-account-id').textContent = `#${currentAccount.id}`;
        
        renderBalance();

        const badge = document.getElementById('account-status-badge');
        badge.textContent = currentAccount.status.toUpperCase();
        badge.className = `badge badge-${currentAccount.status}`;
      } else {
        document.getElementById('display-account-number').textContent = 'No Account Found';
        document.getElementById('display-balance').textContent = '$0.00';
      }

      // Update KYC Banner
      updateKYCBanner(currentUser);
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showToast('Failed to load live account data', 'error');
  }
}

/**
 * Render Balance with optional masking
 */
function renderBalance() {
  const balanceEl = document.getElementById('display-balance');
  const toggleBtn = document.getElementById('btn-toggle-balance');

  if (!currentAccount) return;

  if (isBalanceHidden) {
    balanceEl.textContent = '••••••••';
    toggleBtn.textContent = '👁️ Show';
  } else {
    balanceEl.textContent = formatCurrency(currentAccount.balance);
    toggleBtn.textContent = '👁️ Hide';
  }
}

/**
 * Toggle hide/reveal of current balance
 */
function toggleBalanceMask() {
  isBalanceHidden = !isBalanceHidden;
  renderBalance();
}

/**
 * Copy account number to clipboard
 */
function copyAccountNumber() {
  if (currentAccount && currentAccount.account_number) {
    copyToClipboard(currentAccount.account_number, 'Account number copied');
  }
}

/**
 * Update KYC Banner state based on user status
 */
function updateKYCBanner(user) {
  const banner = document.getElementById('kyc-banner');
  const icon = document.getElementById('kyc-banner-icon');
  const title = document.getElementById('kyc-banner-title');
  const desc = document.getElementById('kyc-banner-desc');
  const actionBtn = document.getElementById('kyc-action-btn');

  if (user.kyc_status === 'verified') {
    banner.className = 'kyc-banner verified';
    icon.textContent = '🛡️';
    title.style.color = '#34d399';
    title.textContent = 'Identity Verified (KYC Compliance Active)';
    desc.textContent = `National ID Verified: ${user.nid || 'On File'}. All banking modules are cleared for transactions.`;
    actionBtn.textContent = 'View KYC Details';
    actionBtn.className = 'btn btn-secondary btn-sm';
  } else {
    banner.className = 'kyc-banner unverified';
    icon.textContent = '⚠️';
    title.style.color = '#fbbf24';
    title.textContent = 'KYC Verification Required';
    desc.textContent = 'Please submit your National ID and address details to complete regulatory compliance.';
    actionBtn.textContent = 'Verify Identity (KYC) →';
    actionBtn.className = 'btn btn-emerald btn-sm';
  }
}

/**
 * Refresh button handler
 */
function refreshDashboardData() {
  showToast('Refreshing account details...', 'info', 1500);
  loadDashboardData();
}

/**
 * Modal helpers
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Close modal on clicking outside dialog
 */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });
});

/**
 * Handle KYC Submission
 */
async function handleKYCSubmit(event) {
  event.preventDefault();
  const submitBtn = document.getElementById('kyc-submit-btn');

  const name = document.getElementById('kyc-name').value.trim();
  const nid = document.getElementById('kyc-nid').value.trim();
  const phone = document.getElementById('kyc-phone').value.trim();
  const address = document.getElementById('kyc-address').value.trim();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    const data = await apiFetch('/auth/kyc', {
      method: 'POST',
      body: JSON.stringify({ name, nid, phone, address })
    });

    if (data.success) {
      showToast('KYC information submitted and verified!', 'success');
      closeModal('modal-kyc');
      loadDashboardData();
    }
  } catch (error) {
    showToast(error.message || 'KYC submission failed.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit & Verify KYC';
  }
}

/**
 * Handle Profile Update
 */
async function handleProfileUpdate(event) {
  event.preventDefault();
  const submitBtn = document.getElementById('profile-submit-btn');

  const name = document.getElementById('edit-name').value.trim();
  const phone = document.getElementById('edit-phone').value.trim();
  const address = document.getElementById('edit-address').value.trim();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    const data = await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, phone, address })
    });

    if (data.success) {
      showToast('Profile updated successfully!', 'success');
      closeModal('modal-profile');
      loadDashboardData();
    }
  } catch (error) {
    showToast(error.message || 'Failed to update profile.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Changes';
  }
}

/**
 * Handle Password Reset
 */
async function handlePasswordReset(event) {
  event.preventDefault();
  const submitBtn = document.getElementById('pwd-submit-btn');

  const currentPassword = document.getElementById('pwd-current').value;
  const newPassword = document.getElementById('pwd-new').value;
  const confirmPassword = document.getElementById('pwd-confirm').value;

  if (newPassword.length < 6) {
    showToast('New password must be at least 6 characters.', 'warning');
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast('New passwords do not match.', 'error');
    return;
  }

  if (currentPassword === newPassword) {
    showToast('New password must be different from current password.', 'warning');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Updating...';

  try {
    const data = await apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (data.success) {
      showToast('Password updated successfully! Please keep it secure.', 'success');
      closeModal('modal-password');
      document.getElementById('pwd-current').value = '';
      document.getElementById('pwd-new').value = '';
      document.getElementById('pwd-confirm').value = '';
    }
  } catch (error) {
    showToast(error.message || 'Password update failed.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Update Password';
  }
}

/**
 * Module 2 Preview Notice
 */
function showModule2Notice(actionName) {
  showToast(`${actionName} is scheduled for Phase 2 (Transaction Module). Review Module 1 first!`, 'info', 4500);
}
