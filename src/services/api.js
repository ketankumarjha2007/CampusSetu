import Constants from 'expo-constants';
import { auth } from '../config/firebase';

const API_BASE_URL = 'http://192.168.1.20:5000/api';

export const getFirebaseToken = async () => {
  console.log(
    'API: Firebase current user:',
    auth.currentUser?.email || 'NO USER'
  );

  if (!auth.currentUser) {
    throw new Error('No authenticated Firebase user found');
  }

  const token = await auth.currentUser.getIdToken();

  console.log('API: Firebase ID token obtained');

  return token;
};

/*
 * ==========================================
 * FORM-DATA UPLOAD VIA XMLHttpRequest
 * ==========================================
 *
 * Newer Expo SDKs replace the global fetch with expo/fetch,
 * which throws "Unsupported FormData part implementation" for
 * React Native file parts like { uri, name, type }.
 *
 * XMLHttpRequest uses React Native's own networking layer,
 * which fully supports those parts, so file uploads go through it.
 */
const sendFormData = (url, { method = 'POST', headers = {}, body }) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(method, url);
    xhr.timeout = 60000;

    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.onload = () => {
      resolve({
        status: xhr.status,
        ok: xhr.status >= 200 && xhr.status < 300,
        text: xhr.responseText,
      });
    };

    xhr.onerror = () => reject(new Error('Network request failed'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));

    xhr.send(body);
  });
};

export const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = await getFirebaseToken();

    const url = `${API_BASE_URL}${endpoint}`;

    console.log('API: Calling:', url);

    const isFormData =
      typeof FormData !== 'undefined' &&
      options.body instanceof FormData;

    console.log(
      'API: Request body type:',
      isFormData ? 'FormData' : 'JSON'
    );

    // Do NOT set Content-Type for FormData; the multipart
    // boundary must be generated automatically.
    const headers = {
      ...(isFormData
        ? {}
        : { 'Content-Type': 'application/json' }),

      Authorization: `Bearer ${token}`,

      ...(options.headers || {}),
    };

    let status;
    let ok;
    let responseText;

    if (isFormData) {
      const result = await sendFormData(url, {
        method: options.method || 'POST',
        headers,
        body: options.body,
      });

      status = result.status;
      ok = result.ok;
      responseText = result.text;
    } else {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      status = response.status;
      ok = response.ok;
      responseText = await response.text();
    }

    console.log('API: Response status:', status);
    console.log('API: Raw response:', responseText);

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('API: JSON parse error:', parseError);

      const error = new Error(
        `Server returned invalid JSON. Status: ${status}`
      );

      error.status = status;

      throw error;
    }

    if (!ok) {
      const error = new Error(
        data.message ||
          `API request failed with status ${status}`
      );

      // Preserve backend response so screens can handle
      // special cases like duplicate complaints.
      error.status = status;
      error.data = data;

      throw error;
    }

    console.log('API: Request successful:', data);

    return data;
  } catch (error) {
    console.error('API: Request failed:', error.message);

    throw error;
  }
};

export const getCurrentUser = async () => {
  console.log('API: Fetching current CampusSetu user...');

  return await apiRequest('/users/me');
};