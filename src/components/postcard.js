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

  
  const title = document.createElement("h3");
  title.className = "post-card__title";
  title.textContent = post.title;

  
  let bodyEl = null;
  if (post.body) {
    bodyEl = document.createElement("p");
    bodyEl.className = "post-card__body";
    bodyEl.textContent = post.body;
  }

  
  let mediaEl = null;
  if (post.media?.url) {
    mediaEl = document.createElement("img");
    mediaEl.className = "post-card__media";
    mediaEl.src = post.media.url;
    mediaEl.alt = post.media.alt ?? "";
    mediaEl.onerror = () => mediaEl.remove();
  }

  
  let tagsEl = null;
  if (post.tags?.length) {
    tagsEl = document.createElement("div");
    tagsEl.className = "post-card__tags";
    post.tags.forEach((tag) => {
      if (!tag) return;
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = `#${tag}`;
      tagsEl.appendChild(span);
    });
  }

  const footer = document.createElement("div");
  footer.className = "post-card__footer";

  const reactionBar = buildReactionBar(post, card);
  footer.append(reactionBar);


  card.append(header, title);
  if (bodyEl) card.append(bodyEl);
  if (mediaEl) card.append(mediaEl);
  if (tagsEl) card.append(tagsEl);
  card.append(footer);

  return card;
}

function buildReactionBar(post, card) {
  const bar = document.createElement("div");
  bar.className = "reaction-bar";

  const reactMap = {};
  (post.reactions ?? []).forEach((r) => {
    reactMap[r.symbol] = r.count;
  });

  EMOJIS.forEach((emoji) => {
    const btn = document.createElement("button");
    btn.className = "reaction-btn";
    const count = reactMap[emoji] ?? 0;
    btn.innerHTML = `${emoji} <span class="reaction-count">${count || ""}</span>`;
    btn.addEventListener("click", async () => {
      try {
        await reactToPost(post.id, emoji);
        const countEl = btn.querySelector(".reaction-count");
        const prev = parseInt(countEl.textContent || "0", 10);
        countEl.textContent = prev + 1;
        btn.classList.add("reacted");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
    bar.appendChild(btn);
  });

  return bar;
}

function buildCommentItem(comment) {
  const item = document.createElement("div");
  item.className = "comment-item";
  const av = createAvatar(comment.author?.avatar?.url ?? null, comment.author?.name ?? "?");
  av.style.width = "28px";
  av.style.height = "28px";
  av.style.fontSize = "11px";
  av.style.flexShrink = "0";
  const body = document.createElement("div");
  body.className = "comment-body";
  const author = document.createElement("div");
  author.className = "comment-author";
  author.textContent = `@${comment.author?.name ?? "Unknown"}`;
  const text = document.createElement("div");
  text.className = "comment-text";
  text.textContent = comment.body;
  body.append(author, text);
  item.append(av, body);
  return item;
}