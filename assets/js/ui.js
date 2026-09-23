export default class UI {
    constructor() {
        this.el = {
            ticketNormal: document.getElementById("ticketNormal"),
            ticketPreferential: document.getElementById("ticketPreferential"),
            inNormalTicket: document.getElementById("inNormalTicket"),
            inPreferTicket: document.getElementById("inPreferTicket"),
            inVoiceList: document.getElementById("inVoiceList"),
            inVoiceRate: document.getElementById("inVoiceRate"),
            inVoiceRateValue: document.getElementById("inVoiceRateValue"),
            inVoicePitch: document.getElementById("inVoicePitch"),
            inVoicePitchValue: document.getElementById("inVoicePitchValue"),
            inToneDuration: document.getElementById("inToneDuration"),
            inToneCount: document.getElementById("inToneCount"),
            toneSequenceControls: document.getElementById("toneSequenceControls"),
            btnTestBipper: document.getElementById("btnTestBipper"),
            btnTestVoice: document.getElementById("btnTestVoice"),
            formSettingsPanel: document.getElementById("formSettingsPanel"),
            ulInfoShortcuts: document.getElementById("ulInfoShortcuts"),
            shortcutModal: document.getElementById("shortcutModal"),
            shortcutModalMessage: document.getElementById("shortcutModalMessage"),
            shortcutModalCancel: document.getElementById("shortcutModalCancel"),
        };

        this._listeners = [];
    }

    /* ===================================== */
    /* Tickets                               */
    /* ===================================== */

    updateTickets(normal, preferential) {
        if (this.el.ticketNormal) {
            this.el.ticketNormal.textContent = String(normal).padStart(3, "0");
        }

        if (this.el.ticketPreferential) {
            this.el.ticketPreferential.textContent = `P${String(preferential).padStart(3, "0")}`;
        }

        if (this.el.inNormalTicket) {
            this.el.inNormalTicket.value = normal;
        }

        if (this.el.inPreferTicket) {
            this.el.inPreferTicket.value = preferential;
        }
    }

    flash(type) {
        const target = type === "P" ? this.el.ticketPreferential : this.el.ticketNormal;

        if (!target) return;

        target.classList.add("blink");

        setTimeout(() => {
            target.classList.remove("blink");
        }, 2000);
    }

    /* ===================================== */
    /* Voices                                */
    /* ===================================== */

    populateVoices(voices, selectedURI) {
        if (!this.el.inVoiceList) return;

        const select = this.el.inVoiceList;

        select.replaceChildren();

        const muteOption = document.createElement("option");
        muteOption.value = "mute";
        muteOption.textContent = "Mudo";
        select.appendChild(muteOption);

        voices.forEach((voice) => {
            const option = document.createElement("option");

            option.value = voice.voiceURI;
            option.textContent = voice.name;

            select.appendChild(option);
        });

        select.value = selectedURI ?? "mute";
    }

    getSelectedVoiceURI() {
        return this.el.inVoiceList?.value ?? null;
    }

    setVoiceRate(value) {
        if (this.el.inVoiceRate) {
            this.el.inVoiceRate.value = value;
        }

        if (this.el.inVoiceRateValue) {
            this.el.inVoiceRateValue.textContent = `(${value})`;
        }
    }

    setVoicePitch(value) {
        if (this.el.inVoicePitch) {
            this.el.inVoicePitch.value = value;
        }

        if (this.el.inVoicePitchValue) {
            this.el.inVoicePitchValue.textContent = `(${value})`;
        }
    }

    onVoiceRangeInput() {
        const ranges = [
            [this.el.inVoiceRate, this.el.inVoiceRateValue],
            [this.el.inVoicePitch, this.el.inVoicePitchValue],
        ];

        ranges.forEach(([input, valueLabel]) => {
            if (!input || !valueLabel) return;

            const handler = () => {
                valueLabel.textContent = `(${input.value})`;
            };

            input.addEventListener("input", handler);
            handler();
            this._listeners.push(() => input.removeEventListener("input", handler));
        });
    }

    renderBeeperSettings({ duration, sequence } = {}, toneOptionCount = 0) {
        if (this.el.inToneDuration) {
            this.el.inToneDuration.value = duration;
        }

        if (this.el.inToneCount) {
            this.el.inToneCount.value = sequence.length;
        }

        if (!this.el.toneSequenceControls) return;

        const controls = sequence.map((toneIndex, index) => {
            const wrapper = document.createElement("label");
            const input = document.createElement("input");
            const valueLabel = document.createElement("span");

            wrapper.className = "toneControl";
            wrapper.textContent = `Tom ${index + 1}: `;

            valueLabel.className = "toneControlValue";
            valueLabel.textContent = `(${String(toneIndex + 1)})`;

            input.type = "range";
            input.id = `inToneSequence-${index}`;
            input.dataset.toneIndex = String(index);
            input.min = "1";
            input.max = String(toneOptionCount);
            input.step = "1";
            input.value = String(toneIndex + 1);

            input.addEventListener("input", () => {
                valueLabel.textContent = `(${String(Number(input.value))})`;
            });

            wrapper.append(valueLabel, input);
            return wrapper;
        });

        this.el.toneSequenceControls.replaceChildren(...controls);
    }

    /* ===================================== */
    /* Keys
    /* ===================================== */

    renderShortcuts(shortcuts) {
        if (!this.el.ulInfoShortcuts) return;

        const items = shortcuts.map((shortcut) => {
            const item = document.createElement("li");
            const button = document.createElement("button");
            const label = document.createElement("span");

            item.dataset.action = shortcut.action ?? "";

            button.type = "button";
            button.className = "btnShortcutAction";
            button.dataset.action = shortcut.action ?? "";
            button.textContent = shortcut.display;

            label.textContent = shortcut.label;

            item.append(button, label);

            return item;
        });

        this.el.ulInfoShortcuts.replaceChildren(...items);
    }

    /* ===================================== */
    /* Events                                */
    /* ===================================== */

    #registerListener(element, event, handler) {
        if (!element) return null;

        element.addEventListener(event, handler);

        return () => element.removeEventListener(event, handler);
    }

    onVoiceChange(callback) {
        const unsubscribe = this.#registerListener(this.el.inVoiceList, "change", () =>
            callback(this.getSelectedVoiceURI()),
        );

        if (unsubscribe) {
            this._listeners.push(unsubscribe);
        }
    }

    onShortcutActionClick(callback) {
        const handler = (event) => {
            const button = event.target.closest("button.btnShortcutAction");
            if (!button) return;
            callback(button.dataset.action);
        };

        document.addEventListener("click", handler);
        this._listeners.push(() => document.removeEventListener("click", handler));
    }

    onShortcutModalCancel(callback) {
        const unsubscribe = this.#registerListener(this.el.shortcutModalCancel, "click", callback);

        if (unsubscribe) {
            this._listeners.push(unsubscribe);
        }
    }

    onSettingsChange(callback) {
        const unsubscribe = this.#registerListener(this.el.formSettingsPanel, "change", (event) =>
            callback(event.target),
        );

        if (unsubscribe) {
            this._listeners.push(unsubscribe);
        }
    }

    onTestBipper(callback) {
        const unsubscribe = this.#registerListener(this.el.btnTestBipper, "click", callback);

        if (unsubscribe) {
            this._listeners.push(unsubscribe);
        }
    }

    onTestVoice(callback) {
        const unsubscribe = this.#registerListener(this.el.btnTestVoice, "click", callback);

        if (unsubscribe) {
            this._listeners.push(unsubscribe);
        }
    }

    showShortcutModal(message) {
        if (!this.el.shortcutModal || !this.el.shortcutModalMessage) return;

        this.el.shortcutModalMessage.textContent = message;
        this.el.shortcutModal.classList.remove("hidden");
    }

    hideShortcutModal() {
        this.el.shortcutModal?.classList.add("hidden");
    }

    isShortcutModalOpen() {
        return Boolean(this.el.shortcutModal && !this.el.shortcutModal.classList.contains("hidden"));
    }

    onReset(callback) {
        const handler = (event) => {
            event.preventDefault();
            callback();
        };

        const unsubscribe = this.#registerListener(this.el.formSettingsPanel, "reset", handler);

        if (unsubscribe) {
            this._listeners.push(unsubscribe);
        }
    }

    onKeyPress(callback) {
        const handler = (event) => callback(event);

        document.addEventListener("keydown", handler);

        return () => document.removeEventListener("keydown", handler);
    }

    onFloatingIconClick() {
        document.querySelectorAll(".floatingIcon [data-panel-toggle]").forEach((icon) => {
            const handler = (e) => {
                const panel = e.currentTarget.closest(".floatingIcon");

                e.currentTarget.classList.toggle("fa-circle-xmark");

                panel?.classList.toggle("active");

                panel?.lastElementChild?.classList.toggle("hidden");
            };

            icon.addEventListener("click", handler);

            this._listeners.push(() => icon.removeEventListener("click", handler));
        });
    }

    destroy() {
        this._listeners.forEach((unsubscribe) => unsubscribe());
        this._listeners = [];
    }
}
