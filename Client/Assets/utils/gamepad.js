function getFirstConnectedGamepad() {
    if (typeof navigator === "undefined" || !navigator.getGamepads) return null;
    const list = navigator.getGamepads();
    for (let i = 0; i < (list ? list.length : 0); i++) {
        if (list[i] && list[i].connected) return list[i];
    }
    return null;
}

function _gamepadBtn(gp, i) {
    return !!(gp && gp.buttons[i] && (typeof gp.buttons[i] === "object" ? gp.buttons[i].value > 0.5 : gp.buttons[i]));
}

class MenuGamepadNavigator {
    constructor(getFocusables, getBackAction, getIsRebinding) {
        this.getFocusables = getFocusables;
        this.getBackAction = getBackAction;
        this.getIsRebinding = getIsRebinding;
        this.throttleMs = 180;
        this.axisThreshold = 0.4;
        this.sliderStepMs = 80;
        this.sliderMaxSpeed = 12;
        this.rafId = null;
        this.lastAxis = [0, 0, 0, 0];
        this.lastBtn12 = false;
        this.lastBtn13 = false;
        this.lastMoveTime = 0;
        this.lastFrameTime = 0;
        this.lastA = false;
        this.lastB = false;
        this.sliderSpeed = 0;
        this.sliderLastStepTime = 0;
        this.sliderWasAdjusting = false;
    }

    _nextFocusIndex(focusables, currentIdx, direction) {
        const len = focusables.length;
        if (len === 0) return -1;
        let next = (currentIdx + direction + len) % len;
        let steps = 0;
        while (focusables[next].disabled && steps < len) {
            next = (next + direction + len) % len;
            steps++;
        }
        return focusables[next].disabled ? currentIdx : next;
    }

    _firstEnabled(focusables) {
        for (let i = 0; i < focusables.length; i++) {
            if (!focusables[i].disabled) return i;
        }
        return -1;
    }

    _ensureFocusable(el) {
        if (el.tabIndex === -1 || (el.getAttribute && !el.hasAttribute("tabindex"))) {
            el.setAttribute("tabindex", "0");
        }
    }

    start() {
        if (this.rafId != null) return;
        const loop = () => {
            this._tick(loop);
        };
        this.rafId = requestAnimationFrame(loop);
    }

