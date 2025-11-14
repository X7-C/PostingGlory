import { formatDate } from "../utils/dom.js";

export function PostCard(post) {
  const id = post.id;
  const title = post.title ?? "(Untitled)";
  const body = (post.body ?? "").trim();
  const snippet = body.length > 240 ? body.slice(0, 240) + "…" : body;

  const authorName = post.author?.name ?? "Unknown";
  const authorLink = `./profile.html?name=${encodeURIComponent(authorName)}`;
  const created = post.created ? formatDate(post.created) : "";

  const comments = post._count?.comments ?? 0;
  const reactions = post._count?.reactions ?? 0;

  const hasMedia = !!post.media?.url;
  const mediaUrl = post.media?.url || "";
  const mediaAlt = post.media?.alt || "";

  return `
    <article data-post-id="${id}" class="card">

      <header class="cardHeader">
        <h3 class="cardTitle">
          <a href="./post.html?id=${encodeURIComponent(id)}">${escapeHtml(title)}</a>
        </h3>
        <small class="cardMeta">
          by <a href="${authorLink}">${escapeHtml(authorName)}</a> — ${created}
        </small>
      </header>

      ${hasMedia ? `
        <div class="cardMedia">
          <img src="${mediaUrl}" alt="${escapeHtml(mediaAlt)}" loading="lazy" />
        </div>
      ` : ""}

      <div class="cardBody">
        <p>${escapeHtml(snippet)}</p>
      </div>

      <footer class="cardFooter">
        <button class="likeBtn" data-id="${id}">❤️ ${reactions}</button>
        <button class="commentToggleBtn" data-id="${id}">💬 ${comments}</button>
        <a href="./post.html?id=${encodeURIComponent(id)}" role="button" class="secondary">Open</a>
      </footer>

      <section class="commentsWrap" data-id="${id}" hidden>
        <div class="commentsList"></div>
        <form class="commentForm" data-id="${id}">
          <input name="comment" placeholder="Write a comment…" required />
          <button type="submit">Send</button>
        </form>
      </section>

    </article>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}