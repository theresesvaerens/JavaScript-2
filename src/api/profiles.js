/**
 * @module api/profiles
 * @description Profile viewing and follow/unfollow operations.
 */

import { ENDPOINTS } from "./config.js";
import { apiFetch } from "./fetch.js";

/**
 * Fetches a user profile by username.
 *
 * @param {string} name - The profile username.
 * @returns {Promise<Object>} The profile data including follower/following counts.
 */
export async function getProfile(name) {
  return apiFetch(
    `${ENDPOINTS.profiles}/${name}?_followers=true&_following=true`
  );
}

/**
 * Fetches all posts by a specific profile.
 *
 * @param {string} name - The profile username.
 * @returns {Promise<Array>} Array of posts by that user.
 */
export async function getProfilePosts(name) {
  return apiFetch(
    `${ENDPOINTS.profiles}/${name}/posts?_author=true&_comments=true&_reactions=true`
  );
}

/**
 * Follows a user profile.
 *
 * @param {string} name - The username of the profile to follow.
 * @returns {Promise<Object>} The updated follow data.
 */
export async function followProfile(name) {
  return apiFetch(`${ENDPOINTS.profiles}/${name}/follow`, { method: "PUT" });
}

/**
 * Unfollows a user profile.
 *
 * @param {string} name - The username of the profile to unfollow.
 * @returns {Promise<Object>} The updated follow data.
 */
export async function unfollowProfile(name) {
  return apiFetch(`${ENDPOINTS.profiles}/${name}/unfollow`, { method: "PUT" });
}

/**
 * Updates the current user's profile with new bio, avatar, or banner.
 * Only the authenticated user can update their own profile.
 *
 * @param {string} name - The username of the profile to update (must be your own).
 * @param {Object} data - The fields to update.
 * @param {string} [data.bio] - A short bio or description.
 * @param {Object} [data.avatar] - Avatar image object with url and alt.
 * @param {Object} [data.banner] - Banner image object with url and alt.
 * @returns {Promise<Object>} The updated profile data.
 */
export async function updateProfile(name, data) {
  return apiFetch(`${ENDPOINTS.profiles}/${name}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}