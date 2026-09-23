import Ticket from "./ticket.js";
import Beeper from "./beeper.js";
import Speech from "./speech.js";
import Storage from "./storage.js";
import ShortcutManager from "./shortcut.js";
import UI from "./ui.js";

/* ========================================= */
/* Instâncias                                */
/* ========================================= */

const storage = Storage.load();

const normalTicket = new Ticket("N", storage.normalTicket);
const preferentialTicket = new Ticket("P", storage.preferentialTicket);

const shortcutManager = new ShortcutManager(storage.shortcuts, (updatedShortcuts) => {
    Storage.set("shortcuts", updatedShortcuts);
});

const beeper = new Beeper({
    toneSequence: storage.toneSequence,
    toneDuration: storage.toneDuration,
});

const speech = new Speech({
    voiceRate: storage.voiceRate,
    voicePitch: storage.voicePitch,
    voiceVolume: storage.voiceVolume,
    selectedVoiceURI: storage.selectedVoiceURI,
});

const ui = new UI();

/* ========================================= */
/* Sincronização UI                          */
/* ========================================= */

function syncTickets() {
    ui.updateTickets(normalTicket.value, preferentialTicket.value);
}

function syncVoices() {
    ui.populateVoices(speech.getVoiceList(), speech.getSelectedVoiceURI());
}

function getNumberValue(value, fallback) {
    const number = Number.parseFloat(value);

    return Number.isFinite(number) ? number : fallback;
}

function getIntegerValue(value, fallback) {
    const number = Number.parseInt(value, 10);

    return Number.isFinite(number) ? number : fallback;
}

function isEditableTarget(target) {
    return Boolean(target?.closest?.("input, select, textarea, button, [contenteditable='true']"));
}

function getShortcutDisplay(event) {
    if (event.code === "Space") {
        return "Space";
    }

    return event.key.length === 1 ? event.key.toUpperCase() : event.key;
}

/* ========================================= */
/* Chamada de senha                          */
/* ========================================= */

async function callTicket(type) {
    const ticket = type === "P" ? preferentialTicket : normalTicket;

    ui.flash(type);
    syncTickets();

    await beeper.play();

    if (speech.canSpeak()) {
        await speech.speakTicket(type, ticket.value);
    }
}

/* ========================================= */
/* Ações                                     */
/* ========================================= */

const actions = {
    nextNormal: () => {
        normalTicket.next();
        Storage.set("normalTicket", normalTicket.value);
        callTicket("N");
    },

    nextPreferential: () => {
        preferentialTicket.next();
        Storage.set("preferentialTicket", preferentialTicket.value);
        callTicket("P");
    },

    previousNormal: () => {
        normalTicket.previous();
        Storage.set("normalTicket", normalTicket.value);
        callTicket("N");
    },

    previousPreferential: () => {
        preferentialTicket.previous();
        Storage.set("preferentialTicket", preferentialTicket.value);
        callTicket("P");
    },

    callNormal: () => callTicket("N"),
    callPreferential: () => callTicket("P"),
};

/* ========================================= */
/* Speech                                    */
/* ========================================= */

speech.onVoicesChanged = () => {
    syncVoices();
};

/* ========================================= */
/* Eventos da UI                             */
/* ========================================= */

ui.onVoiceChange((voiceURI) => {
    speech.setSelectedVoiceURI(voiceURI);
    Storage.set("selectedVoiceURI", speech.getSelectedVoiceURI());
});

function renderBeeperSettings() {
    ui.renderBeeperSettings({
        duration: beeper.duration,
        sequence: beeper.sequence,
    }, Beeper.TONES.length);
}

