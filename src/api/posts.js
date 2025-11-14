import { request } from "./client.js";

export async function getPosts({ page = 1, limit = 10 } = {}) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    _author: "true",
    _comments: "true",
    _reactions: "true",
  }).toString();

  const res = await request(`/social/posts?${qs}`);
  return res.data || [];
}

export async function getPost(id) {
  const qs = "_author=true&_comments=true&_reactions=true";
  const res = await request(`/social/posts/${encodeURIComponent(id)}?${qs}`);
  return res.data;
}

export async function createPost(payload) {
  const res = await request("/social/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updatePost(id, payload) {
  const res = await request(`/social/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deletePost(id) {
  await request(`/social/posts/${encodeURIComponent(id)}`, { method: "DELETE" });
  return true;
}

export async function reactToPost(id, symbol = "❤️") {
  const res = await request(
    `/social/posts/${encodeURIComponent(id)}/react/${encodeURIComponent(symbol)}`,
    { method: "PUT" }
  );
  return res.data;
}

export async function listCommentsViaPost(id) {
  const post = await getPost(id);
  return post.comments || [];
}

export async function addComment(id, body) {
  const res = await request(`/social/posts/${encodeURIComponent(id)}/comment`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  return res.data;
}