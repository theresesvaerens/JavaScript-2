/**
 * @module components/postCard
 * @description Renders a single post card with reactions, comments, and CRUD actions.
 */

import { reactToPost, commentOnPost, deletePost } from "../api/posts.js";
import { getCurrentUser } from "../api/config.js";
import { showToast, timeAgo, createAvatar } from "../utils/helpers.js";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export function createPostCard(post, onEdit, onDelete, onProfileClick) {
  const currentUser = getCurrentUser();
  const isOwner = currentUser && currentUser.name === post.author?.name;

  const card = document.createElement("div");
  card.className = "post-card";
  card.dataset.postId = post.id;

  const authorName = post.author?.name ?? "Unknown";
  const authorAvatar = post.author?.avatar?.url ?? null;

  const header = document.createElement("div");
  header.className = "post-card__header";
  const av = createAvatar(authorAvatar, authorName);
  const meta = document.createElement("div");
  meta.className = "post-card__meta";
  const authorEl = document.createElement("span");
  authorEl.className = "post-card__author";
  authorEl.textContent = `@${authorName}`;
  authorEl.addEventListener("click", () => onProfileClick(authorName));
  const timeEl = document.createElement("div");
  timeEl.className = "post-card__time";
  timeEl.textContent = post.created ? timeAgo(post.created) : "";
  meta.append(authorEl, timeEl);

  const actionsTop = document.createElement("div");
  actionsTop.className = "post-card__actions-top";
  if (isOwner) {
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-ghost btn-xs";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => onEdit(post));

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-danger btn-xs";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", async () => {
      if (!confirm("Delete this post?")) return;
      try {
        await deletePost(post.id);
        card.remove();
        showToast("Post deleted.");
        onDelete(post.id);
      } catch (err) {
        showToast(err.message, "error");
      }
    });
    actionsTop.append(editBtn, delBtn);
  }
  header.append(av, meta, actionsTop);

  card.append(header);

  return card;
}