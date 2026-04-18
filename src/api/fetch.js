/**
 * @module api/fetch
 * @description Authenticated fetch wrapper for the Noroff Social API.
 */

import { getToken, getApiKey } from "./config.js";

export async function apiFetch(url, options = {}) {
  const token = getToken();
  const apiKey = getApiKey();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(apiKey ? { "X-Noroff-API-Key": apiKey } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json?.errors?.[0]?.message ||
      json?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return json?.data ?? json;
}
