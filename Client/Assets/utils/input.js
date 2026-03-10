class InputHandler {
    constructor(keyBindings) {
        this.keyBindings = keyBindings;
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
            leftMouseDown: false,
            rightMouseDown: false,
            leftMouseClicked: false, // Single-click tracking for left button
            rightMouseClicked: false, // Single-click tracking for right button
            wheelDown: false,
            position: { x: 0, y: 0 },
        };
        this.scroll = { deltaX: 0, deltaY: 0 }; // Store scroll delta
        this._initializeEventListeners();
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
        if (event.button === 0) {
            if (!this.mouse.leftMouseDown) {
                this.mouse.leftMouseClicked = true; // Set left mouse clicked only on the first press
            }
            this.mouse.leftMouseDown = true;
        } else if (event.button === 2) {
            if (!this.mouse.rightMouseDown) {
                this.mouse.rightMouseClicked = true; // Set right mouse clicked only on the first press
            }
            this.mouse.rightMouseDown = true;
        } else if (event.button === 1) {
            this.mouse.wheelDown = true;
        }
    }

    _handleMouseUp(event) {
        if (event.button === 0) {
            this.mouse.leftMouseDown = false;
            this.mouse.leftMouseClicked = false; // Reset single-click state
        } else if (event.button === 2) {
            this.mouse.rightMouseDown = false;
            this.mouse.rightMouseClicked = false; // Reset single-click state
        } else if (event.button === 1) {
            this.mouse.wheelDown = false;
        }
    }

    _handleMouseMove(event) {
        this.mouse.position.x = event.clientX;
        this.mouse.position.y = event.clientY;
    }

    _handleScroll(event) {
        this.scroll.deltaX = event.deltaX;
        this.scroll.deltaY = event.deltaY;
    }

    isActionDown(action) {
        if (action === "attack") return this.mouse.leftMouseDown;
        if (action === "place") return this.mouse.rightMouseDown;
        const keys = this.keyBindings[action];
        if (!keys) return false;
        return keys.some((k) => this.keys[k]);
    }
    isActionPressed(action) {
        if (action === "attack") return this.isLeftMouseButtonPressed();
        if (action === "place") return this.isRightMouseButtonPressed();
        const keys = this.keyBindings[action];
        if (!keys) return false;
        return keys.some((k) => this.keysDown[k]);
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

    // Getters for mouse state
    isLeftMouseButtonPressed() {
        if (this.mouse.leftMouseClicked) {
            // Check for single-click event
            this.mouse.leftMouseClicked = false; // Reset after being read
            return true;
        }
        return false;
    }

    isRightMouseButtonPressed() {
        if (this.mouse.rightMouseClicked) {
            // Check for single-click event
            this.mouse.rightMouseClicked = false; // Reset after being read
            return true;
        }
        return false;
    }

    getMousePosition() {
        const rect = CANVAS.getBoundingClientRect();
        const displayX = this.mouse.position.x - rect.left;
        const displayY = this.mouse.position.y - rect.top;
        // Scale from displayed canvas size to internal resolution (so cursor and hit-testing match)
        return {
            x: (displayX / rect.width) * CANVAS.width,
            y: (displayY / rect.height) * CANVAS.height,
        };
    }

    getMouseWorldPosition() {
        return {
            x: this.mouse.position.x + camera.x,
            y: this.mouse.position.y + camera.y,
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
        this.mouse.leftMouseDown = false;
        this.mouse.rightMouseDown = false;
        this.mouse.leftMouseClicked = false;
        this.mouse.rightMouseClicked = false;
    }

    // Direct mouse state checkers for continuous state
    isLeftMouseDown() {
        return this.mouse.leftMouseDown;
    }

    isRightMouseDown() {
        return this.mouse.rightMouseDown;
    }
}

const keyBindings = loadKeyBindings();
const input = new InputHandler(keyBindings);
