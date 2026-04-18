/**
 * @module pages/auth
 * @description Renders the login and registration pages.
 */

import { login, register } from "../api/auth.js";
import { showToast } from "../utils/helpers.js";

/**
 * Renders the authentication page (login form by default).
 * Allows toggling between login and register views.
 *
 * @param {HTMLElement} container - The DOM element to render into.
 * @param {Function} onSuccess - Callback invoked after successful auth.
 */
export function renderAuthPage(container, onSuccess) {
  container.innerHTML = getLoginHTML();
  setupAuthListeners(container, onSuccess);
}

function getLoginHTML() {
  return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="logo">
          <span>◈</span> SocialHub
        </div>
        <p class="tagline">Connect, share, and discover.</p>
        <h2>Sign in</h2>
        <div id="auth-error" class="error-msg hidden"></div>
        <form id="login-form">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input type="email" id="login-email" placeholder="you@stud.noroff.no" required />
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input type="password" id="login-password" placeholder="••••••••" required />
          </div>
          <div class="form-actions" style="justify-content:stretch;">
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;">
              Sign in
            </button>
          </div>
        </form>
        <p class="auth-switch">
          No account? <a id="switch-to-register">Create one</a>
        </p>
      </div>
    </div>`;
}

function getRegisterHTML() {
  return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="logo">
          <span>◈</span> SocialHub
        </div>
        <p class="tagline">Join the community.</p>
        <h2>Create account</h2>
        <div id="auth-error" class="error-msg hidden"></div>
        <form id="register-form">
          <div class="form-group">
            <label for="reg-name">Username <span class="hint">(letters, numbers, underscore)</span></label>
            <input type="text" id="reg-name" placeholder="my_username" required pattern="^[a-zA-Z0-9_]+$" />
          </div>
          <div class="form-group">
            <label for="reg-email">Email <span class="hint">(@noroff.no or @stud.noroff.no)</span></label>
            <input type="email" id="reg-email" placeholder="you@stud.noroff.no" required />
          </div>
          <div class="form-group">
            <label for="reg-password">Password <span class="hint">(min 8 characters)</span></label>
            <input type="password" id="reg-password" placeholder="••••••••" required minlength="8" />
          </div>
          <div class="form-group">
            <label for="reg-avatar">Avatar URL <span class="hint">(optional)</span></label>
            <input type="url" id="reg-avatar" placeholder="https://example.com/avatar.jpg" />
          </div>
          <div class="form-actions" style="justify-content:stretch;">
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;">
              Create account
            </button>
          </div>
        </form>
        <p class="auth-switch">
          Already have an account? <a id="switch-to-login">Sign in</a>
        </p>
      </div>
    </div>`;
}

function setupAuthListeners(container, onSuccess) {
  container.addEventListener("click", (e) => {
    if (e.target.id === "switch-to-register") {
      container.innerHTML = getRegisterHTML();
      setupAuthListeners(container, onSuccess);
    }
    if (e.target.id === "switch-to-login") {
      container.innerHTML = getLoginHTML();
      setupAuthListeners(container, onSuccess);
    }
  });

  const loginForm = container.querySelector("#login-form");
  const registerForm = container.querySelector("#register-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('[type="submit"]');
      btn.textContent = "Signing in…";
      btn.disabled = true;
      clearError(container);
      try {
        await login({
          email: loginForm["login-email"].value.trim(),
          password: loginForm["login-password"].value,
        });
        showToast("Welcome back!");
        onSuccess();
      } catch (err) {
        showError(container, err.message);
        btn.textContent = "Sign in";
        btn.disabled = false;
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = registerForm.querySelector('[type="submit"]');
      btn.textContent = "Creating account…";
      btn.disabled = true;
      clearError(container);
      const avatarVal = registerForm["reg-avatar"].value.trim();
      const payload = {
        name: registerForm["reg-name"].value.trim(),
        email: registerForm["reg-email"].value.trim(),
        password: registerForm["reg-password"].value,
        ...(avatarVal ? { avatar: { url: avatarVal, alt: "avatar" } } : {}),
      };
      try {
        await register(payload);
        showToast("Account created! Please sign in.");
        container.innerHTML = getLoginHTML();
        setupAuthListeners(container, onSuccess);
      } catch (err) {
        showError(container, err.message);
        btn.textContent = "Create account";
        btn.disabled = false;
      }
    });
  }
}

function showError(container, msg) {
  const el = container.querySelector("#auth-error");
  if (el) { el.textContent = msg; el.classList.remove("hidden"); }
}
function clearError(container) {
  const el = container.querySelector("#auth-error");
  if (el) el.classList.add("hidden");
}
