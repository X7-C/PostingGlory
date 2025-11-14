import { isAuthenticated, logoutUser, getUser } from "../api/auth.js";
import { getPost, createPost, updatePost, deletePost } from "../api/posts.js";
import { qs, formatDate } from "../utils/dom.js";

const statusEl = qs("#status");
const logoutBtn = qs("#logoutBtn");
const viewWrap = qs("#viewPost");
const form = qs("#postForm");
const formHeading = qs("#formHeading");

const vTitle = qs("#vTitle");
const vMeta = qs("#vMeta");
const vBody = qs("#vBody");
const vMedia = qs("#vMedia");
const vImg = qs("#vImg");
const vAlt = qs("#vAlt");
const ownerActions = qs("#ownerActions");
const editBtn = qs("#editBtn");
const deleteBtn = qs("#deleteBtn");

const fTitle = qs("#fTitle");
const fBody = qs("#fBody");
const fMediaUrl = qs("#fMediaUrl");
const fMediaAlt = qs("#fMediaAlt");

logoutBtn?.addEventListener("click", () => {
  logoutUser();
  window.location.href = "./login.html";
});

guardAuth();
init().catch(err => setStatus(err.message || "Failed to load"));

function guardAuth() {
  if (!isAuthenticated()) {
    window.location.href = "./login.html";
  }
}

function getId() {
  const u = new URL(window.location.href);
  return u.searchParams.get("id");
}

async function init() {
  const id = getId();

  if (!id) {
    formHeading.textContent = "New Post";
    form.hidden = false;
    viewWrap.hidden = true;
    form.addEventListener("submit", onCreate);
    return;
  }

  setStatus("Loading post…");
  const post = await getPost(id);
  clearStatus();

  renderView(post);

  const me = getUser();
  const amOwner = me && post?.author?.name === me.name;

  if (amOwner) {
    ownerActions.hidden = false;

    editBtn.addEventListener("click", () => enterEditMode(post));

    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Delete this post?")) return;

      try {
        await deletePost(post.id);
        window.location.href = "./feed.html";
      } catch (err) {
        setStatus(err.message || "Delete failed");
      }
    });
  }
}

function renderView(post) {
  form.hidden = true;
  viewWrap.hidden = false;

  vTitle.textContent = post.title || "(Untitled)";

  const authorName =
    post.author?.name ||
    post.owner?.name ||
    post.profile?.name ||
    "(unknown)";

  const created = post.created ? formatDate(post.created) : "";

  if (authorName && authorName !== "(unknown)") {
    const authorLink = `./profile.html?name=${encodeURIComponent(authorName)}`;
    vMeta.innerHTML = `by <a href="${authorLink}">${escapeHtml(
      authorName
    )}</a> — ${created}`;
  } else {
    vMeta.textContent = `by (unknown) — ${created}`;
  }

  vBody.textContent = post.body || "";

  if (post.media?.url) {
    vMedia.hidden = false;
    vImg.src = post.media.url;
    vImg.alt = post.media.alt || "";
    vAlt.textContent = post.media.alt || "";
  } else {
    vMedia.hidden = true;
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function enterEditMode(post) {
  viewWrap.hidden = true;
  form.hidden = false;
  formHeading.textContent = "Edit Post";

  fTitle.value = post.title || "";
  fBody.value = post.body || "";
  fMediaUrl.value = post.media?.url || "";
  fMediaAlt.value = post.media?.alt || "";

  form.addEventListener("submit", onUpdate(post.id), { once: true });
}

function onUpdate(id) {
  return async e => {
    e.preventDefault();
    setStatus("Saving…");

    const payload = collectPayload();

    try {
      const updated = await updatePost(id, payload);
      clearStatus();
      renderView(updated);
      ownerActions.hidden = false;
      form.hidden = true;
      viewWrap.hidden = false;
    } catch (err) {
      setStatus(err.message || "Update failed");
    }
  };
}

async function onCreate(e) {
  e.preventDefault();
  setStatus("Creating…");

  const payload = collectPayload();

  try {
    const created = await createPost(payload);
    clearStatus();
    window.location.href = `./post.html?id=${encodeURIComponent(created.id)}`;
  } catch (err) {
    setStatus(err.message || "Create failed");
  }
}

function collectPayload() {
  const title = fTitle.value.trim();
  const body = fBody.value.trim();
  const url = fMediaUrl.value.trim();
  const alt = fMediaAlt.value.trim();

  const payload = { title };

  if (body) payload.body = body;
  if (url) payload.media = { url, ...(alt ? { alt } : {}) };

  return payload;
}

function setStatus(text) {
  if (!statusEl) return;
  statusEl.textContent = text;
}

function clearStatus() {
  setStatus("");
}