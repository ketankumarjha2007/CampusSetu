import { getAuth } from 'firebase/auth';

const API_BASE_URL = 'http://10.32.95.1:5000/api';

/**
 * Get the currently authenticated Firebase user's ID token.
 */
export const getFirebaseToken = async () => {
  const auth = getAuth();

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

/**
 * Make an authenticated request to the CampusSetu backend.
 */
export const apiRequest = async (
  endpoint,
  options = {}
) => {
  try {
    const token = await getFirebaseToken();

    const url = `${API_BASE_URL}${endpoint}`;

    console.log('API: Calling:', url);

    const response = await fetch(url, {
      ...options,

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    console.log(
      'API: Response status:',
      response.status
    );

    const responseText = await response.text();

    console.log(
      'API: Raw response:',
      responseText
    );

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(
        `Server returned invalid JSON. Status: ${response.status}`
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          `API request failed with status ${response.status}`
      );
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

/**
 * Get the authenticated user's MongoDB profile.
 *
 * The backend will automatically create the user
 * if this Firebase UID does not exist yet.
 */
export const getCurrentUser = async () => {
  console.log(
    'API: Fetching current CampusSetu user...'
  );

  return await apiRequest('/users/me');
};