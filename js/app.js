// ===================================
// 電子雞 - 應用程式入口點
// ===================================

// 遊戲實例
let game = null;

// 安裝提示
let deferredPrompt = null;

// 初始化應用程式
function initApp() {
    console.log('🐣 電子雞啟動中...');

    // 註冊 Service Worker
    registerServiceWorker();

    // 處理 PWA 安裝提示
    setupInstallPrompt();

    // 初始化遊戲
    game = new Game();
    game.init();

    console.log('✅ 電子雞已就緒！');
}

// 註冊 Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker 註冊成功:', registration.scope);
        } catch (error) {
            console.log('Service Worker 註冊失敗:', error);
        }
    }
}

// 設置 PWA 安裝提示
function setupInstallPrompt() {
    const installPrompt = document.getElementById('install-prompt');
    const installBtn = document.getElementById('install-btn');
    const dismissBtn = document.getElementById('install-dismiss');

    // 監聽 beforeinstallprompt 事件
    window.addEventListener('beforeinstallprompt', (e) => {
        // 阻止自動顯示安裝提示
        e.preventDefault();
        deferredPrompt = e;

        // 顯示自定義安裝提示
        installPrompt.classList.remove('hidden');
    });

    // 安裝按鈕點擊
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;

        // 顯示安裝提示
        deferredPrompt.prompt();

        // 等待用戶回應
        const { outcome } = await deferredPrompt.userChoice;
        console.log('安裝結果:', outcome);

        // 清除提示
        deferredPrompt = null;
        installPrompt.classList.add('hidden');
    });

    // 關閉提示按鈕
    dismissBtn.addEventListener('click', () => {
        installPrompt.classList.add('hidden');
    });

    // 監聯應用程式已安裝
    window.addEventListener('appinstalled', () => {
        console.log('應用程式已安裝！');
        installPrompt.classList.add('hidden');
        deferredPrompt = null;
    });
}

// 頁面載入完成後初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
