// intended for latin layouts
const DEFAULT_KEY_BINDINGS = {
    attack: ["Mouse0"],
    pickBlock: ["Mouse1"],
    place: ["Mouse2"],
    moveUp: ["KeyW"],
    moveDown: ["KeyS"],
    moveLeft: ["KeyA"],
    moveRight: ["KeyD"],
    jump: ["Space"],
    sprint: ["ShiftLeft", "ShiftRight"],
    use: ["KeyE"],
    drop: ["KeyQ"],
    hotbarUp: ["ScrollUp"],
    hotbarDown: ["ScrollDown"],
    hotbar1: ["Digit1"],
    hotbar2: ["Digit2"],
    hotbar3: ["Digit3"],
    hotbar4: ["Digit4"],
    hotbar5: ["Digit5"],
    hotbar6: ["Digit6"],
    hotbar7: ["Digit7"],
    hotbar8: ["Digit8"],
    hotbar9: ["Digit9"],
    chatOpen: ["KeyT"],
    chatCommand: ["Slash"],
    chatClose: ["Escape"],
    chatSubmit: ["Enter"],
    chatHistoryUp: ["ArrowUp"],
    chatHistoryDown: ["ArrowDown"],
    pause: ["Escape"],
    debugChunkBorders: ["KeyB"],
    debugCamera: ["KeyN"],
    debugHitbox: ["KeyH"],
    debugPrintBlock: ["KeyM"],
    debugFileSize: ["KeyF"],
    debugFps: ["KeyI"],
    debugCoordinates: ["KeyC"],
    debugSave: ["KeyO"],
    debugSaveBackup: ["KeyP"],
};

const ACTION_LABELS = {
    attack: "Attack/Destroy",
    pickBlock: "Pick Block",
    place: "Use Item/Place Block",
    moveUp: "Move Up",
    moveDown: "Move Down",
    moveLeft: "Move Left",
    moveRight: "Move Right",
    jump: "Jump",
    sprint: "Sprint",
    use: "Inventory",
    drop: "Drop",
    hotbarUp: "Hotbar Left",
    hotbarDown: "Hotbar Right",
    hotbar1: "Hotbar Slot 1",
    hotbar2: "Hotbar Slot 2",
    hotbar3: "Hotbar Slot 3",
    hotbar4: "Hotbar Slot 4",
    hotbar5: "Hotbar Slot 5",
    hotbar6: "Hotbar Slot 6",
    hotbar7: "Hotbar Slot 7",
    hotbar8: "Hotbar Slot 8",
    hotbar9: "Hotbar Slot 9",
    chatOpen: "Open Chat",
    chatCommand: "Open Command",
    chatClose: "Close Chat",
    chatSubmit: "Send Message",
    chatHistoryUp: "Chat History Up",
    chatHistoryDown: "Chat History Down",
    pause: "Pause / Back",
    debugChunkBorders: "Chunk Borders",
    debugCamera: "Camera",
    debugHitbox: "Hitbox",
    debugPrintBlock: "Print Block",
    debugFileSize: "File Size",
    debugFps: "FPS",
    debugCoordinates: "Coordinates",
    debugSave: "Save World",
    debugSaveBackup: "Save Backup",
};

const GAMEPLAY_ACTIONS = [
    "attack",
    "pickBlock",
    "place",
    "moveUp",
    "moveDown",
    "moveLeft",
    "moveRight",
    "jump",
    "sprint",
    "use",
    "drop",
    "hotbarUp",
    "hotbarDown",
    "hotbar1",
    "hotbar2",
    "hotbar3",
    "hotbar4",
    "hotbar5",
    "hotbar6",
    "hotbar7",
    "hotbar8",
    "hotbar9",
    "chatOpen",
    "chatCommand",
];

const DEBUG_ACTIONS = [
    "debugChunkBorders",
    "debugCamera",
    "debugHitbox",
    "debugPrintBlock",
    "debugFileSize",
    "debugFps",
    "debugCoordinates",
    "debugSave",
    "debugSaveBackup",
];

const REBINDABLE_ACTIONS = [...GAMEPLAY_ACTIONS, ...DEBUG_ACTIONS];

// Gamepad: one controller (index 0). Buttons 0–11, axes 0–3 (left X/Y, right X/Y).
// Axis bindings use _Neg (value < -deadzone) or _Pos (value > deadzone).
const DEFAULT_GAMEPAD_BINDINGS = {
    attack: ["Gamepad0_Button7"],
    pickBlock: ["Gamepad0_Button3"],
    place: ["Gamepad0_Button6"],
    moveUp: ["Gamepad0_Axis1_Neg"],
    moveDown: ["Gamepad0_Axis1_Pos"],
    moveLeft: ["Gamepad0_Axis0_Neg"],
    moveRight: ["Gamepad0_Axis0_Pos"],
    jump: ["Gamepad0_Button0"],
    sprint: ["Gamepad0_Button10"],
    use: ["Gamepad0_Button2"],
    drop: ["Gamepad0_Button1"],
    hotbarUp: ["Gamepad0_Button4"],
    hotbarDown: ["Gamepad0_Button5"],
    hotbar1: [],
    hotbar2: [],
    hotbar3: [],
    hotbar4: [],
    hotbar5: [],
    hotbar6: [],
    hotbar7: [],
    hotbar8: [],
    hotbar9: [],
    chatOpen: ["Gamepad0_Button8"],
    chatCommand: [],
    chatClose: ["Gamepad0_Button1"],
    chatSubmit: ["Gamepad0_Button0"],
    chatHistoryUp: [],
    chatHistoryDown: [],
    pause: ["Gamepad0_Button9"],
    debugChunkBorders: [],
    debugCamera: [],
    debugHitbox: [],
    debugPrintBlock: [],
    debugFileSize: [],
    debugFps: [],
    debugCoordinates: [],
    debugSave: [],
    debugSaveBackup: [],
};

