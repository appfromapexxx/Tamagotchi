// ===================================
// 電子雞 - 遊戲主迴圈
// ===================================

class Game {
    constructor() {
        this.pet = null;
        this.minigame = null;
        this.updateInterval = null;
        this.saveInterval = null;
        this.lastUpdateTime = Date.now();

        // DOM 元素
        this.elements = {
            // 螢幕
            gameScreen: document.getElementById('game-screen'),
            minigameScreen: document.getElementById('minigame-screen'),
            deathScreen: document.getElementById('death-screen'),

            // 狀態條
            hungerBar: document.getElementById('hunger-bar'),
            happinessBar: document.getElementById('happiness-bar'),
            cleanlinessBar: document.getElementById('cleanliness-bar'),
            energyBar: document.getElementById('energy-bar'),

            // 寵物
            petElement: document.getElementById('pet'),
            petMessage: document.getElementById('pet-message'),
            stageText: document.getElementById('stage-text'),
            ageText: document.getElementById('age-text'),

            // 按鈕
            btnFeed: document.getElementById('btn-feed'),
            btnPlay: document.getElementById('btn-play'),
            btnClean: document.getElementById('btn-clean'),
            btnSleep: document.getElementById('btn-sleep'),
            restartBtn: document.getElementById('restart-btn'),

            // 小遊戲
            minigameCanvas: document.getElementById('minigame-canvas'),
            minigameScore: document.getElementById('minigame-score'),
            minigameExit: document.getElementById('minigame-exit')
        };

        // 便便元素
        this.poopElements = [];
    }

