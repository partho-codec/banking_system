/**
 * Apex Banking - Central API Client & UI Helpers
 */

const API_BASE = '/api';

// Authentication Storage Helpers
const Auth = {
  getToken() {
    return localStorage.getItem('apex_token');
  },
  setToken(token) {
    localStorage.setItem('apex_token', token);
  },
  getUser() {
    try {
      const user = localStorage.getItem('apex_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem('apex_user', JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem('apex_token');
    localStorage.removeItem('apex_user');
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  logout() {
    this.clear();
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 400);
  },
  requireAuth(requiredRole = null) {
    const token = this.getToken();
    const user = this.getUser();

    if (!token || !user) {
      window.location.href = '/login.html';
      return false;
    }

    if (requiredRole && user.role !== requiredRole) {
      if (user.role === 'admin') {
        window.location.href = '/admin.html';
      } else {
        window.location.href = '/dashboard.html';
      }
      return false;
    }

    return true;
  }
};

/**
 * Universal Fetch Wrapper
 */
async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const token = Auth.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        Auth.clear();
        if (!window.location.pathname.includes('login.html')) {
          showToast(data.message || 'Session expired. Please log in.', 'error');
          setTimeout(() => {
            window.location.href = '/login.html';
          }, 800);
        }
      }
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <span style="font-size: 1.1rem;">${icons[type] || 'ℹ️'}</span>
    <div style="flex: 1; font-weight: 500;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Format currency to USD format
 */
function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(num);
}

/**
 * Format ISO date string
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Copy text to clipboard with toast notification
 */
async function copyToClipboard(text, label = 'Copied') {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`${label} to clipboard!`, 'success');
  } catch (err) {
    showToast('Failed to copy', 'error');
  }
}
