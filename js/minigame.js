// ===================================
// 電子雞 - 接球小遊戲
// ===================================

class Minigame {
    constructor(canvas, onGameEnd) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onGameEnd = onGameEnd;

        // 設定畫布大小
        this.width = 200;
        this.height = 250;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // 遊戲狀態
        this.isRunning = false;
        this.score = 0;
        this.lives = 3;
        this.gameTime = 30; // 30 秒遊戲時間
        this.startTime = null;

        // 玩家（寵物）
        this.player = {
            x: this.width / 2 - 20,
            y: this.height - 40,
            width: 40,
            height: 30,
            speed: 8
        };

        // 掉落物
        this.items = [];
        this.itemSpeed = 2;
        this.spawnRate = 60; // 每 60 幀生成一個
        this.frameCount = 0;

        // 控制
        this.keys = { left: false, right: false };
        this.touchStartX = null;

        // 綁定事件
        this.boundKeyDown = this.handleKeyDown.bind(this);
        this.boundKeyUp = this.handleKeyUp.bind(this);
        this.boundTouchStart = this.handleTouchStart.bind(this);
        this.boundTouchMove = this.handleTouchMove.bind(this);
        this.boundTouchEnd = this.handleTouchEnd.bind(this);

        // 動畫 ID
        this.animationId = null;
    }

    // 開始遊戲
    start() {
        this.isRunning = true;
        this.score = 0;
        this.lives = 3;
        this.items = [];
        this.frameCount = 0;
        this.player.x = this.width / 2 - 20;
        this.startTime = Date.now();

        // 添加事件監聽
        document.addEventListener('keydown', this.boundKeyDown);
        document.addEventListener('keyup', this.boundKeyUp);
        this.canvas.addEventListener('touchstart', this.boundTouchStart);
        this.canvas.addEventListener('touchmove', this.boundTouchMove);
        this.canvas.addEventListener('touchend', this.boundTouchEnd);

        // 開始遊戲迴圈
        this.gameLoop();
    }

    // 停止遊戲
    stop() {
        this.isRunning = false;

        // 移除事件監聽
        document.removeEventListener('keydown', this.boundKeyDown);
        document.removeEventListener('keyup', this.boundKeyUp);
        this.canvas.removeEventListener('touchstart', this.boundTouchStart);
        this.canvas.removeEventListener('touchmove', this.boundTouchMove);
        this.canvas.removeEventListener('touchend', this.boundTouchEnd);

        // 取消動畫
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // 回調遊戲結束
        if (this.onGameEnd) {
            this.onGameEnd(this.score);
        }
    }

    // 遊戲主迴圈
    gameLoop() {
        if (!this.isRunning) return;

        // 檢查時間
        const elapsed = (Date.now() - this.startTime) / 1000;
        if (elapsed >= this.gameTime || this.lives <= 0) {
            this.stop();
            return;
        }

        this.update();
        this.render();

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    // 更新遊戲狀態
    update() {
        this.frameCount++;

        // 玩家移動
        if (this.keys.left) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys.right) {
            this.player.x = Math.min(this.width - this.player.width, this.player.x + this.player.speed);
        }

        // 生成掉落物
        if (this.frameCount % this.spawnRate === 0) {
            this.spawnItem();

            // 隨遊戲進行加速
            if (this.spawnRate > 30) {
                this.spawnRate--;
            }
            if (this.itemSpeed < 5) {
                this.itemSpeed += 0.05;
            }
        }

        // 更新掉落物
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.y += item.speed;

            // 碰撞檢測
            if (this.checkCollision(item, this.player)) {
                if (item.type === 'good') {
                    this.score += 10;
                } else {
                    this.lives--;
                    this.score = Math.max(0, this.score - 5);
                }
                this.items.splice(i, 1);
                continue;
            }

            // 超出畫面
            if (item.y > this.height) {
                if (item.type === 'good') {
                    this.lives--;
                }
                this.items.splice(i, 1);
            }
        }
    }

    // 生成掉落物
    spawnItem() {
        const isGood = Math.random() > 0.2; // 80% 好東西
        this.items.push({
            x: Math.random() * (this.width - 20),
            y: -20,
            width: 20,
            height: 20,
            speed: this.itemSpeed + Math.random() * 2,
            type: isGood ? 'good' : 'bad'
        });
    }

    // 碰撞檢測
    checkCollision(item, player) {
        return item.x < player.x + player.width &&
            item.x + item.width > player.x &&
            item.y < player.y + player.height &&
            item.y + item.height > player.y;
    }

    // 渲染遊戲畫面
    render() {
        const ctx = this.ctx;

        // 清空畫面（使用 LCD 綠色）
        ctx.fillStyle = '#8bac0f';
        ctx.fillRect(0, 0, this.width, this.height);

        // 繪製玩家（像素風格）
        ctx.fillStyle = '#0f380f';
        this.drawPixelPet(this.player.x, this.player.y, this.player.width, this.player.height);

        // 繪製掉落物
        for (const item of this.items) {
            ctx.fillStyle = '#0f380f';
            if (item.type === 'good') {
                this.drawPixelHeart(item.x, item.y, item.width);
            } else {
                this.drawPixelX(item.x, item.y, item.width);
            }
        }

        // 繪製 UI
        ctx.fillStyle = '#0f380f';
        ctx.font = '8px "Press Start 2P"';

        // 剩餘時間
        const timeLeft = Math.max(0, this.gameTime - (Date.now() - this.startTime) / 1000);
        ctx.fillText(`時間: ${Math.ceil(timeLeft)}`, 5, 15);

        // 生命值
        let livesText = '';
        for (let i = 0; i < this.lives; i++) livesText += '♥';
        for (let i = this.lives; i < 3; i++) livesText += '♡';
        ctx.fillText(livesText, this.width - 50, 15);

        // 分數
        ctx.fillText(`分數: ${this.score}`, 5, this.height - 5);
    }

    // 繪製像素風寵物
    drawPixelPet(x, y, w, h) {
        const ctx = this.ctx;
        const pixelSize = 4;

        // 簡單的碗形狀
        ctx.fillRect(x + pixelSize, y, w - pixelSize * 2, pixelSize);
        ctx.fillRect(x, y + pixelSize, w, h - pixelSize * 2);
        ctx.fillRect(x + pixelSize, y + h - pixelSize, w - pixelSize * 2, pixelSize);
    }

    // 繪製像素愛心
    drawPixelHeart(x, y, size) {
        const ctx = this.ctx;
        const p = size / 5;

        // 愛心形狀
        ctx.fillRect(x + p, y, p, p);
        ctx.fillRect(x + 3 * p, y, p, p);
        ctx.fillRect(x, y + p, size, p);
        ctx.fillRect(x + p, y + 2 * p, 3 * p, p);
        ctx.fillRect(x + 2 * p, y + 3 * p, p, p);
    }

    // 繪製像素 X
    drawPixelX(x, y, size) {
        const ctx = this.ctx;
        const p = size / 5;

        ctx.fillRect(x, y, p, p);
        ctx.fillRect(x + 4 * p, y, p, p);
        ctx.fillRect(x + p, y + p, p, p);
        ctx.fillRect(x + 3 * p, y + p, p, p);
        ctx.fillRect(x + 2 * p, y + 2 * p, p, p);
        ctx.fillRect(x + p, y + 3 * p, p, p);
        ctx.fillRect(x + 3 * p, y + 3 * p, p, p);
        ctx.fillRect(x, y + 4 * p, p, p);
        ctx.fillRect(x + 4 * p, y + 4 * p, p, p);
    }

    // 鍵盤事件
    handleKeyDown(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            this.keys.left = true;
            e.preventDefault();
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            this.keys.right = true;
            e.preventDefault();
        }
    }

    handleKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            this.keys.left = false;
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            this.keys.right = false;
        }
    }

    // 觸控事件
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.touchStartX = touch.clientX - rect.left;
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (this.touchStartX === null) return;

        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;

        // 根據觸控位置移動玩家
        const targetX = (touchX / rect.width) * this.width - this.player.width / 2;
        this.player.x = Math.max(0, Math.min(this.width - this.player.width, targetX));
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.touchStartX = null;
    }
}
