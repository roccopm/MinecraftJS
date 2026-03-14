const GAMEPAD_DEADZONE = 0.15;
const GAMEPAD_CURSOR_SENSITIVITY = 400;

class InputHandler {
    constructor(keyBindings, gamepadBindings) {
        this.keyBindings = keyBindings;
        this.gamepadBindings = gamepadBindings || {};
        const keysFromBindings = new Set();
        for (const keys of Object.values(keyBindings)) {
            for (const k of keys) keysFromBindings.add(k);
        }

        this.keys = {}; // Tracks whether a key is held down
        this.keysDown = {}; // Tracks single press events
        this._pauseConsumedByUI = false;
        keysFromBindings.forEach((key) => {
            this.keys[key] = false;
            this.keysDown[key] = false;
        });

        this.mouse = {
            buttons: [false, false, false], // [left, middle, right] down state
            clicked: [false, false, false], // [left, middle, right] single-press (consumed when read)
            position: { x: 0, y: 0 },
        };
        this.scroll = { deltaX: 0, deltaY: 0 }; // Store scroll delta

        this.inputMode = "keyboard";
        this.gamepadButtons = [];
        this.gamepadButtonsDown = [];
        this.gamepadAxes = [0, 0, 0, 0];
        this._virtualCursor = { x: 0, y: 0 };
        this._virtualCursorInitialized = false;

        this._initializeEventListeners();
    }

    getBindings() {
        return this.inputMode === "controller" ? this.gamepadBindings : this.keyBindings;
    }

    getInputMode() {
        return this.inputMode;
    }

    setGamepadBindings(bindings) {
        this.gamepadBindings = bindings;
    }

    get shiftPressed() {
        return !!(this.keys["ShiftLeft"] || this.keys["ShiftRight"]);
    }

    _initializeEventListeners() {
        document.addEventListener("keydown", (event) =>
            this._handleKeyDown(event)
        );
        document.addEventListener("keyup", (event) => this._handleKeyUp(event));
        document.addEventListener("mousedown", (event) =>
            this._handleMouseDown(event)
        );
        document.addEventListener("mouseup", (event) =>
            this._handleMouseUp(event)
        );
        document.addEventListener("mousemove", (event) =>
            this._handleMouseMove(event)
        );
        document.addEventListener("wheel", (event) =>
            this._handleScroll(event)
        );
    }

    _handleKeyDown(event) {
        this.inputMode = "keyboard";
        this._virtualCursorInitialized = false;
        if (typeof chat !== "undefined" && chat.inChat) return;
        const key = event.code;
        if (typeof pauseMenu !== "undefined" && pauseMenu.getActive()) {
            const pauseKeys = this.keyBindings.pause;
            if (!pauseKeys || !pauseKeys.includes(key)) return;
        }
        if (!(key in this.keys)) {
            this.keys[key] = false;
            this.keysDown[key] = false;
        }
        if (key in this.keys) {
            event.preventDefault(); // Prevent default action for all keys

            if (!this.keys[key]) {
                this.keysDown[key] = true; // Set keysDown only on the first keydown
            }
            this.keys[key] = true; // Keep keys set to true as long as the key is held down
            if (typeof chat !== "undefined" && !chat.inChat) {
                if (this.keyBindings.chatOpen && this.keyBindings.chatOpen.includes(key)) {
                    chat.openChat();
                } else if (this.keyBindings.chatCommand && this.keyBindings.chatCommand.includes(key)) {
                    chat.currentMessage = "/";
                    chat.cursorPosition = 1;
                    chat.openChat();
                }
            }
        }
    }

    _handleKeyUp(event) {
        const key = event.code;
        if (!(key in this.keys)) {
            this.keys[key] = false;
            this.keysDown[key] = false;
        }
        if (key in this.keys) {
            this.keys[key] = false;
            this.keysDown[key] = false;
        }
    }

    _handleMouseDown(event) {
        this.inputMode = "keyboard";
        this._virtualCursorInitialized = false;
        if (event.button >= 0 && event.button <= 2) {
            if (!this.mouse.buttons[event.button]) {
                this.mouse.clicked[event.button] = true;
            }
            this.mouse.buttons[event.button] = true;
        }
    }

    _handleMouseUp(event) {
        if (event.button >= 0 && event.button <= 2) {
            this.mouse.buttons[event.button] = false;
            this.mouse.clicked[event.button] = false;
        }
    }

