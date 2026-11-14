#!/usr/bin/env python3
"""
build_wiki_data.py - Disney LLM Wiki 前端資料編譯器
掃描 wiki/ 目錄下的所有 Markdown 條目，解析 Frontmatter、雙向連結與反向連結，
打包輸出為 wiki-data.js 供前端 index.html 離線/免伺服器展示。
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime

WIKI_DIR = Path(__file__).parent / "wiki"
OUTPUT_FILE = Path(__file__).parent / "wiki-data.js"

CATEGORY_NAMES = {
    "franchises": "宇宙與系列 (Franchises)",
    "works": "影視作品 (Works)",
    "characters": "核心角色 (Characters)",
    "locations": "世界與場景 (Locations)",
    "artifacts": "道具與法器 (Artifacts)",
    "concepts": "設定與敘事概念 (Concepts)",
    "syntheses": "專題研究 (Syntheses)",
    "sources": "文獻摘錄 (Sources)"
}

def parse_frontmatter(content):
    frontmatter = {}
    body = content
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            fm_text = parts[1]
            body = parts[2].strip()
            # 簡易 YAML 鍵值解析
            for line in fm_text.strip().split("\n"):
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if ":" in line:
                    key, val = line.split(":", 1)
                    key = key.strip()
                    val = val.strip()
                    if val.startswith("[") and val.endswith("]"):
                        # 清單形式 [a, b, c]
                        items = [item.strip() for item in val[1:-1].split(",") if item.strip()]
                        frontmatter[key] = items
                    else:
                        frontmatter[key] = val
    return frontmatter, body

def find_wikilinks(text):
    # 匹配 [[Page Name]] 或 [[Page Name|Alias]]
    matches = re.findall(r"\[\[(.*?)\]\]", text)
    links = []
    for m in matches:
        target = m.split("|")[0].strip()
        # 去除可能帶有的路徑前綴
        target_name = Path(target).stem
        if target_name not in links:
            links.append(target_name)
    return links

def main():
    if not WIKI_DIR.exists():
        print(f"錯誤：找不到目錄 {WIKI_DIR}")
        return

    pages = {}
    categories = {k: {"name": v, "pages": []} for k, v in CATEGORY_NAMES.items()}
    all_links_map = {} # target -> list of sources

    # 1. 遍歷讀取所有 Markdown 檔案
    for md_file in sorted(WIKI_DIR.rglob("*.md")):
        rel_path = md_file.relative_to(WIKI_DIR)
        parent_dir = rel_path.parent.name
        # 實體底下可能是 entities/characters -> parent_dir 是 characters
        category = parent_dir if parent_dir in CATEGORY_NAMES else "misc"
        
        page_id = md_file.stem
        raw_text = md_file.read_text(encoding="utf-8")
        fm, body = parse_frontmatter(raw_text)
        links = find_wikilinks(raw_text)

        pages[page_id] = {
            "id": page_id,
            "title": page_id,
            "category": category,
            "category_name": CATEGORY_NAMES.get(category, "其他"),
            "rel_path": str(rel_path).replace("\\", "/"),
            "frontmatter": fm,
            "content": raw_text,
            "body": body,
            "links": links,
            "backlinks": []
        }

        if category in categories:
            categories[category]["pages"].append(page_id)

    # 2. 計算反向連結 (Backlinks)
    for src_id, page_data in pages.items():
        for target in page_data["links"]:
            if target in pages:
                if src_id not in pages[target]["backlinks"]:
                    pages[target]["backlinks"].append(src_id)

    # 3. 輸出為 JS 檔案
    dataset = {
        "build_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_pages": len(pages),
        "categories": categories,
        "pages": pages
    }

    js_content = f"// 自動由 build_wiki_data.py 編譯產出 - {datetime.now().isoformat()}\nwindow.DISNEY_WIKI_DATA = {json.dumps(dataset, ensure_ascii=False, indent=2)};\n"
    OUTPUT_FILE.write_text(js_content, encoding="utf-8")
    print(f"✅ 成功編譯 {len(pages)} 個頁面至 {OUTPUT_FILE.name}")

if __name__ == "__main__":
    main()
