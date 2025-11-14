import { isAuthenticated, logoutUser, getUser } from "../api/auth.js";
import {
  getProfile,
  getUserPosts,
  followProfile,
  unfollowProfile,
} from "../api/profiles.js";
import { deletePost } from "../api/posts.js";
import { qs, formatDate } from "../utils/dom.js";

const statusEl = qs("#status");
const pName = qs("#pName");
const pMeta = qs("#pMeta");
const followBtn = qs("#followBtn");
const userPosts = qs("#userPosts");
const logoutBtn = qs("#logoutBtn");
const avatarBox = qs("#avatarBox");

logoutBtn?.addEventListener("click", () => {
  logoutUser();
  window.location.href = "./login.html";
});

guardAuth();
init().catch(err => setStatus(err.message || "Failed to load profile"));

function guardAuth() {
  if (!isAuthenticated()) {
    window.location.href = "./login.html";
  }
}

function targetName() {
  const url = new URL(window.location.href);
  return url.searchParams.get("name") || getUser()?.name;
}

async function init() {
  const name = targetName();

  if (!name) {
    setStatus("No profile found");
    return;
  }

  setStatus("Loading profile…");

  const [profile, posts] = await Promise.all([
    getProfile(name),
    getUserPosts(name),
  ]);

  clearStatus();

  renderProfile(profile);
  renderPosts(posts, profile);
  wireFollow(profile);
}

function renderProfile(profile) {
  pName.textContent = profile.name || "(user)";

  pMeta.textContent = [
    profile.bio ? `Bio: ${profile.bio}` : "",
    Array.isArray(profile.followers)
      ? `Followers: ${profile.followers.length}`
      : "",
    Array.isArray(profile.following)
      ? `Following: ${profile.following.length}`
      : "",
  ]
    .filter(Boolean)
    .join(" • ");

  const initial = (profile.name || "U").slice(0, 1).toUpperCase();

  if (profile.avatar?.url) {
    avatarBox.innerHTML = `
      <img
        src="${profile.avatar.url}"
        alt="${profile.avatar.alt || initial}"
        style="width:64px;height:64px;border-radius:50%;object-fit:cover;"
      />
    `;
  } else {
    avatarBox.textContent = initial;
  }
}

function wireFollow(profile) {
  const me = getUser();
  const viewingSelf = me?.name === profile.name;

  if (viewingSelf) {
    followBtn.hidden = true;
    return;
  }

  followBtn.hidden = false;

  const amFollowing = Array.isArray(profile.followers)
    ? profile.followers.some(f => f.name === me?.name)
    : false;

  updateFollowBtn(amFollowing);

  followBtn.onclick = async () => {
    try {
      if (followBtn.dataset.state === "following") {
        await unfollowProfile(profile.name);
        updateFollowBtn(false);
      } else {
        await followProfile(profile.name);
        updateFollowBtn(true);
      }
    } catch (err) {
      alert(err.message || "Follow action failed");
    }
  };
}

function updateFollowBtn(isFollowing) {
  followBtn.dataset.state = isFollowing ? "following" : "not";
  followBtn.textContent = isFollowing ? "Unfollow" : "Follow";
}

function renderPosts(posts, profile) {
  const me = getUser();
  const viewingSelf = me?.name === profile.name;

  if (!Array.isArray(posts) || posts.length === 0) {
    userPosts.innerHTML = `<p>No posts yet.</p>`;
    return;
  }

  userPosts.innerHTML = posts
    .map(p => {
      const created = p.created ? formatDate(p.created) : "";
      const body = p.body || "";
      const snippet = body.length > 160 ? body.slice(0, 160) + "…" : body;

      return `
        <article data-id="${p.id}">
          <header>
            <h4>
              <a href="./post.html?id=${encodeURIComponent(p.id)}">
                ${escapeHtml(p.title || "(Untitled)")}
              </a>
            </h4>
            <small>${created}</small>
          </header>
          <p>${escapeHtml(snippet)}</p>
          <footer style="display:flex; gap:.5rem; flex-wrap:wrap;">
            <a href="./post.html?id=${encodeURIComponent(p.id)}" role="button">
              Open
            </a>
            ${
              viewingSelf
                ? `
              <a
                href="./post.html?id=${encodeURIComponent(p.id)}"
                role="button"
                class="secondary"
              >
                Edit
              </a>
              <button class="dangerBtn">Delete</button>
            `
                : ""
            }
          </footer>
        </article>
      `;
    })
    .join("");

  if (viewingSelf) {
    userPosts.querySelectorAll(".dangerBtn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.closest("article")?.dataset.id;
        if (!id) return;
        if (!confirm("Delete this post?")) return;

        try {
          await deletePost(id);
          btn.closest("article").remove();
        } catch (err) {
          alert(err.message || "Delete failed");
        }
      });
    });
  }
}

function setStatus(t) {
  statusEl.textContent = t;
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