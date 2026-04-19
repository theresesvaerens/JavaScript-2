/**
 * @module main
 * @description Application entry point. Manages routing, auth state, navbar, and mobile drawer.
 */

import { getToken, getCurrentUser, clearAuth } from "./api/config.js";
import { renderAuthPage } from "./pages/auth.js";
import { renderFeedPage } from "./pages/feed.js";
import { renderProfilePage } from "./pages/profile.js";
import { openCreatePostModal, openEditPostModal } from "./components/postModal.js";
import { showToast } from "./utils/helpers.js";

const main = document.getElementById("main-content");
const navbar = document.getElementById("navbar");

/** Current active view state */
let currentView = "feed";
let currentProfileName = null;

/**
 * Bootstraps the application by checking auth state and rendering the correct view.
 * If the user is authenticated, shows the main app; otherwise shows the auth page.
 */
function boot() {
  if (getToken()) {
    showApp();
  } else {
    navbar.classList.add("hidden");
    document.getElementById("mobile-drawer").classList.add("hidden");
    renderAuthPage(main, () => showApp());
  }
}


function showApp() {
  navbar.classList.remove("hidden");
  setupNavbar();
  setupDrawer();
  navigateTo("feed");
}


function setupNavbar() {
  document.getElementById("nav-feed").addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("feed");
  });

  document.getElementById("nav-profile").addEventListener("click", (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (user) navigateTo("profile", user.name);
  });

  document.getElementById("btn-new-post").addEventListener("click", () => {
    openCreatePostModal(() => navigateTo("feed"));
  });

  document.getElementById("btn-logout").addEventListener("click", () => {
    clearAuth();
    navbar.classList.add("hidden");
    showToast("Signed out.");
    renderAuthPage(main, () => showApp());
  });
}

/**
 * Sets up the mobile hamburger button and slide-in drawer.
 * The drawer mirrors all the desktop nav actions so mobile users
 * have access to the same features.
 */
function setupDrawer() {
  const hamburger = document.getElementById("hamburger");
  const drawer = document.getElementById("mobile-drawer");
  const overlay = document.getElementById("drawer-overlay");
  const closeBtn = document.getElementById("drawer-close");

  
  function openDrawer() {
    drawer.classList.remove("hidden");

    document.body.style.overflow = "hidden";
  }


  function closeDrawer() {
    drawer.classList.add("hidden");
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", openDrawer);
  overlay.addEventListener("click", closeDrawer);
  closeBtn.addEventListener("click", closeDrawer);

 
  document.getElementById("drawer-feed").addEventListener("click", (e) => {
    e.preventDefault();
    closeDrawer();
    navigateTo("feed");
  });

  document.getElementById("drawer-profile").addEventListener("click", (e) => {
    e.preventDefault();
    closeDrawer();
    const user = getCurrentUser();
    if (user) navigateTo("profile", user.name);
  });

  document.getElementById("drawer-new-post").addEventListener("click", (e) => {
    e.preventDefault();
    closeDrawer();
    openCreatePostModal(() => navigateTo("feed"));
  });

  document.getElementById("drawer-logout").addEventListener("click", (e) => {
    e.preventDefault();
    closeDrawer();
    clearAuth();
    navbar.classList.add("hidden");
    showToast("Signed out.");
    renderAuthPage(main, () => showApp());
  });
}

/**
 * Navigates to a named view, re-rendering main content accordingly.
 *
 * @param {"feed"|"profile"} view - The view name to navigate to.
 * @param {string} [param] - Optional parameter (e.g. username for profile view).
 */
function navigateTo(view, param) {
  currentView = view;
  currentProfileName = param ?? null;

  document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));

  if (view === "feed") {
    document.getElementById("nav-feed")?.classList.add("active");
    renderFeedPage(main, handleEditPost, handleProfileClick);
  } else if (view === "profile") {
    document.getElementById("nav-profile")?.classList.add("active");
    renderProfilePage(main, param, handleEditPost, handleProfileClick);
  }
}

function handleEditPost(post) {
  openEditPostModal(post, () => navigateTo(currentView, currentProfileName));
}

function handleProfileClick(username) {
  navigateTo("profile", username);
}

// Start the app
boot();