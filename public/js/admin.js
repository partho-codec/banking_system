/**
 * Admin Console Client Controller
 * Manages administrator oversight, user/account directory, and account freezing.
 */

let allUsers = [];

document.addEventListener('DOMContentLoaded', () => {
  // Enforce admin auth
  if (!Auth.requireAuth('admin')) {
    return;
  }

  const user = Auth.getUser();
  if (user) {
    document.getElementById('admin-name').textContent = user.name;
  }

  loadAdminUsers();
});

/**
 * Load all registered users and their account statuses
 */
async function loadAdminUsers() {
  const tbody = document.getElementById('users-table-body');
  try {
    const data = await apiFetch('/admin/users');
    if (data.success) {
      allUsers = data.users;
      renderUsersTable(allUsers);
      document.getElementById('user-count').textContent = allUsers.length;
    }
  } catch (error) {
    console.error('Failed to load users:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; color: var(--accent-rose); padding: 2rem;">
          Failed to load users: ${error.message}
        </td>
      </tr>
    `;
    showToast('Failed to load users directory', 'error');
  }
}

/**
 * Render users into table rows
 */
function renderUsersTable(users) {
  const tbody = document.getElementById('users-table-body');
  if (!users || users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          No registered users found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const isFrozen = u.account_status === 'frozen';
    const hasAccount = !!u.account_number;

    let actionButton = '';
    if (hasAccount) {
      if (isFrozen) {
        actionButton = `
          <button class="status-btn unfreeze" onclick="toggleAccountStatus(${u.account_id}, 'active')">
            Unfreeze
          </button>
        `;
      } else {
        actionButton = `
          <button class="status-btn freeze" onclick="toggleAccountStatus(${u.account_id}, 'frozen')">
            Freeze
          </button>
        `;
      }
    } else {
      actionButton = `<span style="color: var(--text-subtle); font-size: 0.75rem;">N/A</span>`;
    }

    return `
      <tr>
        <td class="mono">#${u.id}</td>
        <td><strong>${escapeHtml(u.name)}</strong></td>
        <td class="mono" style="color: var(--text-muted);">${escapeHtml(u.email)}</td>
        <td>
          <span class="badge ${u.role === 'admin' ? 'badge-role' : 'badge-active'}" style="font-size: 0.7rem;">
            ${u.role}
          </span>
        </td>
        <td class="mono">${u.account_number ? u.account_number : '<span style="color: var(--text-subtle)">None</span>'}</td>
        <td style="font-weight: 600; color: ${u.balance > 0 ? '#34d399' : 'inherit'}">
          ${u.balance !== null ? formatCurrency(u.balance) : '-'}
        </td>
        <td>
          <span class="badge badge-${u.kyc_status}">
            ${u.kyc_status}
          </span>
        </td>
        <td>
          ${u.account_status ? `
            <span class="badge badge-${u.account_status}">
              ${u.account_status}
            </span>
          ` : '-'}
        </td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${formatDate(u.created_at)}</td>
        <td>${actionButton}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Filter users table in real time
 */
function filterUsersTable() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const filtered = allUsers.filter(u => 
    u.name.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query) ||
    (u.account_number && u.account_number.toLowerCase().includes(query))
  );
  renderUsersTable(filtered);
}

/**
 * Toggle freeze/unfreeze on account
 */
async function toggleAccountStatus(accountId, newStatus) {
  try {
    const data = await apiFetch(`/admin/accounts/${accountId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });

    if (data.success) {
      showToast(`Account status changed to ${newStatus.toUpperCase()}`, 'success');
      loadAdminUsers();
    }
  } catch (error) {
    showToast(error.message || 'Failed to update account status', 'error');
  }
}

/**
 * Basic XSS string escaping
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
