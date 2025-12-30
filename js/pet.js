// ===================================
// 電子雞 - 寵物類別
// ===================================

class Pet {
    constructor(savedData = null) {
        if (savedData) {
            // 從存檔載入
            this.hunger = savedData.hunger;
            this.happiness = savedData.happiness;
            this.cleanliness = savedData.cleanliness;
            this.energy = savedData.energy;
            this.stage = savedData.stage;
            this.age = savedData.age;
            this.isAlive = savedData.isAlive;
            this.isSleeping = savedData.isSleeping || false;
            this.birthTime = savedData.birthTime;
            this.deathTime = savedData.deathTime || null;
            this.poopCount = savedData.poopCount || 0;
        } else {
            // 初始化新寵物
            this.hunger = 0;        // 飢餓度 0-100（0=飽，100=餓死）
            this.happiness = 100;   // 快樂度 0-100
            this.cleanliness = 100; // 清潔度 0-100
            this.energy = 100;      // 體力 0-100
            this.stage = 'egg';     // 成長階段: egg, baby, adult
            this.age = 0;           // 年齡（分鐘）
            this.isAlive = true;
            this.isSleeping = false;
            this.birthTime = Date.now();
            this.deathTime = null;
            this.poopCount = 0;     // 便便數量
        }

        // 階段轉換時間（分鐘）
        this.HATCH_TIME = 2;      // 孵化時間：2 分鐘
        this.GROW_TIME = 15;      // 成長時間：15 分鐘

        // 狀態衰減速率（每秒）
        this.HUNGER_RATE = 5 / 60;      // 每分鐘 +5
        this.HAPPINESS_RATE = 3 / 60;   // 每分鐘 -3
        this.CLEANLINESS_RATE = 2 / 60; // 每分鐘 -2
        this.ENERGY_RATE = 1 / 60;      // 每分鐘 -1

        // 危險閾值
        this.DANGER_THRESHOLD = 80;  // 飢餓度危險值
        this.LOW_THRESHOLD = 20;     // 其他屬性低值警告

        // 死亡計時器
        this.criticalStartTime = null;
        this.CRITICAL_DEATH_TIME = 5 * 60 * 1000; // 5 分鐘
    }

    // 每秒更新狀態
    update(deltaSeconds = 1) {
        if (!this.isAlive || this.stage === 'egg') {
            // 蛋階段只增加年齡
            if (this.stage === 'egg') {
                this.age += deltaSeconds / 60;
                this.checkStageTransition();
            }
            return;
        }

        // 睡覺時的特殊處理
        if (this.isSleeping) {
            // 體力恢復（每分鐘 +10）
            this.energy = Math.min(100, this.energy + (10 / 60) * deltaSeconds);

            // 其他狀態衰減減緩
            this.hunger += (this.HUNGER_RATE * 0.3) * deltaSeconds;
            this.cleanliness -= (this.CLEANLINESS_RATE * 0.5) * deltaSeconds;

            // 體力滿了就自動醒來
            if (this.energy >= 100) {
                this.wake();
            }
        } else {
            // 正常狀態衰減
            this.hunger += this.HUNGER_RATE * deltaSeconds;
            this.happiness -= this.HAPPINESS_RATE * deltaSeconds;
            this.cleanliness -= this.CLEANLINESS_RATE * deltaSeconds;
            this.energy -= this.ENERGY_RATE * deltaSeconds;

            // 飢餓會加速快樂度下降
            if (this.hunger > this.DANGER_THRESHOLD) {
                this.happiness -= (this.HAPPINESS_RATE * 0.5) * deltaSeconds;
            }

            // 髒了會影響快樂度
            if (this.cleanliness < this.LOW_THRESHOLD) {
                this.happiness -= (this.HAPPINESS_RATE * 0.3) * deltaSeconds;
            }
        }

        // 限制數值範圍
        this.hunger = Math.min(100, Math.max(0, this.hunger));
        this.happiness = Math.min(100, Math.max(0, this.happiness));
        this.cleanliness = Math.min(100, Math.max(0, this.cleanliness));
        this.energy = Math.min(100, Math.max(0, this.energy));

        // 年齡增加
        this.age += deltaSeconds / 60;

        // 隨機產生便便
        if (Math.random() < 0.001 * deltaSeconds && this.poopCount < 3) {
            this.poopCount++;
        }

        // 檢查階段轉換
        this.checkStageTransition();

        // 檢查死亡條件
        this.checkDeath();
    }

