import { User } from '../types';

// SECURITY WARNING: This is a mock authentication service.
// Storing passwords, even in a "hashed" form (here, plaintext for simplicity),
// in localStorage is extremely insecure and should NEVER be done in a real application.
// This is for demonstration purposes only within a client-side-only context.

const USER_CREDENTIALS_KEY = 'musicFlowUserCredentials';
const USER_SESSION_KEY = 'musicFlowUserSession';

// This is the structure we'll store in localStorage, containing sensitive info.
interface StoredUser {
  username: string;
  passwordHash: string; // Plaintext in this mock
  recoveryPasswordHash: string; // Plaintext in this mock
}

/**
 * Checks if a user has been created in the application.
 */
export const hasUser = (): boolean => {
  try {
    return !!localStorage.getItem(USER_CREDENTIALS_KEY);
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return false;
  }
};

/**
 * Creates a new user account.
 * @returns A promise that resolves to true on success, false on failure.
 */
export const signUp = async (username: string, password: string, recoveryPassword: string): Promise<boolean> => {
  if (hasUser()) {
    console.error("A user already exists. This mock service only supports one user.");
    return false;
  }
  
  const newUser: StoredUser = {
    username,
    passwordHash: password, // Storing plaintext - INSECURE
    recoveryPasswordHash: recoveryPassword, // Storing plaintext - INSECURE
  };

  try {
    localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(newUser));
    return true;
  } catch (error) {
    console.error("Failed to save user credentials:", error);
    return false;
  }
};

/**
 * Logs in a user.
 * @returns A promise that resolves with the User object on success, or null on failure.
 */
export const login = async (username: string, password: string): Promise<User | null> => {
  try {
    const storedCredentialsJson = localStorage.getItem(USER_CREDENTIALS_KEY);
    if (!storedCredentialsJson) return null;

    const storedUser: StoredUser = JSON.parse(storedCredentialsJson);
    
    // In a real app, you'd compare password hashes here.
    if (storedUser.username.toLowerCase() === username.toLowerCase() && storedUser.passwordHash === password) {
      const userSession: User = {
        name: storedUser.username,
        email: `${storedUser.username}@example.com`, // Mock email
        picture: `https://i.pravatar.cc/150?u=${storedUser.username}`,
      };
      // Store a session object to indicate the user is logged in
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userSession));
      return userSession;
    }
    
    return null;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};

/**
 * Resets the user's password using the recovery password.
 * @returns A promise that resolves to true on success, false on failure.
 */
export const recoverPassword = async (username: string, recoveryPassword: string, newPassword: string): Promise<boolean> => {
   try {
    const storedCredentialsJson = localStorage.getItem(USER_CREDENTIALS_KEY);
    if (!storedCredentialsJson) return false;

    const storedUser: StoredUser = JSON.parse(storedCredentialsJson);
    
    if (storedUser.username.toLowerCase() === username.toLowerCase() && storedUser.recoveryPasswordHash === recoveryPassword) {
      const updatedUser: StoredUser = {
        ...storedUser,
        passwordHash: newPassword, // Storing plaintext - INSECURE
      };
      localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(updatedUser));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Password recovery error:", error);
    return false;
  }
};


/**
 * Signs the user out by removing their session data.
 */
export const signOut = (): void => {
  try {
    localStorage.removeItem(USER_SESSION_KEY);
  } catch (error) {
    console.error("Failed to remove user session from localStorage:", error);
  }
};

/**
 * Retrieves the current user session from localStorage.
 * @returns The user object if found, otherwise null.
 */
export const getCurrentUser = (): User | null => {
  try {
    const userJson = localStorage.getItem(USER_SESSION_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Failed to retrieve user from localStorage:", error);
    return null;
  }
};
