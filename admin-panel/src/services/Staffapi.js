import { auth } from '../firebase';

/*
 * IMPORTANT: use the SAME base URL your existing services/api.js uses
 * (the one that already serves getAllComplaints / addTeacher).
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

const request = async (path, options = {}) => {
  const user = auth.currentUser;

  if (!user) throw new Error('You are signed out. Please sign in again.');

  const token = await user.getIdToken();

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection.');
  }

  let data = {};

  try {
    data = await response.json();
  } catch {
    /* non-JSON body */
  }

  if (!response.ok) {
    const error = new Error(
      data.message || `Request failed with status ${response.status}`
    );
    error.status = response.status;
    throw error;
  }

  return data;
};

// Teachers, cluster heads and principals (with invite status)
export const getStaff = () => request('/staff');

// Creates the account and emails the set-password invitation
export const inviteStaff = (payload) =>
  request('/staff', { method: 'POST', body: JSON.stringify(payload) });

export const resendStaffInvite = (id) =>
  request(`/staff/${id}/resend-invite`, { method: 'POST' });

export const removeStaff = (id) =>
  request(`/staff/${id}`, { method: 'DELETE' });