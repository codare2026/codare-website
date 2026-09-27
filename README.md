# 口袋營養獅 Co-Dare 官網 2.0

營養師寫給你的日常健康讀本。以文章為主角，健康陪跑計畫為輔。

- 網站：用 [Eleventy](https://www.11ty.dev/) 產生的靜態網站，放在 GitHub Pages
- 網址：https://codaredietitian.com
- 主編儀表板：https://codaredietitian.com/admin/ （待辦事項、草稿、排程、宣傳狀態）
- 編輯後台：[Decap CMS](https://decapcms.org/)，網址是 https://codaredietitian.com/admin/edit/ ，只有主編登入

## 日常使用（主編）

1. 營養師在共用雲端資料夾寫稿，完成後移到「待審稿」。
2. 主編用 Google 文件的留言／建議模式審稿。
3. 主編到後台 `/admin/edit/` →「文章」→「＋文章」，貼上內文、選主題與作者、填 SEO，按「儲存」。
4. 儲存後是草稿，不會上網站。在「草稿看板」確認後按「發布」，約 1～2 分鐘網站自動更新。
5. 想排程：把「發布時間」設在未來再發布，文章會先藏起來，到時間自動上架（網站每小時自動更新一次）。

後台可以編輯的內容：

| 選單 | 內容 |
|---|---|
| 文章 | SEO 文、衛教文，可排程；「先隱藏」可以暫時下架 |
| 活動花絮 | 講座、活動、品牌合作的照片與紀錄 |
| 營養師團隊 | 名字、插畫、自我介紹、招呼語 |
| 公告與活動宣傳 | 最上方跑馬燈、首頁活動橫幅與彈窗 |
| 各頁面文字 | 每一頁的標題、說明、按鈕文字、SEO（檔案在 `src/_data/pages/`） |
| 名單與基本資料 | 合作夥伴名單、閱讀主題、聯絡方式與社群 |

## 在自己電腦上預覽

```bash
npm install
npm start
```

打開 http://localhost:8765 就能看到網站，改檔案會自動重新整理。

想在自己電腦上試用後台（不需要登入 GitHub）：另外開一個終端機執行 `npm run cms`，再打開 http://localhost:8765/admin/edit/ 。本機測試不會有草稿看板（只有線上後台有）。

## 上線設定（第一次）

1. **放上 GitHub**：用 GitHub Desktop 把這個資料夾發布成 `codare2026/codare-website`（公開 Public）。
2. **開啟 GitHub Pages**：儲存庫 Settings → Pages → Source 選「GitHub Actions」，Custom domain 填 `codaredietitian.com`。之後每次推送或在後台發布，`.github/workflows/deploy.yml` 都會自動建置並上線。
3. **後台登入設定**：GitHub Pages 本身沒有登入功能，需要一個免費的 OAuth 小服務（例如用 Cloudflare Workers 架設 decap-proxy）。架好後把網址填進 `src/admin/edit/config.yml` 的 `base_url`，並確認 `repo` 是正確的儲存庫名稱。
4. 確認 `src/_data/site.json` 的 `url` 是正式網址（用在 SEO 與分享預覽）。

## 資料夾說明

```
src/
  articles/     文章（每篇一個 .md 檔）
  team/         營養師名單
  events/       活動花絮
  _data/        聯絡資訊、閱讀主題、合作夥伴、公告與宣傳
  _data/pages/  各頁面文字
  _includes/    版型
  assets/       CSS、JS、圖片（後台上傳的圖片在 assets/uploads）
  admin/        主編儀表板（index.njk）
  admin/edit/   編輯後台設定（Decap CMS）
```