    _handleMouseMove(event) {
        this.inputMode = "keyboard";
        this._virtualCursorInitialized = false;
        this.mouse.position.x = event.clientX;
        this.mouse.position.y = event.clientY;
    }

    _handleScroll(event) {
        this.inputMode = "keyboard";
        this._virtualCursorInitialized = false;
        this.scroll.deltaX = event.deltaX;
        this.scroll.deltaY = event.deltaY;
    }

    _mouseBindingToIndex(b) {
        if (b === "Mouse0") return 0;
        if (b === "Mouse1") return 1;
        if (b === "Mouse2") return 2;
        return -1;
    }

    _applyDeadzone(value) {
        if (Math.abs(value) <= GAMEPAD_DEADZONE) return 0;
        return (value - Math.sign(value) * GAMEPAD_DEADZONE) / (1 - GAMEPAD_DEADZONE);
    }

    _parseGamepadBinding(code) {
        const match = code.match(/^Gamepad0_Button(\d+)$/);
        if (match) return { type: "button", index: parseInt(match[1], 10) };
        const axisMatch = code.match(/^Gamepad0_Axis(\d+)_(Neg|Pos)$/);
        if (axisMatch) return { type: "axis", index: parseInt(axisMatch[1], 10), sign: axisMatch[2] };
        return null;
    }

    _isGamepadBindingDown(code) {
        const p = this._parseGamepadBinding(code);
        if (!p) return false;
        if (p.type === "button") return !!(this.gamepadButtons[p.index]);
        if (p.type === "axis") {
            const v = this.gamepadAxes[p.index] || 0;
            if (p.sign === "Neg") return v < -GAMEPAD_DEADZONE;
            return v > GAMEPAD_DEADZONE;
        }
        return false;
    }

    pollGamepad(deltaTime) {
        const gp = typeof getFirstConnectedGamepad === "function" ? getFirstConnectedGamepad() : (navigator.getGamepads && navigator.getGamepads()[0]) || null;
        if (!gp || !gp.connected) {
            this.gamepadButtons = [];
            this.gamepadButtonsDown = [];
            this.gamepadAxes = [0, 0, 0, 0];
            this.inputMode = "keyboard";
            this._virtualCursorInitialized = false;
            return;
        }
        const prevButtons = this.gamepadButtons.slice();
        this.gamepadButtons = Array.from(gp.buttons).map((b) => (typeof b === "object" ? b.value > 0.5 : !!b));
        if (this.gamepadButtonsDown.length < this.gamepadButtons.length) {
            this.gamepadButtonsDown.length = this.gamepadButtons.length;
        }
        for (let i = 0; i < this.gamepadButtons.length; i++) {
            if (!this.gamepadButtons[i]) this.gamepadButtonsDown[i] = false;
            else if (this.gamepadButtons[i] && !prevButtons[i]) this.gamepadButtonsDown[i] = true;
        }
        const rawAxes = Array.from(gp.axes);
        this.gamepadAxes = rawAxes.map((a, i) => this._applyDeadzone(a));
        const anyGamepadUsed =
            this.gamepadButtons.some(Boolean) || this.gamepadAxes.some((a) => Math.abs(a) > 0);
        if (anyGamepadUsed) this.inputMode = "controller";

        if (this.inputMode === "controller" && typeof CANVAS !== "undefined" && CANVAS) {
            if (!this._virtualCursorInitialized) {
                this._virtualCursor.x = CANVAS.width / 2;
                this._virtualCursor.y = CANVAS.height / 2;
                this._virtualCursorInitialized = true;
            }
            const rx = this.gamepadAxes[2] || 0;
            const ry = this.gamepadAxes[3] || 0;
            const scale = GAMEPAD_CURSOR_SENSITIVITY * (deltaTime || 0.016);
            this._virtualCursor.x = Math.max(0, Math.min(CANVAS.width, this._virtualCursor.x + rx * scale));
            this._virtualCursor.y = Math.max(0, Math.min(CANVAS.height, this._virtualCursor.y + ry * scale));
        }
    }

