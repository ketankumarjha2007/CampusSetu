import Constants from 'expo-constants';
import { auth } from '../config/firebase';

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://192.168.1.20:5000/api';

export const getFirebaseToken = async () => {
  console.log(
    'API: Firebase current user:',
    auth.currentUser?.email || 'NO USER'
  );

  if (!auth.currentUser) {
    throw new Error(
      'No authenticated Firebase user found'
    );
  }

  const token =
    await auth.currentUser.getIdToken();

  console.log(
    'API: Firebase ID token obtained'
  );

  return token;
};

export const apiRequest = async (
  endpoint,
  options = {}
) => {
  try {
    const token =
      await getFirebaseToken();

    const url =
      `${API_BASE_URL}${endpoint}`;

    console.log(
      'API: Calling:',
      url
    );

    const isFormData =
      typeof FormData !== 'undefined' &&
      options.body instanceof FormData;

    console.log(
      'API: Request body type:',
      isFormData
        ? 'FormData'
        : 'JSON'
    );

    const headers = {
      ...(isFormData
        ? {}
        : {
            'Content-Type':
              'application/json',
          }),

      Authorization:
        `Bearer ${token}`,

      ...(options.headers || {}),
    };

    const response = await fetch(
      url,
      {
        ...options,
        headers,
      }
    );

    console.log(
      'API: Response status:',
      response.status
    );

    const responseText =
      await response.text();

    console.log(
      'API: Raw response:',
      responseText
    );

    let data;

    try {
      data =
        JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        'API: JSON parse error:',
        parseError
      );

      const error = new Error(
        `Server returned invalid JSON. Status: ${response.status}`
      );

      error.status =
        response.status;

      throw error;
    }

    if (!response.ok) {
      const error = new Error(
        data.message ||
          `API request failed with status ${response.status}`
      );

      // Preserve backend response so
      // screens can handle special cases
      // like duplicate complaints.
      error.status =
        response.status;

      error.data = data;

      throw error;
    }

    console.log(
      'API: Request successful:',
      data
    );

    return data;
  } catch (error) {
    console.error(
      'API: Request failed:',
      error.message
    );

    throw error;
  }
};

export const getCurrentUser =
  async () => {
    console.log(
      'API: Fetching current CampusSetu user...'
    );

    return await apiRequest(
      '/users/me'
    );
  };