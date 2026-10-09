import { auth } from '../firebase';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

export const apiRequest = async (endpoint, options = {}) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('Please sign in first.');
  }

  const token = await currentUser.getIdToken();

  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const responseText = await response.text();
  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Invalid server response (${response.status}). Check the backend URL.`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status})`
    );
  }

  return data;
};

// Fetch all complaints
export const getAllComplaints = async () => {
  return apiRequest('/issues/admin/all');
};

// Fetch active teachers
export const getActiveTeachers = async () => {
  return apiRequest('/issues/admin/teachers');
};

// Assign a complaint to a teacher
export const assignComplaint = async (complaintId, teacherId) => {
  return apiRequest(
    `/issues/${encodeURIComponent(complaintId)}/assign`,
    {
      method: 'PATCH',
      body: JSON.stringify({ teacherId }),
    }
  );
};
export const updateComplaintStatus = async (
  complaintId,
  status,
  resolutionNote = ''
) =>
  apiRequest(
    `/issues/${encodeURIComponent(complaintId)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        resolutionNote,
      }),
    }
  );