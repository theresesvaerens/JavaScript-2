/**
 * @module pages/profile
 * @description Renders a user profile page with their posts and follow/unfollow.
 */

import { getProfile, getProfilePosts, followProfile, unfollowProfile, updateProfile } from "../api/profiles.js";
import { getCurrentUser } from "../api/config.js";
import { createPostCard } from "../components/postCard.js";
import { renderLoader, renderEmpty, showToast, createAvatar } from "../utils/helpers.js";

/**
 * Opens a modal for editing the current user's profile (bio, avatar, banner).
 *
 * @param {Object} profile - The current profile data to pre-fill the form.
 * @param {Function} onSave - Callback with the form payload when the user saves.
 */
function openEditProfileModal(profile, onSave) {

  let modal = document.getElementById("modal-edit-profile");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-edit-profile";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-box modal-box--sm">
        <div class="modal-header">
          <h2>Edit Profile</h2>
          <button class="modal-close" id="edit-profile-close">✕</button>
        </div>
        <form id="edit-profile-form">
          <div class="form-group">
            <label for="ep-bio">Bio</label>
            <textarea id="ep-bio" rows="3" placeholder="Tell people a bit about yourself…"></textarea>
          </div>
          <div class="form-group">
            <label for="ep-avatar">Avatar URL <span class="hint">(optional)</span></label>
            <input type="url" id="ep-avatar" placeholder="https://example.com/avatar.jpg" />
          </div>
          <div class="form-group">
            <label for="ep-banner">Banner URL <span class="hint">(optional)</span></label>
            <input type="url" id="ep-banner" placeholder="https://example.com/banner.jpg" />
          </div>
          <div class="form-actions">
            <button type="button" id="ep-cancel" class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
  }


  modal.querySelector("#ep-bio").value = profile.bio ?? "";
  modal.querySelector("#ep-avatar").value = profile.avatar?.url ?? "";
  modal.querySelector("#ep-banner").value = profile.banner?.url ?? "";
  modal.classList.remove("hidden");

  const close = () => modal.classList.add("hidden");
  modal.querySelector(".modal-overlay").onclick = close;
  modal.querySelector("#edit-profile-close").onclick = close;
  modal.querySelector("#ep-cancel").onclick = close;

  const form = modal.querySelector("#edit-profile-form");

  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  newForm.querySelector("#ep-cancel").onclick = close;
  newForm.querySelector("#edit-profile-close") &&
    (modal.querySelector("#edit-profile-close").onclick = close);

  newForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = newForm.querySelector('[type="submit"]');
    btn.textContent = "Saving…";
    btn.disabled = true;

    const avatarUrl = newForm.querySelector("#ep-avatar").value.trim();
    const bannerUrl = newForm.querySelector("#ep-banner").value.trim();
    const payload = {
      bio: newForm.querySelector("#ep-bio").value.trim(),
      ...(avatarUrl ? { avatar: { url: avatarUrl, alt: "avatar" } } : {}),
      ...(bannerUrl ? { banner: { url: bannerUrl, alt: "banner" } } : {}),
    };

    await onSave(payload);
    close();
  });
}

/**
 * Displays a profile page for the given username.
 *
 * @param {HTMLElement} container - The element to render into.
 * @param {string} username - The profile's username to display.
 * @param {Function} onEditPost - Callback for editing own posts.
 * @param {Function} onProfileClick - Callback when clicking another author.
 */
export async function renderProfilePage(container, username, onEditPost, onProfileClick) {
  container.innerHTML = `<div class="profile-page"><div class="loader"><div class="spinner"></div><p>Loading profile…</p></div></div>`;

  try {
    const [profile, posts] = await Promise.all([
      getProfile(username),
      getProfilePosts(username),
    ]);

    const currentUser = getCurrentUser();
    const isOwn = currentUser?.name === username;


    const isFollowing = profile.followers?.some((f) => f.name === currentUser?.name) ?? false;

    container.innerHTML = `
      <div class="profile-page">
        <div class="profile-banner">
          ${profile.banner?.url ? `<img src="${profile.banner.url}" alt="banner" onerror="this.parentElement.style.background='var(--surface-2)'" />` : ""}
        </div>
        <div class="profile-header">
          <div class="profile-avatar-wrap" id="profile-avatar-slot"></div>
          <div class="profile-name">${profile.name}</div>
          <div class="profile-handle">@${profile.name}</div>
          <div class="profile-stats">
            <div class="profile-stat">
              <strong>${posts.length}</strong> <span>Posts</span>
            </div>
            <div class="profile-stat">
              <strong>${profile._count?.followers ?? profile.followers?.length ?? 0}</strong> <span>Followers</span>
            </div>
            <div class="profile-stat">
              <strong>${profile._count?.following ?? profile.following?.length ?? 0}</strong> <span>Following</span>
            </div>
          </div>
          ${profile.bio ? `<p class="profile-bio">${profile.bio}</p>` : ""}
          <div class="profile-actions" id="profile-actions"></div>
        </div>
        <h2 class="profile-posts-title">Posts</h2>
        <div id="profile-posts-list" class="posts-list"></div>
      </div>`;

  
    const avatarSlot = container.querySelector("#profile-avatar-slot");
    const av = createAvatar(profile.avatar?.url ?? null, profile.name, "avatar--lg");
    avatarSlot.appendChild(av);

   
    const actionsEl = container.querySelector("#profile-actions");
    if (isOwn) {
      const editProfileBtn = document.createElement("button");
      editProfileBtn.className = "btn btn-ghost";
      editProfileBtn.textContent = "Edit Profile";
      editProfileBtn.addEventListener("click", () => {
        openEditProfileModal(profile, async (updatedData) => {
          try {
            await updateProfile(username, updatedData);
            showToast("Profile updated!");
            
            renderProfilePage(container, username, onEditPost, onProfileClick);
          } catch (err) {
            showToast(err.message, "error");
          }
        });
      });
      actionsEl.appendChild(editProfileBtn);
    } else {
      const followBtn = document.createElement("button");
      followBtn.className = isFollowing ? "btn btn-ghost" : "btn btn-primary";
      followBtn.textContent = isFollowing ? "Unfollow" : "Follow";
      let following = isFollowing;
      followBtn.addEventListener("click", async () => {
        followBtn.disabled = true;
        try {
          if (following) {
            await unfollowProfile(username);
            following = false;
            followBtn.textContent = "Follow";
            followBtn.className = "btn btn-primary";
            showToast(`Unfollowed @${username}`);
          } else {
            await followProfile(username);
            following = true;
            followBtn.textContent = "Unfollow";
            followBtn.className = "btn btn-ghost";
            showToast(`Following @${username}!`);
          }
        } catch (err) {
          showToast(err.message, "error");
        }
        followBtn.disabled = false;
      });
      actionsEl.appendChild(followBtn);
    }

 
    const postsList = container.querySelector("#profile-posts-list");
    if (!posts.length) {
      renderEmpty(postsList, "📝", "No posts yet.");
    } else {
      posts.forEach((post) => {
        postsList.appendChild(createPostCard(post, onEditPost, () => {}, onProfileClick));
      });
    }
  } catch (err) {
    container.innerHTML = `
      <div class="profile-page">
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <p>Failed to load profile: ${err.message}</p>
        </div>
      </div>`;
  }
}