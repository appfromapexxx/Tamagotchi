// ===================================
// 電子雞 - LocalStorage 管理模組
// ===================================

const Storage = {
    SAVE_KEY: 'tamagotchi_save',

    // 儲存遊戲狀態
    save(gameState) {
        try {
            const data = {
                ...gameState,
                lastSaveTime: Date.now()
            };
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
            console.log('遊戲已儲存');
            return true;
        } catch (error) {
            console.error('儲存失敗:', error);
            return false;
        }
    },

    // 載入遊戲狀態
    load() {
        try {
            const data = localStorage.getItem(this.SAVE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                console.log('遊戲已載入');
                return parsed;
            }
            return null;
        } catch (error) {
            console.error('載入失敗:', error);
            return null;
        }
    },

    // 計算離線時間造成的狀態變化
    calculateOfflineChanges(savedState) {
        if (!savedState || !savedState.lastSaveTime) {
            return savedState;
        }

        const now = Date.now();
        const elapsedMs = now - savedState.lastSaveTime;
        const elapsedMinutes = elapsedMs / 1000 / 60;

        console.log(`離線時間: ${elapsedMinutes.toFixed(1)} 分鐘`);

        // 如果離線時間太短，不需要計算
        if (elapsedMinutes < 1) {
            return savedState;
        }

        // 寵物已死亡，不需要計算
        if (!savedState.pet.isAlive) {
            return savedState;
        }

        // 蛋階段不受影響
        if (savedState.pet.stage === 'egg') {
            // 但要計算孵化時間
            savedState.pet.age += elapsedMinutes;
            return savedState;
        }

        // 計算狀態衰減（離線時衰減較慢，只有正常速度的 50%）
        const offlineMultiplier = 0.5;

        // 飢餓度增加
        savedState.pet.hunger += Math.min(100, elapsedMinutes * 5 * offlineMultiplier);
        savedState.pet.hunger = Math.min(100, savedState.pet.hunger);

        // 快樂度減少
        savedState.pet.happiness -= elapsedMinutes * 3 * offlineMultiplier;
        savedState.pet.happiness = Math.max(0, savedState.pet.happiness);

        // 清潔度減少
        savedState.pet.cleanliness -= elapsedMinutes * 2 * offlineMultiplier;
        savedState.pet.cleanliness = Math.max(0, savedState.pet.cleanliness);

        // 體力：睡覺時恢復，醒著時消耗
        if (savedState.pet.isSleeping) {
            savedState.pet.energy += elapsedMinutes * 5 * offlineMultiplier;
            savedState.pet.energy = Math.min(100, savedState.pet.energy);
        } else {
            savedState.pet.energy -= elapsedMinutes * 1 * offlineMultiplier;
            savedState.pet.energy = Math.max(0, savedState.pet.energy);
        }

        // 年齡增加
        savedState.pet.age += elapsedMinutes;

        // 檢查是否應該死亡（極端情況持續太久）
        const criticalTime = 30; // 30 分鐘的極端狀態
        if (elapsedMinutes > criticalTime) {
            if (savedState.pet.hunger >= 100 ||
                savedState.pet.happiness <= 0 ||
                savedState.pet.cleanliness <= 0) {
                savedState.pet.isAlive = false;
                savedState.pet.deathTime = now;
                console.log('寵物在離線期間死亡了...');
            }
        }

        return savedState;
    },

    // 清除存檔
    clear() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            console.log('存檔已清除');
            return true;
        } catch (error) {
            console.error('清除存檔失敗:', error);
            return false;
        }
    },

    // 檢查是否有存檔
    hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }
};
