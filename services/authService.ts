import { User } from '../types';

const USER_KEY = 'musicFlowUser';

// This is a mock/simulated Google Sign-In service.
// In a real application, this would use the Google Identity Services SDK.

const mockUser: User = {
  name: 'Kirey Arck',
  email: 'kirey.arck@example.com',
  picture: `https://i.pravatar.cc/150?u=kireyarck`,
};

/**
 * Simulates the Google Sign-In process.
 * @returns A promise that resolves with the mock user data.
 */
export const signInWithGoogle = (): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
        resolve(mockUser);
      } catch (error) {
        console.error("Failed to save user to localStorage:", error);
        // Still resolve with the user object so the app can function for this session
        resolve(mockUser);
      }
    }, 1000); // Simulate network delay
  });
};

/**
 * Signs the user out by removing their data from localStorage.
 */
export const signOut = (): void => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Failed to remove user from localStorage:", error);
  }
};

/**
 * Retrieves the current user from localStorage.
 * @returns The user object if found, otherwise null.
 */
export const getCurrentUser = (): User | null => {
  try {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Failed to retrieve user from localStorage:", error);
    return null;
  }
};