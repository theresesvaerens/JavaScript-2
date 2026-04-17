/**
 * @module api/config
 * @description Central API configuration for the Noroff Social API
 */

export const API_BASE = "https://v2.api.noroff.dev";

export const SOCIAL_BASE = `${API_BASE}/social`;

export const ENDPOINTS = {
  register: `${API_BASE}/auth/register`,
    login: `${API_BASE}/auth/login`,
    posts: `${SOCIAL_BASE}/posts`,
    profiles: `${SOCIAL_BASE}/profiles`,
    };

    export function getToken() { 
        return localStorage.getItem("sh_token");
    }

    export function getApiKey() {
        return localStorage.getItem("sh_api_key");
    }

    export function getCurrentUser() {
        const raw = localStorage.getItem("sh_user");
        return raw ? JSON.parse(raw) : null;
    }

    export function saveAuth({ token, apiKey, user }) {
        localStorage.setItem("sh_token", token);
        localStorage.setItem("sh_api_key", apiKey);
        localStorage.setItem("sh_user", JSON.stringify(user));
    }

    export function clearAuth() {
        localStorage.removeItem("sh_token");
        localStorage.removeItem("sh_api_key");
        localStorage.removeItem("sh_user");
    }