    isActionDown(action) {
        if (this.inputMode === "controller") {
            const keys = this.gamepadBindings[action];
            if (!keys) return false;
            return keys.some((b) => this._isGamepadBindingDown(b));
        }
        const keys = this.keyBindings[action];
        if (!keys) return false;
        return keys.some((b) => {
            if (b === "ScrollUp" || b === "ScrollDown") return false; // scroll has no hold state
            const idx = this._mouseBindingToIndex(b);
            if (idx >= 0) return this.mouse.buttons[idx];
            return !!this.keys[b];
        });
    }
    isActionPressed(action) {
        if (this.inputMode === "controller") {
            const keys = this.gamepadBindings[action];
            if (!keys) return false;
            for (const b of keys) {
                const p = this._parseGamepadBinding(b);
                if (p && p.type === "button" && this.gamepadButtonsDown[p.index]) {
                    this.gamepadButtonsDown[p.index] = false;
                    return true;
                }
                if (p && p.type === "axis") return false; // axes don't have "pressed" in same way
            }
            return false;
        }
        const keys = this.keyBindings[action];
        if (!keys) return false;
        for (const b of keys) {
            const idx = this._mouseBindingToIndex(b);
            if (idx >= 0) {
                if (this.mouse.clicked[idx]) {
                    this.mouse.clicked[idx] = false;
                    return true;
                }
            } else if (b === "ScrollUp" && this.scroll.deltaY < 0) {
                this.scroll.deltaY = 0;
                return true;
            } else if (b === "ScrollDown" && this.scroll.deltaY > 0) {
                this.scroll.deltaY = 0;
                return true;
            } else if (this.keysDown[b]) {
                return true;
            }
        }
        return false;
    }

    // Getters for key state
    isKeyDown(keyCode) {
        return this.keys[keyCode] || false; // True as long as the key is held down
    }

    isKeyPressed(keyCode) {
        return this.keysDown[keyCode] || false;
    }

    getChatTypingKeys() {
        return Object.keys(this.keys);
    }

    resetKeysPressed() {
        for (const key in this.keysDown) {
            this.keysDown[key] = false;
        }
    }

    // Getters for mouse state (physical buttons; inventory UI uses these)
    isLeftMouseButtonPressed() {
        if (this.mouse.clicked[0]) {
            this.mouse.clicked[0] = false;
            return true;
        }
        return false;
    }

    isRightMouseButtonPressed() {
        if (this.mouse.clicked[2]) {
            this.mouse.clicked[2] = false;
            return true;
        }
        return false;
    }

    getMousePosition() {
        if (this.inputMode === "controller") {
            return { x: this._virtualCursor.x, y: this._virtualCursor.y };
        }
        if (typeof CANVAS === "undefined" || !CANVAS) {
            return { x: this.mouse.position.x, y: this.mouse.position.y };
        }
        const rect = CANVAS.getBoundingClientRect();
        const displayX = this.mouse.position.x - rect.left;
        const displayY = this.mouse.position.y - rect.top;
        return {
            x: (displayX / rect.width) * CANVAS.width,
            y: (displayY / rect.height) * CANVAS.height,
        };
    }

    getMouseWorldPosition() {
        const pos = this.getMousePosition();
        return {
            x: pos.x + camera.x,
            y: pos.y + camera.y,
        };
    }

    getMousePositionOnBlockGrid() {
        const pos = this.getMousePosition();

        const gridX = Math.floor((pos.x + camera.x) / BLOCK_SIZE) * BLOCK_SIZE;
        const gridY = Math.floor((pos.y + camera.y) / BLOCK_SIZE) * BLOCK_SIZE;

        return new Vector2(Math.floor(gridX), Math.floor(gridY));
    }

    // Getters for scroll state
    getScrollDelta() {
        const scrollDelta = { ...this.scroll };
        this.scroll.deltaX = 0;
        this.scroll.deltaY = 0;
        return scrollDelta;
    }

    // Resetters for mouse button states
    resetMouseState() {
        this.mouse.buttons[0] = false;
        this.mouse.buttons[1] = false;
        this.mouse.buttons[2] = false;
        this.mouse.clicked[0] = false;
        this.mouse.clicked[1] = false;
        this.mouse.clicked[2] = false;
    }

    // Direct mouse state checkers for continuous state
    isLeftMouseDown() {
        return this.mouse.buttons[0];
    }

    isRightMouseDown() {
        return this.mouse.buttons[2];
    }
}

const keyBindings = typeof loadBindings === "function" ? loadBindings("keyboard") : {};
const gamepadBindings = typeof loadBindings === "function" ? loadBindings("controller") : {};
const input = new InputHandler(keyBindings, gamepadBindings);
