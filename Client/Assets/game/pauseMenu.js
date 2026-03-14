class PauseMenu {
    constructor() {
        this.container = document.querySelector("#pause-menu");
        this.pages = Array.from(document.querySelectorAll(".pause-menu-page[data-page]"));
        this.root = document.querySelector(":root");

        this._page = 0; // 0 = closed, 1+ = current page number
        this.container.classList.remove("visible");
        this.pages.forEach((el) => el.classList.remove("active"));
        this._menuNav = null;
    }

    get page() {
        return this._page;
    }

    set page(n) {
        this._page = n;
        this.pages.forEach((el) => {
            const num = parseInt(el.getAttribute("data-page"), 10);
            el.classList.toggle("active", num === n);
        });
    }

    setPaused(paused) {
        this._page = paused ? 1 : 0;

        if (paused) {
            this.container.classList.add("visible");
            this.page = 1;
            this.root.style.setProperty("--drawMouse", "default");
            if (player) {
                player.canMove = false;
                if (player.resetBreaking) player.resetBreaking();
            }
            if (typeof MenuGamepadNavigator !== "undefined") {
                this._menuNav = new MenuGamepadNavigator(
                    () => this._getFocusables(),
                    () => (this._page > 1 ? () => this.setPage(1) : () => this.close()),
                    () => false
                );
                this._menuNav.start();
            }
        } else {
            if (this._menuNav) {
                this._menuNav.stop();
                this._menuNav = null;
            }
            this.container.classList.remove("visible");
            this.page = 0;
            this.root.style.setProperty("--drawMouse", "none");
            if (player) player.canMove = true;
        }
    }

    setPage(n) {
        if (n < 1 || n > this.pages.length) return;
        this._page = n;
        this.page = n;
        if (n === 2 && typeof updateDebugButtonLabels === "function") {
            updateDebugButtonLabels();
        }
    }

    getActive() {
        return this._page > 0;
    }

    _getFocusables() {
        const activePage = this.pages.find((p) => p.classList.contains("active"));
        if (!activePage) return [];
        return Array.from(activePage.querySelectorAll("button.btn, a.btn")).filter((el) => el.offsetParent != null);
    }

    update() {
        if (!input.isActionPressed("pause")) return;

        if (this.getActive()) {
            if (this._page > 1) {
                this.setPage(1);
            } else {
                this.close();
            }
            return;
        }

        if (chat.inChat || (player && player.windowOpen)) return;
        if (input._pauseConsumedByUI) {
            input._pauseConsumedByUI = false;
            return;
        }

        if (player && !loadingWorld) {
            this.open();
        }
    }

    open() {
        this.setPaused(true);
    }

    close() {
        this.setPaused(false);
    }
}