    stop() {
        if (this.rafId != null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    _tick(scheduleNext) {
        const gp = getFirstConnectedGamepad();
        const focusables = this.getFocusables();
        const rebinding = this.getIsRebinding();

        if (focusables.length === 0 || (rebinding && focusables.length > 0)) {
            this.rafId = requestAnimationFrame(scheduleNext);
            return;
        }

        focusables.forEach((el) => el.classList.remove("menu-focused"));
        if (document.activeElement && focusables.includes(document.activeElement)) {
            document.activeElement.classList.add("menu-focused");
        }

        const now = Date.now();
        const dt = this.lastFrameTime > 0 ? (now - this.lastFrameTime) / 1000 : 0;
        this.lastFrameTime = now;
        const throttleOk = now - this.lastMoveTime >= this.throttleMs;

        const ax = (i) => (gp && gp.connected && gp.axes[i] != null ? gp.axes[i] : 0);
        const axis0 = ax(0);
        const axis1 = ax(1);
        const axis6 = ax(6);
        const axis7 = ax(7);
        const dpadUp = axis7 < -this.axisThreshold || _gamepadBtn(gp, 12);
        const dpadDown = axis7 > this.axisThreshold || _gamepadBtn(gp, 13);
        const dpadLeft = axis6 < -this.axisThreshold || _gamepadBtn(gp, 14);
        const dpadRight = axis6 > this.axisThreshold || _gamepadBtn(gp, 15);
        const up = axis1 < -this.axisThreshold || dpadUp;
        const down = axis1 > this.axisThreshold || dpadDown;
        const left = axis0 < -this.axisThreshold || dpadLeft;
        const right = axis0 > this.axisThreshold || dpadRight;
        const prevUp = this.lastAxis[1] < -this.axisThreshold || (this.lastAxis[3] != null && this.lastAxis[3] < -this.axisThreshold) || this.lastBtn12;
        const prevDown = this.lastAxis[1] > this.axisThreshold || (this.lastAxis[3] != null && this.lastAxis[3] > this.axisThreshold) || this.lastBtn13;
        this.lastAxis[0] = axis0;
        this.lastAxis[1] = axis1;
        this.lastAxis[2] = axis6;
        this.lastAxis[3] = axis7;
        this.lastBtn12 = _gamepadBtn(gp, 12);
        this.lastBtn13 = _gamepadBtn(gp, 13);

        if (!gp || !gp.connected || rebinding) {
            this.lastA = false;
            this.lastB = false;
            this.rafId = requestAnimationFrame(scheduleNext);
            return;
        }

        focusables.forEach((el) => this._ensureFocusable(el));
        if (!focusables.includes(document.activeElement)) {
            const idx = this._firstEnabled(focusables);
            if (idx >= 0) focusables[idx].focus();
        }

        const active = document.activeElement;
        if (active && active.type === "range" && focusables.includes(active)) {
            const min = parseFloat(active.min) || 0;
            const max = parseFloat(active.max) || 100;
            const step = parseFloat(active.step) || 1;
            const goingLeft = left && !right;
            const goingRight = right && !left;
            const holding = goingLeft || goingRight;
            const wasAdjusting = this.sliderWasAdjusting;
            if (!holding) {
                this.sliderSpeed = 0;
                this.sliderLastStepTime = 0;
                this.sliderWasAdjusting = false;
                if (wasAdjusting) active.dispatchEvent(new Event("change", { bubbles: true }));
            } else {
                const dir = goingRight ? 1 : -1;
                if (this.sliderLastStepTime === 0) this.sliderLastStepTime = now;
                if (now - this.sliderLastStepTime >= this.sliderStepMs) {
                    this.sliderSpeed = Math.min(this.sliderMaxSpeed, this.sliderSpeed + 1);
                    let val = parseFloat(active.value) || min;
                    val = Math.max(min, Math.min(max, val + this.sliderSpeed * step * dir));
                    active.value = String(val);
                    active.dispatchEvent(new Event("input", { bubbles: true }));
                    this.sliderLastStepTime += this.sliderStepMs;
                    if (this.sliderLastStepTime > now) this.sliderLastStepTime = now;
                }
                this.sliderWasAdjusting = true;
            }
        } else {
            this.sliderSpeed = 0;
            this.sliderLastStepTime = 0;
            this.sliderWasAdjusting = false;
        }

        if (throttleOk && (up && !prevUp)) {
            const idx = focusables.indexOf(document.activeElement);
            const nextIdx = idx < 0 ? this._firstEnabled(focusables) : this._nextFocusIndex(focusables, idx, -1);
            if (nextIdx >= 0 && nextIdx !== idx) {
                focusables[nextIdx].focus();
                this.lastMoveTime = now;
            }
        } else if (throttleOk && (down && !prevDown)) {
            const idx = focusables.indexOf(document.activeElement);
            const nextIdx = idx < 0 ? this._firstEnabled(focusables) : this._nextFocusIndex(focusables, idx, 1);
            if (nextIdx >= 0 && nextIdx !== idx) {
                focusables[nextIdx].focus();
                this.lastMoveTime = now;
            }
        }

        const aPressed = _gamepadBtn(gp, 0);
        const bPressed = _gamepadBtn(gp, 1);
        if (aPressed && !this.lastA && document.activeElement && focusables.includes(document.activeElement) && !document.activeElement.disabled) {
            document.activeElement.click();
        }
        if (bPressed && !this.lastB) {
            const back = this.getBackAction();
            if (back) back();
        }
        this.lastA = aPressed;
        this.lastB = bPressed;

        this.rafId = requestAnimationFrame(scheduleNext);
    }
}
