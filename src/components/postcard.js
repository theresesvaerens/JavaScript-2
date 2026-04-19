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
  const commentBtn = document.createElement("button");
  commentBtn.className = "action-btn";
  const commentCount = post.comments?.length ?? post._count?.comments ?? 0;
  commentBtn.innerHTML = `💬 <span>${commentCount}</span>`;
  commentBtn.addEventListener("click", () => toggleCommentSection(card, post));

  footer.append(reactionBar, commentBtn);


  card.append(header, title);
  if (bodyEl) card.append(bodyEl);
  if (mediaEl) card.append(mediaEl);
  if (tagsEl) card.append(tagsEl);
  card.append(footer);

  if (post.comments?.length) {
    card.append(buildCommentsSection(post.comments, post.id, card));
  }

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


function toggleCommentSection(card, post) {
  let section = card.querySelector(".comments-section");
  if (section) {
    section.remove();
    return;
  }
  section = buildCommentsSection(post.comments ?? [], post.id, card);
  card.appendChild(section);
}


function buildCommentsSection(comments, postId, card) {
  const section = document.createElement("div");
  section.className = "comments-section";

  const title = document.createElement("h4");
  title.textContent = "Comments";
  section.appendChild(title);

  const commentsList = document.createElement("div");
  commentsList.className = "comments-list";

  comments.forEach((c) => {
    commentsList.appendChild(buildCommentItem(c));
  });

  if (!comments.length) {
    const empty = document.createElement("p");
    empty.style.cssText = "font-size:13px;color:var(--text-3);margin-bottom:10px;";
    empty.textContent = "No comments yet. Be the first!";
    commentsList.appendChild(empty);
  }

  section.appendChild(commentsList);

  const form = document.createElement("form");
  form.style.cssText = "display:flex;gap:8px;margin-top:8px;";
  const input = document.createElement("textarea");
  input.placeholder = "Add a comment…";
  input.rows = 1;
  input.style.cssText = "flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:6px;font-family:inherit;font-size:13px;resize:none;";
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "btn btn-primary btn-sm";
  submitBtn.textContent = "Post";
  form.append(input, submitBtn);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = input.value.trim();
    if (!body) return;
    submitBtn.disabled = true;
    try {
      const comment = await commentOnPost(postId, body);
      commentsList.appendChild(buildCommentItem(comment));
      input.value = "";
      const countEl = card.querySelector(".action-btn span");
      if (countEl) countEl.textContent = parseInt(countEl.textContent || "0") + 1;
    } catch (err) {
      showToast(err.message, "error");
    }
    submitBtn.disabled = false;
  });

  section.appendChild(form);
  return section;
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