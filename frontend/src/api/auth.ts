import { API_BASE_URL } from '../constants';
import type { AuthenticatedUser, AuthMode, AuthTokenResponse } from '../types';

interface AuthCredentials {
  userLoginId: string;
  password: string;
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { detail?: string };
    if (typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail;
    }
  } catch {
    // Ignore JSON parsing failures and use the fallback message.
  }

  return fallback;
}

export async function signupUser(credentials: AuthCredentials) {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_login_id: credentials.userLoginId,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to create user.'));
  }

  return (await response.json()) as AuthenticatedUser;
}

export async function loginUser(credentials: AuthCredentials) {
  const body = new URLSearchParams({
    username: credentials.userLoginId,
    password: credentials.password,
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/access-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to log in.'));
  }

  return (await response.json()) as AuthTokenResponse;
}

export async function fetchCurrentUser(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to load user.'));
  }

  return (await response.json()) as AuthenticatedUser;
}

export function getAuthSuccessMessage(mode: AuthMode, userLoginId: string) {
  return mode === 'signup'
    ? `Registered and logged in as ${userLoginId}.`
    : `Logged in as ${userLoginId}.`;
}
