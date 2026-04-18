/**
 * @module components/postModal
 * @description Handles the create/edit post modal logic.
 */

import { createPost, updatePost } from "../api/posts.js";
import { showToast } from "../utils/helpers.js";

/**
 * Opens the post modal in create mode.
 *
 * @param {Function} onSuccess - Called with the new post object after creation.
 */
export function openCreatePostModal(onSuccess) {
  const modal = document.getElementById("modal-post");
  const form = document.getElementById("post-form");
  document.getElementById("modal-post-title").textContent = "New Post";
  document.getElementById("submit-post-btn").textContent = "Publish";

  form.reset();
  form._editId = null;
  modal.classList.remove("hidden");

  setupPostForm(onSuccess);
}

/**
 * Opens the post modal in edit mode, pre-filled with existing post data.
 *
 * @param {Object} post - The post to edit.
 * @param {Function} onSuccess - Called with the updated post object after saving.
 */
export function openEditPostModal(post, onSuccess) {
  const modal = document.getElementById("modal-post");
  const form = document.getElementById("post-form");
  document.getElementById("modal-post-title").textContent = "Edit Post";
  document.getElementById("submit-post-btn").textContent = "Save changes";

  document.getElementById("post-title").value = post.title ?? "";
  document.getElementById("post-body").value = post.body ?? "";
  document.getElementById("post-tags").value = (post.tags ?? []).join(", ");
  document.getElementById("post-media").value = post.media?.url ?? "";
  form._editId = post.id;

  modal.classList.remove("hidden");
  setupPostForm(onSuccess);
}

function setupPostForm(onSuccess) {
  const form = document.getElementById("post-form");
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

 
  document.getElementById("modal-close-btn").onclick = closePostModal;
  document.getElementById("cancel-post-btn") &&
    (document.getElementById("cancel-post-btn").onclick = closePostModal);
  document.querySelector("#modal-post .modal-overlay").onclick = closePostModal;

  newForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = newForm.querySelector('[type="submit"]');
    const origText = btn.textContent;
    btn.textContent = "Saving…";
    btn.disabled = true;

    const tagsRaw = document.getElementById("post-tags").value.trim();
    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    const mediaUrl = document.getElementById("post-media").value.trim();
    const payload = {
      title: document.getElementById("post-title").value.trim(),
      body: document.getElementById("post-body").value.trim(),
      tags,
      ...(mediaUrl ? { media: { url: mediaUrl, alt: "" } } : {}),
    };

    try {
      let result;
      const editId = newForm._editId;
      if (editId) {
        result = await updatePost(editId, payload);
        showToast("Post updated!");
      } else {
        result = await createPost(payload);
        showToast("Post published!");
      }
      closePostModal();
      onSuccess(result);
    } catch (err) {
      showToast(err.message, "error");
      btn.textContent = origText;
      btn.disabled = false;
    }
  });
}

export function closePostModal() {
  document.getElementById("modal-post").classList.add("hidden");
}