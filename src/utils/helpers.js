/**
 * @module utils/toast
 * @description Toast notification system and shared UI helpers.
 */

/**
 * Displays a brief toast notification at the bottom-right of the screen.
 *
 * @param {string} message - The message to display in the toast.
 * @param {"success"|"error"} [type="success"] - Visual style of the toast.
 * @param {number} [duration=3000] - How long (ms) the toast stays visible.
 * @returns {void}
 */
export function showToast(message, type = "success", duration = 3000) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

/**
 * Formats an ISO date string into a relative time (e.g. "2h ago").
 *
 * @param {string} isoString - An ISO 8601 date string.
 * @returns {string} A relative time string such as "just now", "3m ago", or "Apr 1".
 */
export function timeAgo(isoString) {
  const date = new Date(isoString);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

/**
 * Returns a two-letter initials string from a name for use in avatar fallbacks.
 *
 * @param {string} name - A username or display name.
 * @returns {string} Up to two uppercase characters.
 */
export function initials(name = "") {
  return name.slice(0, 2).toUpperCase();
}

/**
 * Creates an avatar element — an image if src is provided, else initials.
 *
 * @param {string|null} src - Avatar image URL or null.
 * @param {string} name - Name used for initials fallback.
 * @param {string} [extraClass=""] - Additional CSS class names.
 * @returns {HTMLElement} A div representing the avatar.
 */
export function createAvatar(src, name, extraClass = "") {
  const el = document.createElement("div");
  el.className = `avatar ${extraClass}`;
  if (src) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = name;
    img.onerror = () => {
      img.remove();
      el.textContent = initials(name);
    };
    el.appendChild(img);
  } else {
    el.textContent = initials(name);
  }
  return el;
}


export function renderLoader(container) {
  container.innerHTML = `
    <div class="loader">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>`;
}


export function renderEmpty(container, icon, message) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <p>${message}</p>
    </div>`;
}