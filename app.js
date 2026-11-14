// app.js - Disney LLM Wiki Interactive Application

document.addEventListener("DOMContentLoaded", () => {
  const data = window.DISNEY_WIKI_DATA;
  if (!data) {
    document.getElementById("content-container").innerHTML = `
      <div style="padding: 40px; text-align: center; color: #f87171;">
        <h2>⚠️ 尚未載入 Wiki 資料庫</h2>
        <p>請確認 wiki-data.js 是否存在，或執行 <code>python build_wiki_data.py</code> 生成資料。</p>
      </div>
    `;
    return;
  }

  const { pages, categories, total_pages, build_time } = data;
  const contentContainer = document.getElementById("content-container");
  const sidebarNav = document.getElementById("sidebar-nav");
  const searchInput = document.getElementById("search-input");
  const statBadge = document.getElementById("stat-badge");
  const randomBtn = document.getElementById("random-btn");
  const brandHome = document.getElementById("brand-home");

  if (statBadge) {
    statBadge.textContent = `${total_pages} 條目收錄`;
  }

  // 1. 渲染左側邊欄分類
  function renderSidebar(filterKeyword = "") {
    sidebarNav.innerHTML = "";
    const keyword = filterKeyword.trim().toLowerCase();

    // 首頁按鈕
    const homeItem = document.createElement("a");
    homeItem.className = `nav-item ${!location.hash || location.hash === "#" || location.hash === "#home" ? "active" : ""}`;
    homeItem.innerHTML = `<span>🏰 首頁與總覽</span>`;
    homeItem.onclick = () => navigateTo("");
    sidebarNav.appendChild(homeItem);

    // 分類群組
    for (const [catKey, catObj] of Object.entries(categories)) {
      if (!catObj.pages || catObj.pages.length === 0) continue;

      const filteredPages = catObj.pages.filter(pageId => {
        if (!keyword) return true;
        const page = pages[pageId];
        const matchTitle = page.title.toLowerCase().includes(keyword);
        const matchAlias = page.frontmatter?.aliases?.some(a => a.toLowerCase().includes(keyword));
        const matchTag = page.frontmatter?.tags?.some(t => t.toLowerCase().includes(keyword));
        return matchTitle || matchAlias || matchTag;
      });

      if (filteredPages.length === 0) continue;

      const groupTitle = document.createElement("div");
      groupTitle.className = "nav-group-title";
      groupTitle.innerHTML = `<span>${catObj.name}</span><span>${filteredPages.length}</span>`;
      sidebarNav.appendChild(groupTitle);

      filteredPages.forEach(pageId => {
        const page = pages[pageId];
        const item = document.createElement("a");
        const currentHash = decodeURIComponent(location.hash.replace(/^#/, ""));
        item.className = `nav-item ${currentHash === pageId ? "active" : ""}`;
        
        let aliasText = "";
        if (page.frontmatter?.aliases && page.frontmatter.aliases.length > 0) {
          aliasText = ` <small style="color:var(--text-muted);font-size:0.75rem;">(${page.frontmatter.aliases[0]})</small>`;
        }
        item.innerHTML = `<span>${page.title}${aliasText}</span>`;
        item.onclick = (e) => {
          e.preventDefault();
          navigateTo(pageId);
        };
        sidebarNav.appendChild(item);
      });
    }
  }

  // 2. 雙向連結解析器 (將 [[Page Name]] 轉為可點擊超連結)
  function parseWikiLinks(markdownText) {
    return markdownText.replace(/\[\[(.*?)\]\]/g, (match, target) => {
      let pageName = target.trim();
      let displayText = pageName;
      if (pageName.includes("|")) {
        const parts = pageName.split("|");
        pageName = parts[0].trim();
        displayText = parts[1].trim();
      }
      // 移除可能帶有的副檔名或路徑
      const cleanName = pageName.split("/").pop().replace(/\.md$/, "");

      if (pages[cleanName]) {
        return `<a class="wikilink" href="#${encodeURIComponent(cleanName)}">${displayText}</a>`;
      } else {
        return `<span class="wikilink wikilink-stub" title="此頁面尚未建立">${displayText}</span>`;
      }
    });
  }

  // 3. 渲染條目頁面
  function renderPage(pageId) {
    const page = pages[pageId];
    if (!page) {
      renderNotFound(pageId);
      return;
    }

    const fm = page.frontmatter || {};
    const aliases = fm.aliases ? (Array.isArray(fm.aliases) ? fm.aliases : [fm.aliases]) : [];
    const tags = fm.tags ? (Array.isArray(fm.tags) ? fm.tags : [fm.tags]) : [];
    const universe = fm.universe || "";
    const type = fm.type || page.category;

    // 解析 Markdown 內文並替換雙向連結
    const processedBody = parseWikiLinks(page.body);
    const renderedHtml = typeof marked !== "undefined" ? marked.parse(processedBody) : `<pre>${processedBody}</pre>`;

    // 徽章 HTML
    const badgesHtml = `
      <div class="meta-badges">
        <span class="badge badge-category">📁 ${page.category_name}</span>
        ${type ? `<span class="badge badge-category">🏷️ ${type}</span>` : ""}
        ${universe ? `<span class="badge badge-alias">🌌 ${universe}</span>` : ""}
        ${aliases.map(a => `<span class="badge badge-alias">別名: ${a}</span>`).join("")}
        ${tags.map(t => `<span class="badge badge-tag">#${t}</span>`).join("")}
      </div>
    `;

    // 反向連結 (Backlinks)
    let backlinksHtml = "";
    if (page.backlinks && page.backlinks.length > 0) {
      backlinksHtml = `
        <div class="backlinks-section">
          <div class="backlinks-title">🔗 引用此條目的頁面 (Backlinks)</div>
          <div class="backlinks-grid">
            ${page.backlinks.map(bId => {
              const bPage = pages[bId];
              const title = bPage ? bPage.title : bId;
              return `<a class="backlink-chip" href="#${encodeURIComponent(bId)}">${title}</a>`;
            }).join("")}
          </div>
        </div>
      `;
    }

    contentContainer.innerHTML = `
      <article>
        <header class="article-header">
          <h1 class="article-title">${page.title}</h1>
          ${badgesHtml}
        </header>
        <div class="markdown-body">
          ${renderedHtml}
        </div>
        ${backlinksHtml}
      </article>
    `;

    window.scrollTo({ top: 0, behavior: "smooth" });
    renderSidebar(searchInput.value);
  }

  // 4. 渲染首頁總覽
  function renderHome() {
    let topFranchisesHtml = "";
    if (categories.franchises?.pages) {
      topFranchisesHtml = categories.franchises.pages.map(id => {
        const p = pages[id];
        return `
          <div class="feature-card" onclick="location.hash='#${encodeURIComponent(id)}'">
            <h4>🌌 ${p.title}</h4>
            <p>${p.frontmatter?.aliases ? p.frontmatter.aliases.join(", ") : "系列宇宙"}</p>
          </div>
        `;
      }).join("");
    }

    let topCharactersHtml = "";
    if (categories.characters?.pages) {
      topCharactersHtml = categories.characters.pages.slice(0, 6).map(id => {
        const p = pages[id];
        return `
          <div class="feature-card" onclick="location.hash='#${encodeURIComponent(id)}'">
            <h4>🦁 ${p.title}</h4>
            <p>${p.frontmatter?.aliases ? p.frontmatter.aliases.join(", ") : "核心角色"}</p>
          </div>
        `;
      }).join("");
    }

    contentContainer.innerHTML = `
      <div class="hero-card">
        <h1 class="hero-title">✨ Disney LLM Wiki 知識庫</h1>
        <p class="hero-desc">
          本知識庫採用 <strong>Karpathy LLM Wiki Pattern</strong>，以迪士尼 IP 宇宙、角色弧線、世界觀設定與創作母題為核心。
          透過結構化雙向連結與知識複利機制，將文藝復興時代至現代之宏大故事體系，以可視化網絡呈現。
        </p>
        <div style="display:flex;gap:12px;margin-top:16px;">
          <button class="badge badge-category" style="cursor:pointer;padding:8px 16px;" onclick="location.hash='#Disney%20Renaissance'">
            🌟 探索：迪士尼文藝復興 (Disney Renaissance)
          </button>
          <button class="badge badge-tag" style="cursor:pointer;padding:8px 16px;" onclick="location.hash='#Mulan%20(1998)'">
            ⚔️ 深度專案：《花木蘭》(Mulan 1998)
          </button>
        </div>
      </div>

      <h3 style="color:var(--accent-gold);margin-bottom:14px;">🌌 核心宇宙與時代 (Franchises & Eras)</h3>
      <div class="grid-cards" style="margin-bottom:32px;">
        ${topFranchisesHtml}
      </div>

      <h3 style="color:var(--accent-gold);margin-bottom:14px;">🎭 核心角色聚焦 (Featured Characters)</h3>
      <div class="grid-cards" style="margin-bottom:32px;">
        ${topCharactersHtml}
      </div>

      <div style="margin-top:40px;padding:20px;border-top:1px solid var(--border-color);color:var(--text-muted);font-size:0.82rem;display:flex;justify-content:space-between;">
        <span>資料更新時間：${build_time}</span>
        <span>由 AGENTS.md 規範驅動之自動化知識庫</span>
      </div>
    `;

    renderSidebar(searchInput.value);
  }

  // 5. 找不到條目視圖
  function renderNotFound(pageId) {
    contentContainer.innerHTML = `
      <div style="padding:60px 20px;text-align:center;">
        <h2 style="color:var(--accent-gold);font-size:2rem;margin-bottom:14px;">404 找不到條目</h2>
        <p style="color:var(--text-secondary);margin-bottom:24px;">條目「<strong>${pageId}</strong>」尚未編譯建立。</p>
        <button class="btn-random" onclick="location.hash=''">返回首頁</button>
      </div>
    `;
    renderSidebar(searchInput.value);
  }

  // 6. 路由控制器
  function handleRoute() {
    const rawHash = location.hash.replace(/^#/, "");
    if (!rawHash || rawHash === "home") {
      renderHome();
    } else {
      const pageId = decodeURIComponent(rawHash);
      renderPage(pageId);
    }
  }

  function navigateTo(pageId) {
    location.hash = pageId ? `#${encodeURIComponent(pageId)}` : "";
  }

  // 7. 事件監聽
  window.addEventListener("hashchange", handleRoute);

  searchInput.addEventListener("input", (e) => {
    renderSidebar(e.target.value);
  });

  brandHome.addEventListener("click", () => {
    navigateTo("");
  });

  randomBtn.addEventListener("click", () => {
    const allPageIds = Object.keys(pages);
    if (allPageIds.length > 0) {
      const randomId = allPageIds[Math.floor(Math.random() * allPageIds.length)];
      navigateTo(randomId);
    }
  });

  // 啟動首頁或指定條目
  renderSidebar();
  handleRoute();
});