    // 初始化遊戲
    init() {
        // 嘗試載入存檔
        const savedData = Storage.load();

        if (savedData) {
            // 計算離線時間的變化
            const updatedData = Storage.calculateOfflineChanges(savedData);
            this.pet = new Pet(updatedData.pet);
            console.log('載入存檔成功');
        } else {
            // 創建新寵物
            this.pet = new Pet();
            console.log('創建新寵物');
        }

        // 綁定按鈕事件
        this.bindEvents();

        // 初始化小遊戲
        this.minigame = new Minigame(
            this.elements.minigameCanvas,
            (score) => this.onMinigameEnd(score)
        );

        // 開始遊戲迴圈
        this.startGameLoop();

        // 自動儲存（每 30 秒）
        this.saveInterval = setInterval(() => this.save(), 30000);

        // 頁面關閉時儲存
        window.addEventListener('beforeunload', () => this.save());
        window.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.save();
            }
        });

        // 初始渲染
        this.render();
    }

    // 綁定事件
    bindEvents() {
        this.elements.btnFeed.addEventListener('click', () => this.actionFeed());
        this.elements.btnPlay.addEventListener('click', () => this.actionPlay());
        this.elements.btnClean.addEventListener('click', () => this.actionClean());
        this.elements.btnSleep.addEventListener('click', () => this.actionSleep());
        this.elements.restartBtn.addEventListener('click', () => this.restart());
        this.elements.minigameExit.addEventListener('click', () => this.exitMinigame());
    }

    // 開始遊戲迴圈
    startGameLoop() {
        // 每秒更新一次
        this.updateInterval = setInterval(() => this.update(), 1000);
    }

    // 更新遊戲狀態
    update() {
        if (!this.pet || !this.pet.isAlive) return;

        const now = Date.now();
        const deltaSeconds = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        // 更新寵物狀態
        const transition = this.pet.update(deltaSeconds);

        // 處理階段轉換動畫
        if (transition === 'hatched') {
            this.showMessage('🐣 孵化了！');
            this.playHatchAnimation();
        } else if (transition === 'grown') {
            this.showMessage('🎉 長大了！');
        }

        // 檢查死亡
        if (!this.pet.isAlive) {
            this.showDeathScreen();
            return;
        }

        // 渲染
        this.render();
    }

    // 渲染遊戲畫面
    render() {
        if (!this.pet) return;

        // 更新狀態條（飢餓度是反向的：100 = 餓，顯示為空）
        this.elements.hungerBar.style.width = `${100 - this.pet.hunger}%`;
        this.elements.happinessBar.style.width = `${this.pet.happiness}%`;
        this.elements.cleanlinessBar.style.width = `${this.pet.cleanliness}%`;
        this.elements.energyBar.style.width = `${this.pet.energy}%`;

        // 更新寵物外觀
        const petEl = this.elements.petElement;
        petEl.className = `pet ${this.pet.stage}`;

        // 添加狀態類別
        const status = this.pet.getStatus();
        if (status === 'sleeping') petEl.classList.add('sleeping');
        if (status === 'hungry' || status === 'sad' || status === 'dirty') {
            petEl.classList.add('sick');
        }
        if (status === 'dead') petEl.classList.add('dead');

        // 更新階段和年齡文字
        this.elements.stageText.textContent = this.pet.getStageText();
        this.elements.ageText.textContent = `年齡: ${Math.floor(this.pet.age)}`;

        // 更新便便
        this.renderPoops();

        // 更新按鈕狀態
        this.updateButtons();
    }

    // 渲染便便
    renderPoops() {
        // 移除多餘的便便
        while (this.poopElements.length > this.pet.poopCount) {
            const poop = this.poopElements.pop();
            poop.remove();
        }

        // 添加新便便
        while (this.poopElements.length < this.pet.poopCount) {
            const poop = document.createElement('div');
            poop.className = 'poop';
            poop.textContent = '💩';
            poop.style.left = `${20 + this.poopElements.length * 30}px`;
            poop.style.bottom = '10px';
            this.elements.petElement.parentElement.appendChild(poop);
            this.poopElements.push(poop);
        }
    }

    // 更新按鈕狀態
    updateButtons() {
        const isEgg = this.pet.stage === 'egg';
        const isSleeping = this.pet.isSleeping;
        const isDead = !this.pet.isAlive;

        this.elements.btnFeed.disabled = isEgg || isSleeping || isDead;
        this.elements.btnPlay.disabled = isEgg || isSleeping || isDead;
        this.elements.btnClean.disabled = isEgg || isSleeping || isDead;
        this.elements.btnSleep.disabled = isEgg || isDead;

        // 更新睡覺按鈕文字
        if (isSleeping) {
            this.elements.btnSleep.querySelector('.btn-text').textContent = '叫醒';
        } else {
            this.elements.btnSleep.querySelector('.btn-text').textContent = '睡覺';
        }
    }

    // 餵食動作
    actionFeed() {
        const result = this.pet.feed();
        this.showMessage(result.message);

        if (result.success) {
            this.playAnimation('feeding');
            this.playAnimation('happy');
        }

        this.render();
        this.save();
    }

    // 玩耍動作
    actionPlay() {
        const result = this.pet.play();
        this.showMessage(result.message);

        if (result.success && result.startMinigame) {
            this.startMinigame();
        }

        this.render();
        this.save();
    }

    // 清潔動作
    actionClean() {
        const result = this.pet.clean();
        this.showMessage(result.message);

        if (result.success) {
            this.playAnimation('cleaning');

            // 移除便便
            this.poopElements.forEach(p => p.remove());
            this.poopElements = [];
        }

        this.render();
        this.save();
    }

    // 睡覺動作
    actionSleep() {
        const result = this.pet.sleep();
        this.showMessage(result.message);

        this.render();
        this.save();
    }

    // 顯示訊息
    showMessage(text) {
        const msgEl = this.elements.petMessage;
        msgEl.textContent = text;
        msgEl.classList.remove('show');

        // 觸發重繪以重新啟動動畫
        void msgEl.offsetWidth;
        msgEl.classList.add('show');
    }

    // 播放動畫
    playAnimation(animName) {
        const petEl = this.elements.petElement;
        petEl.classList.add(animName);

        setTimeout(() => {
            petEl.classList.remove(animName);
        }, 600);
    }

    // 孵化動畫
    playHatchAnimation() {
        const petEl = this.elements.petElement;
        petEl.classList.add('hatching');

        setTimeout(() => {
            petEl.classList.remove('hatching');
        }, 2000);
    }

    // 開始小遊戲
    startMinigame() {
        this.elements.gameScreen.classList.add('hidden');
        this.elements.minigameScreen.classList.remove('hidden');
        this.minigame.start();

        // 暫停主遊戲迴圈
        clearInterval(this.updateInterval);
    }

    // 退出小遊戲
    exitMinigame() {
        this.minigame.stop();
    }

    // 小遊戲結束回調
    onMinigameEnd(score) {
        this.elements.minigameScreen.classList.add('hidden');
        this.elements.gameScreen.classList.remove('hidden');

        // 根據分數增加快樂度
        const bonus = Math.floor(score / 10);
        this.pet.happiness = Math.min(100, this.pet.happiness + bonus);

        this.showMessage(`得分 ${score}！快樂度 +${bonus}`);

        // 恢復主遊戲迴圈
        this.lastUpdateTime = Date.now();
        this.startGameLoop();

        this.render();
        this.save();
    }

    // 顯示死亡畫面
    showDeathScreen() {
        this.elements.gameScreen.classList.add('hidden');
        this.elements.deathScreen.classList.remove('hidden');

        // 停止遊戲迴圈
        clearInterval(this.updateInterval);
        clearInterval(this.saveInterval);
    }

    // 重新開始
    restart() {
        // 清除存檔
        Storage.clear();

        // 清除便便
        this.poopElements.forEach(p => p.remove());
        this.poopElements = [];

        // 創建新寵物
        this.pet = new Pet();

        // 顯示遊戲畫面
        this.elements.deathScreen.classList.add('hidden');
        this.elements.gameScreen.classList.remove('hidden');

        // 重新開始遊戲迴圈
        this.lastUpdateTime = Date.now();
        this.startGameLoop();
        this.saveInterval = setInterval(() => this.save(), 30000);

        this.render();
        this.save();
    }

    // 儲存遊戲
    save() {
        if (!this.pet) return;

        Storage.save({
            pet: this.pet.toJSON()
        });
    }
}
