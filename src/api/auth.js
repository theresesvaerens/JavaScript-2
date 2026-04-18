/**
 * @module api/auth
 * @description Authentication API calls: register, login, and API key creation.
 */

import { ENDPOINTS, saveAuth } from "./config.js";
import { apiFetch } from "./fetch.js";

/**
 * Registers a new user with the Noroff Social API.
 * Requires a @noroff.no or @stud.noroff.no email address.
 *
 * @param {Object} data - Registration payload.
 * @param {string} data.name - The username (no spaces, letters/numbers/underscore).
 * @param {string} data.email - Must be a @noroff.no or @stud.noroff.no email.
 * @param {string} data.password - Minimum 8 characters.
 * @returns {Promise<Object>} The created user profile data.
 * @throws {Error} If registration fails (e.g. email already taken, invalid format).
 */
export async function register(data) {
  return apiFetch(ENDPOINTS.register, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Logs in an existing user, retrieves an access token and API key,
 * then persists them to localStorage via saveAuth.
 *
 * @param {Object} data - Login credentials.
 * @param {string} data.email - The user's registered email.
 * @param {string} data.password - The user's password.
 * @returns {Promise<Object>} The logged-in user profile data.
 * @throws {Error} If login fails (wrong credentials, etc.).
 */
export async function login(data) {
  const result = await apiFetch(ENDPOINTS.login, {
    method: "POST",
    body: JSON.stringify(data),
  });

  const accessToken = result.accessToken;
  const user = result.data ?? result;

  const keyResult = await fetch(ENDPOINTS.apiKey, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ name: "SocialHub key" }),
  });

  const keyJson = await keyResult.json();
  const apiKey = keyJson?.data?.key ?? "";

  saveAuth(accessToken, apiKey, result);
  return result;
}