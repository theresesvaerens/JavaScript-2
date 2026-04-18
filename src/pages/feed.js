/**
 * @module pages/feed
 * @description Renders the main post feed page.
 */

import { getPosts } from "../api/posts.js";
import { createPostCard } from "../components/postCard.js";
import { renderLoader, renderEmpty, showToast } from "../utils/helpers.js";

/**
 * Renders the feed page into the given container.
 *
 * @param {HTMLElement} container - The DOM element to render into.
 * @param {Function} onEditPost - Callback to open the post editor for a given post.
 * @param {Function} onProfileClick - Callback when an author name is clicked.
 */
export async function renderFeedPage(container, onEditPost, onProfileClick) {
  container.innerHTML = `
    <div class="feed-page">
      <div class="feed-header">
        <h1>Your Feed</h1>
      </div>
      <div id="posts-list" class="posts-list"></div>
      <div id="load-more-wrap" style="text-align:center;padding:24px 0;"></div>
    </div>`;

  const list = container.querySelector("#posts-list");
  const loadMoreWrap = container.querySelector("#load-more-wrap");
  let page = 1;

  renderLoader(list);

  try {
    const posts = await getPosts(page);
    list.innerHTML = "";

    if (!posts.length) {
      renderEmpty(list, "📭", "No posts yet. Be the first to share!");
      return;
    }

    posts.forEach((post) => {
      list.appendChild(createPostCard(post, onEditPost, () => {}, onProfileClick));
    });

    if (posts.length === 12) {
      const btn = document.createElement("button");
      btn.className = "btn btn-ghost";
      btn.textContent = "Load more";
      loadMoreWrap.appendChild(btn);
      btn.addEventListener("click", async () => {
        btn.textContent = "Loading…";
        btn.disabled = true;
        page++;
        try {
          const more = await getPosts(page);
          more.forEach((post) => {
            list.appendChild(createPostCard(post, onEditPost, () => {}, onProfileClick));
          });
          if (more.length < 12) btn.remove();
          else { btn.textContent = "Load more"; btn.disabled = false; }
        } catch (err) {
          showToast(err.message, "error");
          btn.textContent = "Load more";
          btn.disabled = false;
        }
      });
    }
  } catch (err) {
    renderEmpty(list, "⚠️", `Failed to load posts: ${err.message}`);
  }
}