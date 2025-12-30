<p align="center">
  <img src="assets/icon-192.png" alt="電子雞" width="120">
</p>

<h1 align="center">🐣 電子雞 Tamagotchi</h1>

<p align="center">
  <strong>復古像素風虛擬寵物養成遊戲</strong><br>
  使用 PWA 技術，可安裝到手機主畫面
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PWA-Ready-5a0fc8?style=for-the-badge&logo=pwa" alt="PWA Ready">
  <img src="https://img.shields.io/badge/Offline-Supported-00c853?style=for-the-badge" alt="Offline Supported">
  <img src="https://img.shields.io/badge/Mobile-Friendly-ff6b6b?style=for-the-badge" alt="Mobile Friendly">
</p>

---

## ✨ 特色功能

| 功能 | 說明 |
| :--: | ---- |
| 🍖 | **餵食** - 讓寵物吃飽飽，維持健康 |
| 🎮 | **玩耍** - 啟動接球小遊戲，增加快樂度 |
| 🧼 | **清潔** - 幫寵物洗澡，清除便便 |
| 💤 | **睡覺** - 讓寵物休息，恢復體力 |

---

## 🐔 成長階段

```text
   ██           ██            ████
  ████         ████          ██████
  ████        ██████          ████
   ██          ○ ○            ○  ○
               ────            ════
                ▽             ╰──╯

  🥚 蛋        🐣 幼年        🐔 成年
 (2分鐘)      (15分鐘)       (永久)
```

---

## � 線上遊玩

直接開啟以下網址即可遊玩：

👉 **[Tamagotchi](https://tamagotchi.appfromape.com)**

---

## 📱 安裝到手機

### iPhone / iPad

1. 用 **Safari** 開啟遊戲網址
2. 點擊底部 **分享按鈕** (⬆️)
3. 選擇 **「加入主畫面」**
4. 完成！從主畫面開啟即可全螢幕遊玩 🎉

### Android

1. 用 **Chrome** 開啟遊戲網址
2. 點擊右上角選單 (⋮)
3. 選擇 **「新增到主畫面」**
4. 完成！

---

## 🎯 遊戲機制

### 狀態系統

| 狀態 | 圖示 | 衰減速度 | 說明 |
| ---- | :--: | -------- | ---- |
| 飢餓度 | 🍖 | +5/分鐘 | 數值越高越餓 |
| 快樂度 | 😊 | -3/分鐘 | 保持高數值 |
| 清潔度 | 🧼 | -2/分鐘 | 保持高數值 |
| 體力 | 💤 | -1/分鐘 | 保持高數值 |

### 死亡條件

> ⚠️ 任一狀態達到極限並持續 **5 分鐘**，寵物將會死亡

### 離線機制

關閉遊戲後重新開啟，系統會根據離線時間計算狀態變化

---

## 🕹️ 小遊戲：接球挑戰

點擊 **「玩耍」** 按鈕開始小遊戲！

- ⬅️ ➡️ 鍵盤左右鍵或觸控滑動控制
- ❤️ 接住愛心 +10 分
- ✖️ 避開炸彈
- ⏱️ 遊戲時間 30 秒

---

## 🛠️ 本地開發

```bash
# 進入專案目錄
cd 電子雞

# 啟動本地伺服器
python3 -m http.server 8080

# 開啟瀏覽器
open http://localhost:8080
```

---

## 🌐 部署到網路

### 方式一：GitHub Pages

```bash
# 初始化 Git
git init
git add .
git commit -m "🐣 電子雞 PWA"

# 上傳到 GitHub
git branch -M main
git remote add origin https://github.com/你的帳號/tamagotchi.git
git push -u origin main
```

然後到 **GitHub Repo → Settings → Pages** 開啟 GitHub Pages

### 方式二：Cloudflare Pages

1. 上傳到 GitHub
2. 到 [Cloudflare Pages](https://pages.cloudflare.com/) 連結 Repo
3. 自動部署完成！

### 自訂網域

在 Cloudflare DNS 添加 CNAME 記錄：

```text
類型: CNAME
名稱: @（或子網域）
目標: 你的帳號.github.io（或 xxx.pages.dev）
```

---

## 📁 專案結構

```text
電子雞/
├── 📄 index.html          # 主頁面
├── 📄 manifest.json       # PWA 設定
├── 📄 service-worker.js   # 離線快取
├── 📁 css/
│   └── 📄 styles.css      # 像素風樣式
├── 📁 fonts/
│   └── 📄 PressStart2P-Regular.ttf  # 本地字型
├── 📁 js/
│   ├── 📄 app.js          # 入口程式
│   ├── 📄 game.js         # 遊戲主迴圈
│   ├── 📄 pet.js          # 寵物類別
│   ├── 📄 minigame.js     # 小遊戲
│   └── 📄 storage.js      # 資料儲存
└── 📁 assets/
    └── 🖼️ icon-*.png      # PWA 圖示
```

---

## 🎨 技術特點

- **純 CSS 像素精靈** - 無需載入外部圖片
- **本地字型** - 完全離線可用
- **Service Worker** - 支援離線遊玩
- **LocalStorage** - 自動儲存遊戲進度
- **響應式設計** - 適配各種螢幕尺寸

---

## 📄 授權

本專案採用 MIT 授權

---

<p align="center">
  <strong>🐣 祝你養雞愉快！🐔</strong>
</p>

<p align="center">
  Made with ❤️ using HTML, CSS & JavaScript
</p>