ui.onSettingsChange((target) => {
    switch (target.id) {
        case "inNormalTicket":
            normalTicket.set(target.value);
            Storage.set("normalTicket", normalTicket.value);
            syncTickets();
            break;

        case "inPreferTicket":
            preferentialTicket.set(target.value);
            Storage.set("preferentialTicket", preferentialTicket.value);
            syncTickets();
            break;

        case "inVoiceRate":
            speech.setConfigs({
                voiceRate: getNumberValue(target.value, speech.voiceRate),
            });
            Storage.set("voiceRate", speech.voiceRate);
            break;

        case "inVoicePitch":
            speech.setConfigs({
                voicePitch: getNumberValue(target.value, speech.voicePitch),
            });
            Storage.set("voicePitch", speech.voicePitch);
            break;

        case "inToneDuration": {
            const duration = getIntegerValue(target.value, beeper.duration);
            beeper.setDuration(duration);
            Storage.set("toneDuration", beeper.duration);
            break;
        }

        case "inToneCount": {
            const count = Math.min(Math.max(getIntegerValue(target.value, beeper.sequence.length), 1), 4);
            const sequence = Array.isArray(beeper.sequence) ? [...beeper.sequence] : [];
            const updatedSequence = sequence.slice(0, count);

            while (updatedSequence.length < count) {
                updatedSequence.push(sequence[updatedSequence.length] ?? 0);
            }

            beeper.setSequence(updatedSequence);
            Storage.set("toneSequence", beeper.sequence);
            renderBeeperSettings();
            break;
        }

        default: {
            if (target.dataset?.toneIndex !== undefined) {
                const toneIndex = getIntegerValue(target.dataset.toneIndex, null);
                const selectedValue = getIntegerValue(target.value, null);

                if (toneIndex !== null && Number.isFinite(selectedValue) && beeper.sequence?.[toneIndex] !== undefined) {
                    const updatedSequence = [...beeper.sequence];
                    updatedSequence[toneIndex] = Math.min(Math.max(selectedValue - 1, 0), Beeper.TONES.length - 1);
                    beeper.setSequence(updatedSequence);
                    Storage.set("toneSequence", beeper.sequence);
                    renderBeeperSettings();
                }
            }
        }
    }
});

ui.onTestBipper(() => {
    beeper.play();
});

ui.onTestVoice(async () => {
    if (!speech.canSpeak()) {
        return;
    }

    await speech.speakTicket("N", normalTicket.value);
    await speech.speakTicket("P", preferentialTicket.value);
});

let activeShortcutAction = null;
let shortcutCaptureHandler = null;

ui.onShortcutActionClick((action) => {
    if (!action) return;

    if (shortcutCaptureHandler) {
        document.removeEventListener("keydown", shortcutCaptureHandler, true);
        shortcutCaptureHandler = null;
    }

    activeShortcutAction = action;
    ui.showShortcutModal("Pressione a tecla que deseja atribuir para esta ação.");

    shortcutCaptureHandler = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!activeShortcutAction) return;

        if (event.code === "Escape") {
            ui.hideShortcutModal();
            activeShortcutAction = null;
            document.removeEventListener("keydown", shortcutCaptureHandler, true);
            shortcutCaptureHandler = null;
            return;
        }

        shortcutManager.updateShortcut(activeShortcutAction, {
            key: event.code,
            display: getShortcutDisplay(event),
        });

        ui.hideShortcutModal();
        shortcutManager.render(ui);
        activeShortcutAction = null;

        document.removeEventListener("keydown", shortcutCaptureHandler, true);
        shortcutCaptureHandler = null;
    };

    document.addEventListener("keydown", shortcutCaptureHandler, true);
});

ui.onShortcutModalCancel(() => {
    ui.hideShortcutModal();

    if (shortcutCaptureHandler) {
        document.removeEventListener("keydown", shortcutCaptureHandler, true);
        shortcutCaptureHandler = null;
    }

    activeShortcutAction = null;
});

ui.onReset(() => {
    Storage.reset();
    location.reload();
});

document.addEventListener("keydown", (event) => {
    if (activeShortcutAction || ui.isShortcutModalOpen() || isEditableTarget(event.target)) {
        return;
    }

    const action = shortcutManager.findActionByKey(event.code);
    if (action && actions[action]) {
        event.preventDefault();
        actions[action]();
    }
});

/* ========================================= */
/* Inicialização                             */
/* ========================================= */

ui.onFloatingIconClick();
ui.onVoiceRangeInput();
ui.setVoiceRate(storage.voiceRate);
ui.setVoicePitch(storage.voicePitch);
syncTickets();
syncVoices();
shortcutManager.render(ui);
renderBeeperSettings();

/* ========================================= */
/* Cleanup                                   */
/* ========================================= */

window.addEventListener("beforeunload", () => {
    speech.destroy();
    beeper.destroy();
    ui.destroy();
});