    // 檢查階段轉換
    checkStageTransition() {
        if (this.stage === 'egg' && this.age >= this.HATCH_TIME) {
            this.stage = 'baby';
            console.log('🐣 蛋孵化了！');
            return 'hatched';
        }

        if (this.stage === 'baby' && this.age >= this.GROW_TIME) {
            this.stage = 'adult';
            console.log('🎉 寵物長大了！');
            return 'grown';
        }

        return null;
    }

    // 檢查死亡條件
    checkDeath() {
        const isCritical =
            this.hunger >= 100 ||
            this.happiness <= 0 ||
            this.cleanliness <= 0 ||
            this.energy <= 0;

        if (isCritical) {
            if (!this.criticalStartTime) {
                this.criticalStartTime = Date.now();
                console.log('⚠️ 寵物狀態危險！');
            } else if (Date.now() - this.criticalStartTime >= this.CRITICAL_DEATH_TIME) {
                this.die();
            }
        } else {
            this.criticalStartTime = null;
        }
    }

    // 死亡
    die() {
        this.isAlive = false;
        this.deathTime = Date.now();
        console.log('💀 寵物死亡了...');
    }

    // 餵食
    feed() {
        if (!this.isAlive || this.stage === 'egg' || this.isSleeping) {
            return { success: false, message: this.getActionBlockedMessage('feed') };
        }

        if (this.hunger <= 10) {
            return { success: false, message: '寵物不餓！' };
        }

        this.hunger = Math.max(0, this.hunger - 30);
        this.happiness = Math.min(100, this.happiness + 5);

        return { success: true, message: '好吃！' };
    }

    // 玩耍
    play() {
        if (!this.isAlive || this.stage === 'egg' || this.isSleeping) {
            return { success: false, message: this.getActionBlockedMessage('play') };
        }

        if (this.energy < 20) {
            return { success: false, message: '太累了...' };
        }

        this.happiness = Math.min(100, this.happiness + 20);
        this.energy = Math.max(0, this.energy - 15);
        this.hunger = Math.min(100, this.hunger + 5);

        return { success: true, message: '好開心！', startMinigame: true };
    }

    // 清潔
    clean() {
        if (!this.isAlive || this.stage === 'egg' || this.isSleeping) {
            return { success: false, message: this.getActionBlockedMessage('clean') };
        }

        this.cleanliness = 100;
        this.happiness = Math.min(100, this.happiness + 5);
        this.poopCount = 0;

        return { success: true, message: '乾淨溜溜！' };
    }

    // 睡覺
    sleep() {
        if (!this.isAlive || this.stage === 'egg') {
            return { success: false, message: this.getActionBlockedMessage('sleep') };
        }

        if (this.isSleeping) {
            this.wake();
            return { success: true, message: '醒來了！', wakeUp: true };
        }

        if (this.energy > 80) {
            return { success: false, message: '不想睡...' };
        }

        this.isSleeping = true;
        return { success: true, message: '晚安...' };
    }

    // 醒來
    wake() {
        this.isSleeping = false;
    }

    // 獲取動作被阻止的訊息
    getActionBlockedMessage(action) {
        if (!this.isAlive) return '寵物已經不在了...';
        if (this.stage === 'egg') return '蛋還沒孵化！';
        if (this.isSleeping && action !== 'sleep') return '寵物在睡覺...';
        return '';
    }

    // 獲取當前狀態描述
    getStatus() {
        if (!this.isAlive) return 'dead';
        if (this.stage === 'egg') return 'egg';
        if (this.isSleeping) return 'sleeping';

        // 檢查危險狀態
        if (this.hunger >= this.DANGER_THRESHOLD) return 'hungry';
        if (this.happiness < this.LOW_THRESHOLD) return 'sad';
        if (this.cleanliness < this.LOW_THRESHOLD) return 'dirty';
        if (this.energy < 10) return 'tired';

        // 正常狀態
        if (this.happiness > 80) return 'happy';
        return 'normal';
    }

    // 獲取階段顯示文字
    getStageText() {
        const stages = {
            'egg': '🥚 蛋',
            'baby': '🐣 幼年',
            'adult': '🐔 成年'
        };
        return stages[this.stage] || '???';
    }

    // 序列化為可儲存的物件
    toJSON() {
        return {
            hunger: this.hunger,
            happiness: this.happiness,
            cleanliness: this.cleanliness,
            energy: this.energy,
            stage: this.stage,
            age: this.age,
            isAlive: this.isAlive,
            isSleeping: this.isSleeping,
            birthTime: this.birthTime,
            deathTime: this.deathTime,
            poopCount: this.poopCount
        };
    }
}
