import { isAuthenticated, logoutUser } from "../api/auth.js";
import {
  getPosts,
  getPost,
  reactToPost,
  listCommentsViaPost,
  addComment
} from "../api/posts.js";
import { PostCard } from "../components/PostCard.js";

const postsGrid   = document.querySelector("#postsGrid");
const statusEl    = document.querySelector("#status");
const searchForm  = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const prevBtn     = document.querySelector("#prevBtn");
const nextBtn     = document.querySelector("#nextBtn");
const pageLabel   = document.querySelector("#pageLabel");
const logoutBtn   = document.querySelector("#logoutBtn");

let PAGE = 1;
const LIMIT = 10;
let LAST_PAGE_EMPTY = false;

guardAuth();

logoutBtn?.addEventListener("click", () => {
  logoutUser();
  window.location.href = "./login.html";
});

prevBtn?.addEventListener("click", () => {
  if (PAGE > 1) {
    PAGE -= 1;
    loadPage();
  }
});

nextBtn?.addEventListener("click", () => {
  if (!LAST_PAGE_EMPTY) {
    PAGE += 1;
    loadPage();
  }
});

searchInput?.addEventListener("input", async (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) return loadPage(PAGE);

  setStatus("Searching…");
  try {
    const all = await getPosts({ page: 1, limit: 100 });
    const results = all.filter(p => {
      const t = (p.title || "").toLowerCase();
      const b = (p.body || "").toLowerCase();
      const a = (p.author?.name || "").toLowerCase();
      return t.includes(q) || b.includes(q) || a.includes(q);
    });

    clearStatus();
    renderList(results);

    prevBtn.disabled = true;
    nextBtn.disabled = true;
    pageLabel.textContent = `Search results (${results.length})`;
  } catch (err) {
    setStatus("Search failed: " + err.message);
  }
});

loadPage();

function guardAuth() {
  if (!isAuthenticated()) {
    window.location.href = "./login.html";
  }
}

async function loadPage() {
  setStatus("Loading posts…");
  try {
    const list = await getPosts({ page: PAGE, limit: LIMIT });
    LAST_PAGE_EMPTY = list.length < LIMIT;

    renderList(list);
    updatePager(list.length);

    clearStatus();
  } catch (err) {
    setStatus(err.message || "Failed to load posts");
  }
}

function updatePager(count) {
  prevBtn.disabled = PAGE <= 1;
  nextBtn.disabled = count < LIMIT;
  pageLabel.textContent = `Page ${PAGE}`;
}

function renderList(list) {
  if (!Array.isArray(list) || list.length === 0) {
    postsGrid.innerHTML = `<p>No posts found.</p>`;
    return;
  }

  postsGrid.innerHTML = list.map(PostCard).join("");
  wireControls();
}

function wireControls() {
  postsGrid.querySelectorAll(".likeBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      try {
        await reactToPost(id, "❤️");
        const p = await getPost(id);
        btn.textContent = `❤️ ${p._count?.reactions ?? 0}`;
      } catch (err) {
        alert(err.message || "Reaction failed");
      }
    });
  });

  postsGrid.querySelectorAll(".commentToggleBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const wrap = postsGrid.querySelector(`.commentsWrap[data-id="${id}"]`);
      if (!wrap) return;

      if (wrap.hidden) {
        wrap.hidden = false;
        const listEl = wrap.querySelector(".commentsList");
        listEl.textContent = "Loading comments…";

        try {
          const comments = await listCommentsViaPost(id);
          listEl.innerHTML = comments.length
            ? comments.map(commentHTML).join("")
            : `<p class="muted">No comments yet.</p>`;
        } catch (err) {
          listEl.textContent = err.message || "Failed to load comments";
        }
      } else {
        wrap.hidden = true;
      }
    });
  });

  postsGrid.querySelectorAll(".commentForm").forEach(form => {
    form.addEventListener("submit", async e => {
      e.preventDefault();

      const id = form.dataset.id;
      const input = form.querySelector('input[name="comment"]');
      const body = input.value.trim();
      if (!body) return;

      const listEl = form.parentElement.querySelector(".commentsList");

      try {
        await addComment(id, body);
        input.value = "";

        const comments = await listCommentsViaPost(id);
        listEl.innerHTML = comments.length
          ? comments.map(commentHTML).join("")
          : `<p class="muted">No comments yet.</p>`;
      } catch (err) {
        alert(err.message || "Failed to add comment");
      }
    });
  });
}

function commentHTML(c) {
  const name =
    c.author?.name ||
    c.owner?.name ||
    c.profile?.name ||
    "user";

  const text = c.body || "";
  const avatar =
    c.author?.avatar?.url ||
    c.owner?.avatar?.url ||
    "";

  const initial = (name || "U").slice(0, 1).toUpperCase();

  return `
    <div class="comment">
      <div class="commentAvatar">
        ${
          avatar
            ? `<img src="${avatar}" alt="${initial}" loading="lazy" />`
            : `<span>${initial}</span>`
        }
      </div>
      <div class="commentBody">
        <strong>${escapeHtml(name)}</strong>
        <p>${escapeHtml(text)}</p>
      </div>
    </div>
  `;
}

function setStatus(t) {
  const el = statusEl || document.querySelector("#status");
  if (el) el.textContent = t;
}

function clearStatus() {
  setStatus("");
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}