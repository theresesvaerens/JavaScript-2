/**
 * @module api/posts
 * @description CRUD operations and social interactions for posts.
 */

import { ENDPOINTS } from "./config.js";
import { apiFetch } from "./fetch.js";

/**
 * Fetches a paginated list of posts with author, comments, and reactions included.
 *
 * @param {number} [page=1] - The page number to fetch.
 * @param {number} [limit=12] - Number of posts per page.
 * @returns {Promise<Array>} Array of post objects.
 */
export async function getPosts(page = 1, limit = 12) {
  const url = `${ENDPOINTS.posts}?_author=true&_comments=true&_reactions=true&page=${page}&limit=${limit}`;
  return apiFetch(url);
}

/**
 * Fetches a single post by ID.
 *
 * @param {string|number} id - The post ID.
 * @returns {Promise<Object>} The post object with author, comments, reactions.
 */
export async function getPost(id) {
  const url = `${ENDPOINTS.posts}/${id}?_author=true&_comments=true&_reactions=true`;
  return apiFetch(url);
}

/**
 * Creates a new post.
 *
 * @param {Object} data - Post payload.
 * @param {string} data.title - Post title (required).
 * @param {string} [data.body] - Post body text.
 * @param {string[]} [data.tags] - Array of tag strings.
 * @param {Object} [data.media] - Media object with url and alt.
 * @returns {Promise<Object>} The created post.
 */
export async function createPost(data) {
  return apiFetch(ENDPOINTS.posts, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Updates an existing post by ID.
 *
 * @param {string|number} id - The post ID to update.
 * @param {Object} data - Updated post payload.
 * @returns {Promise<Object>} The updated post.
 */
export async function updatePost(id, data) {
  return apiFetch(`${ENDPOINTS.posts}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Deletes a post by ID.
 *
 * @param {string|number} id - The post ID to delete.
 * @returns {Promise<void>}
 */
export async function deletePost(id) {
  return apiFetch(`${ENDPOINTS.posts}/${id}`, { method: "DELETE" });
}

/**
 * Reacts to a post with an emoji symbol.
 *
 * @param {string|number} postId - The target post ID.
 * @param {string} symbol - A single emoji character (e.g. "👍").
 * @returns {Promise<Object>} The updated reaction data.
 */
export async function reactToPost(postId, symbol) {
  return apiFetch(`${ENDPOINTS.posts}/${postId}/react/${encodeURIComponent(symbol)}`, {
    method: "PUT",
  });
}

/**
 * Adds a comment to a post.
 *
 * @param {string|number} postId - The post to comment on.
 * @param {string} body - The comment text.
 * @returns {Promise<Object>} The created comment.
 */
export async function commentOnPost(postId, body) {
  return apiFetch(`${ENDPOINTS.posts}/${postId}/comment`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}