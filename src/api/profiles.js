import { request } from "./client.js";

export async function getProfile(name) {
  const qs = "_followers=true&_following=true";
  const res = await request(
    `/social/profiles/${encodeURIComponent(name)}?${qs}`
  );
  return res.data;
}

export async function getUserPosts(name) {
  const qs = "_author=true&_comments=true&_reactions=true";
  const res = await request(
    `/social/profiles/${encodeURIComponent(name)}/posts?${qs}`
  );
  return res.data || [];
}

export async function followProfile(name) {
  const res = await request(
    `/social/profiles/${encodeURIComponent(name)}/follow`,
    { method: "PUT" }
  );
  return res.data;
}

export async function unfollowProfile(name) {
  const res = await request(
    `/social/profiles/${encodeURIComponent(name)}/unfollow`,
    { method: "PUT" }
  );
  return res.data;
}