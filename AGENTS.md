# Disney LLM Wiki: Agent Operating Manual (AGENTS.md)

本文件是本知識庫的「架構憲法」與「操作手冊」。任何維護本專案的 LLM Agent 均須嚴格遵守本文件所規範之架構、命名法則、工作流程與網頁呈現規範。

---

## 1. 核心理念與專案目的 (Philosophy & Purpose)

- **核心哲學 (Karpathy LLM Wiki Pattern)**：本庫不是一次性查詢的 RAG 檢索庫，而是一座**持久、累積、隨時間持續複利（Compounding）的結構化知識庫**。
- **專案目的**：以 **迪士尼（Disney）IP 宇宙、故事劇情、角色弧線、世界觀設定與創作母題（Lore & Lore Mechanics）** 為核心，透過 AI 代理人持續編譯、維護與互連，並提供現代化、沉浸式的可視化網頁讓讀者探索。
- **維護者角色分工**：
  - **Human（使用者）**：負責探索方向、審核提議、提供或引導資料來源、提出深度問題。
  - **LLM Agent**：負責閱讀資料、提議影響範圍、撰寫實體頁面、交叉引用雙向連結、標註設定衝突、維護索引與日誌，並同步編譯發布前端網頁。

---

## 2. 目錄架構 (Repository Structure)

```text
/
├── AGENTS.md                          # 規範與指令手冊（本文件）
├── index.md                           # 全庫內容總索引（分類、雙向連結、單行摘要）
├── log.md                             # 時間序列操作日誌（Append-only）
├── build_wiki_data.py                 # 前端網頁資料編譯腳本（自動掃描 wiki/ 生成資料）
│
├── index.html                         # 知識庫前端展示首頁（GitHub Pages 入口）
├── styles.css                         # 迪士尼午夜星空主題樣式
├── app.js                             # 互動式前端應用（搜尋、雙向連結解析、反向連結探索）
├── wiki-data.js                       # 由 build_wiki_data.py 自動生成之靜態資料集
│
├── raw/                               # 原始資料層（不可變，Source of Truth）
│   ├── franchises/                    # 宇宙、時代與系列專題原始文獻
│   ├── lore-docs/                     # 設定集摘錄、世界觀規則、角色檔案
│   └── interviews-articles/           # 幕後創作訪談、專題報導、文獻剪貼
│
└── wiki/                              # 知識庫核心（Markdown 雙向連結網絡）
    ├── entities/                      # 實體頁面（以原有名詞 Original Name 命名）
    │   ├── characters/                # 角色頁面（例如：Simba.md, Ariel.md, Mulan.md）
    │   ├── franchises/                # 系列/宇宙頁面（例如：The Lion King.md, Disney Renaissance.md）
    │   ├── works/                     # 作品頁面（例如：The Lion King (1994).md, Mulan (1998).md）
    │   ├── locations/                 # 地點/世界頁面（例如：Pride Rock.md）
    │   └── artifacts/                 # 道具/魔法物品（例如：Magic Lamp.md）
    ├── concepts/                      # 核心概念、敘事母題、設定法則（例如：I Want Song.md, Circle of Life (Concept).md）
    ├── syntheses/                     # 專題研究、角色演變、深度比較（由 Query 產出之資產）
    └── sources/                       # raw 資料的濃縮解析與 Key Takeaways
```

---

## 3. 命名、語法與語言規範 (Conventions)

1. **檔案命名**：
   - 檔名一律使用**原有名詞（英文/官方原名）**，避免中文翻譯歧異。例如：`Simba.md`、`Pride Rock.md`、`The Lion King (1994).md`。
   - 檔名不得包含 Windows 與 URL 不合法字符（如雙引號 `"`）。
2. **內文語言**：
   - 內文解析與敘述以**繁體中文**為主。
   - 重要名詞首次出現時並列原文（例如：榮耀石 Pride Rock、生命之環 Circle of Life）。
3. **Obsidian 雙向連結與 Frontmatter**：
   - 所有實體間必須主動使用 `[[Page Name]]` 建立雙向連結。
   - 每個 Wiki 頁面開頭需包含標準 YAML Frontmatter：
     ```yaml
     ---
     aliases: [辛巴]
     tags: [character, the-lion-king, royalty, hero]
     universe: Disney Renaissance
     type: character
     ---
     ```
4. **衝突標註（Contradictions）**：
   - 若新資料與既有 Wiki 頁面產生設定衝突或版本差異，不得直接覆蓋，須使用 GitHub Alert：
     ```markdown
     > [!WARNING] 設定衝突 / 版本差異
     > 在 1994 年原版設定中為 ...，但在後續設定/延伸宇宙中被修訂為 ...。
     ```

---

## 4. 網頁呈現與前端架構規範 (Web Presentation & Style Guide)

為滿足專案公開展示與瀏覽需求，本專案提供免編譯構建、相容 GitHub Pages 的單頁式靜態網頁系統：

