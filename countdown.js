// 倒计时功能模块 - 右上角 60 分钟（可改）
(function () {
    /* ========== 配置 ========== */
    const STORAGE_KEY_TIME   = 'countdownStartTime';
    const STORAGE_KEY_JUMPED = 'countdownJumped'; // 防止重复跳转
    const TOTAL_MINUTES      = 60;               // 这里改成 60 就是 60 分钟
    const TOTAL_SECONDS      = TOTAL_MINUTES * 60;
    const JUMP_DELAY_MS      = 100;               // 归零后延迟跳转
    
    // 重置倒计时（当需要重新开始游戏时）
    function resetCountdown() {
        sessionStorage.removeItem(STORAGE_KEY_TIME);
        sessionStorage.removeItem(STORAGE_KEY_JUMPED);
        sessionStorage.removeItem('countdownEnded');
    }
    
    // 检查是否需要重置（例如从index.html进入时）
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'index.html' || !sessionStorage.getItem(STORAGE_KEY_TIME)) {
        resetCountdown();
    }

    /* ========== 启动屏障 ========== */
    if (sessionStorage.getItem(STORAGE_KEY_JUMPED) === 'true') return;

    let startTime = sessionStorage.getItem(STORAGE_KEY_TIME);
    if (!startTime) {
        startTime = Date.now();
        sessionStorage.setItem(STORAGE_KEY_TIME, startTime);
    }

    /* ========== DOM 就绪后再干活 ========== */
    function ready(fn) {
        if (document.body) fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        /* --------- 创建/复用倒计时框 --------- */
        let box = document.getElementById('game-countdown');
        if (!box) {
            box = document.createElement('div');
            box.id = 'game-countdown';
            box.style.cssText =
                'position:fixed;top:10px;right:10px;background:#f44336;color:#fff;' +
                'padding:10px 15px;border-radius:5px;font-weight:bold;z-index:9999;' +
                'min-width:120px;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,.3);' +
                'transition:opacity .2s;';
            document.body.appendChild(box);
        }

        /* --------- 更新循环 --------- */
        function tick() {
            /* 二次保险：一旦标记过就什么都不做 */
            if (sessionStorage.getItem(STORAGE_KEY_JUMPED) === 'true') return;

            const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
            const remain  = Math.max(0, TOTAL_SECONDS - elapsed);

            const m = Math.floor(remain / 60);
            const s = remain % 60;
            box.textContent = `剩余时间: ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

            if (remain <= 0) {
                // 设置结局类型为'c'（黑暗结局）
                sessionStorage.setItem('endingType', 'c');
                
                // 标记已跳转 + 立即淡出移除
                sessionStorage.setItem(STORAGE_KEY_JUMPED, 'true');
                box.style.opacity = '0';
                setTimeout(() => box.remove(), 200);

                // 延迟跳转（给淡出留时间）
                setTimeout(() => {
                    window.location.href = 'ending.html';
                }, JUMP_DELAY_MS);
                return;               // 关键：不再继续 setTimeout
            }

            setTimeout(tick, 1000);
        }

        tick();
    });
})();