const GAMEPAD_DISPLAY_NAMES = {
    Gamepad0_Button0: "A",
    Gamepad0_Button1: "B",
    Gamepad0_Button2: "X",
    Gamepad0_Button3: "Y",
    Gamepad0_Button4: "LB",
    Gamepad0_Button5: "RB",
    Gamepad0_Button6: "LT",
    Gamepad0_Button7: "RT",
    Gamepad0_Button8: "Back",
    Gamepad0_Button9: "Start",
    Gamepad0_Button10: "L3",
    Gamepad0_Button11: "R3",
    Gamepad0_Axis0_Neg: "Left Stick Left",
    Gamepad0_Axis0_Pos: "Left Stick Right",
    Gamepad0_Axis1_Neg: "Left Stick Up",
    Gamepad0_Axis1_Pos: "Left Stick Down",
};

const KEY_DISPLAY_NAMES = {
    Mouse0: "Left Click",
    Mouse1: "Middle Click",
    Mouse2: "Right Click",
    ScrollUp: "Scroll Up",
    ScrollDown: "Scroll Down",
    KeyA: "A",
    KeyB: "B",
    KeyC: "C",
    KeyD: "D",
    KeyE: "E",
    KeyF: "F",
    KeyG: "G",
    KeyH: "H",
    KeyI: "I",
    KeyJ: "J",
    KeyK: "K",
    KeyL: "L",
    KeyM: "M",
    KeyN: "N",
    KeyO: "O",
    KeyP: "P",
    KeyQ: "Q",
    KeyR: "R",
    KeyS: "S",
    KeyT: "T",
    KeyU: "U",
    KeyV: "V",
    KeyW: "W",
    KeyX: "X",
    KeyY: "Y",
    KeyZ: "Z",
    Digit0: "0",
    Digit1: "1",
    Digit2: "2",
    Digit3: "3",
    Digit4: "4",
    Digit5: "5",
    Digit6: "6",
    Digit7: "7",
    Digit8: "8",
    Digit9: "9",
    Space: "Space",
    ArrowUp: "Up",
    ArrowDown: "Down",
    ArrowLeft: "Left",
    ArrowRight: "Right",
    Escape: "Escape",
    Enter: "Enter",
    ShiftLeft: "Left Shift",
    ShiftRight: "Right Shift",
    ControlLeft: "Left Ctrl",
    ControlRight: "Right Ctrl",
    AltLeft: "Left Alt",
    AltRight: "Right Alt",
    Tab: "Tab",
    Backspace: "Backspace",
    Minus: "-",
    Equal: "=",
    Backquote: "`",
    Slash: "/",
    Backslash: "\\",
    Period: ".",
    Delete: "Delete",
};

function getKeyDisplayName(keyCode) {
    return KEY_DISPLAY_NAMES[keyCode] || keyCode;
}

function getButtonDisplayName(code) {
    if (GAMEPAD_DISPLAY_NAMES[code]) return GAMEPAD_DISPLAY_NAMES[code];
    return KEY_DISPLAY_NAMES[code] || code;
}

function getActionLabel(action) {
    return ACTION_LABELS[action] || action;
}

const INPUT_TYPE = Object.freeze({ KEYBOARD: "keyboard", CONTROLLER: "controller" });

const BINDINGS_CONFIG = Object.freeze({
    [INPUT_TYPE.KEYBOARD]: {
        storageKey: "keyBindings",
        defaults: DEFAULT_KEY_BINDINGS,
        pauseBinding: ["Escape"],
    },
    [INPUT_TYPE.CONTROLLER]: {
        storageKey: "gamepadBindings",
        defaults: DEFAULT_GAMEPAD_BINDINGS,
        pauseBinding: ["Gamepad0_Button9"],
    },
});

function loadBindings(inputType) {
    const config = BINDINGS_CONFIG[inputType];
    if (!config) return {};
    try {
        const raw = localStorage.getItem(config.storageKey);
        if (!raw) return { ...config.defaults };

        const parsed = JSON.parse(raw);
        const out = { ...config.defaults };
        for (const action of Object.keys(config.defaults)) {
            if (Array.isArray(parsed[action])) {
                out[action] = parsed[action];
            }
        }
        return out;
    } catch (e) {
        return { ...config.defaults };
    }
}

function saveBindings(inputType, bindings) {
    const config = BINDINGS_CONFIG[inputType];
    if (!config) return;
    const out = { ...bindings };
    out.pause = config.pauseBinding;
    localStorage.setItem(config.storageKey, JSON.stringify(out));
}