### A. 視覺風格與調性 (Visual Design & Theme)
- **核心意象**：**「迪士尼午夜星空與奇幻魔法」（Midnight Navy & Enchanted Gold）**。
- **主色調**：
  - 背景色：午夜深藍星空 gradient (`#060d1f` 至 `#0c1a30`)
  - 強調色：城堡星光金 (`#f4d06f`, `#e5b842`) 與 奇幻冰藍 (`#4fc3f7`)
  - 容器質感：半透明琉璃毛玻璃效果（Glassmorphism），搭配淡金微光外框
  - 字體排版：俐落現代 sans-serif 搭配精準行距，標題帶有典雅 Serif 氣質

### B. 頁面結構 (Layout Structure)
1. **頂部導航列 (Top Bar)**：
   - 品牌標誌與標題（Disney LLM Wiki）
   - 即時關鍵字搜尋框（支援即時全文、標籤與標題過濾）
   - 快速狀態統計（已收錄條目數、分類數量）
2. **左側分類導航抽屜 (Sidebar)**：
   - 分類樹狀折疊：宇宙與系列（Franchises）、影視作品（Works）、核心角色（Characters）、地標（Locations）、概念法則（Concepts）、資料源（Sources）
   - 點擊分類條目即時平滑切換內文，無需刷新網頁
3. **中央閱讀區 (Main Content Panel)**：
   - 條目標題與 YAML Frontmatter 元數據徽章（別名、所屬宇宙、實體類型、Tags）
   - 完整 Markdown 解析渲染（標題、表格、引用、清單）
   - **雙向連結動態跳轉**：將 Markdown 的 `[[Entity Name]]` 自動轉換為可點擊超連結，點擊直接在網頁中加載對應條目
   - **反向連結面板 (Backlinks Explorer)**：在文末自動列出所有「引用了此頁面的其他條目」，直觀呈現知識圖譜關係

### C. 網頁資料同步機制 (Data Sync Rule)
- 網頁端由 `wiki-data.js` 靜態驅動（儲存於 `window.DISNEY_WIKI_DATA`），解決瀏覽器本地 `file://` 與靜態網站跨域（CORS）問題。
- **AI 同步規則**：每當執行 Ingest 或新增/修改 Wiki 頁面時，AI 必須在結尾執行：
  ```bash
  python build_wiki_data.py
  ```
  確保最新編寫的 Markdown 與雙向連結即時編譯至網頁前端。

---

## 5. 三大操作流程 (Workflows)

### A. Ingest 流程（深度模式 + 人機審核機制）

當有新資料置入 `raw/` 準備編譯進入 Wiki 時，Agent 必須執行嚴謹的五階段流程：

1. **Step 1: 閱讀與萃取**：讀取 `raw/` 文件，分析人物動機、劇情節點、象徵母題與世界觀設定。
2. **Step 2: 前置簡報與提案（⚠️ 暫停並等待使用者審核）**：
   - 向使用者簡報本份資料的 **3~5 個核心要點（Key Takeaways）**。
   - 列出預計在 `wiki/sources/` 建立的摘要檔案。
   - **明確提議即將新建或深度更新的實體清單（預估 5~15 個頁面）**，並簡述各頁面的主要更新點。
   - **等待使用者確認或引導調整方向。**
3. **Step 3: 深度編譯與寫入（使用者確認後執行）**：
   - 建立 `wiki/sources/` 來源摘錄頁。
   - 逐一批次建立/更新實體與概念頁面，交叉植入 `[[雙向連結]]`。
4. **Step 4: 登錄與索引更新**：
   - 將新頁面登錄至 `index.md`（附帶單行說明與標籤）。
   - 在 `log.md` 結尾追加一行格式化記錄：`## [YYYY-MM-DD] ingest | <Source Title>`。
5. **Step 5: 前端網頁同步**：
   - 執行 `python build_wiki_data.py`，更新 `wiki-data.js`，確保網頁無縫呈現最新內容。

---

### B. Query 流程（知識資產複利化）

1. **檢索路徑**：回答使用者提問時，優先參照 `index.md` 與 `wiki/` 既有條目，建立連貫跨頁面推論。
2. **產出深度答案**：回答需引用 Wiki 條目（標記 `[[Page Name]]`）。
3. **沉澱為新資產**：當回答構成具備長久價值的深度分析或橫向比較時，Agent 應主動提議：
   > *「此分析具有長期參考價值，是否要將其儲存為 `wiki/syntheses/<Title>.md` 並為相關實體頁面建立反向連結？」*
4. 確認歸檔後，執行 Step 4 與 Step 5 同步索引與網頁。

---

### C. Lint 流程（Wiki 健康檢查）

定期檢查 Wiki 的健康狀況：
- **孤島頁面（Orphans）**：無任何反向連結的頁面。
- **死連結（Dead Links）**：被 `[[連結]]` 引用但尚未建立實體檔案的條目。
- **矛盾未決（Contradictions）**：是否有未被標記或需使用者裁決的衝突。
- 檢查完成後，記錄於 `log.md`：`## [YYYY-MM-DD] lint | Wiki Health Check`。
