import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const UTF8_DECODER = new TextDecoder('utf-8');

function bytesToString(bytes) {
    if (!bytes)
        return '';

    if (bytes instanceof GLib.Bytes || bytes?.toArray instanceof Function)
        return UTF8_DECODER.decode(bytes.toArray());

    if (bytes instanceof Uint8Array)
        return UTF8_DECODER.decode(bytes);

    if (bytes instanceof ArrayBuffer)
        return UTF8_DECODER.decode(new Uint8Array(bytes));

    if (Array.isArray(bytes))
        return UTF8_DECODER.decode(Uint8Array.from(bytes));

    return bytes?.toString?.() ?? '';
}

const KEYBOARD_LIST_HEADING = 'List of connected keyboards:';
const WAYLAND_UNSUPPORTED_MESSAGE = 'Keyboard control is not available while running under Wayland.';
const XINPUT_MISSING_MESSAGE = 'The xinput command could not be found. Keyboard control is unavailable.';

const KeyboardListMenu = GObject.registerClass(
class KeyboardListMenu extends PanelMenu.Button {
    constructor(extension) {
        super(0.0, 'Keyboard cat defense');

        this._extension = extension;
        this._sessionType = (GLib.getenv('XDG_SESSION_TYPE') ?? '').toLowerCase();
        this._xinputAvailable = GLib.find_program_in_path('xinput') !== null;
        this._supportsX11Session = this._sessionType === 'x11' || this._sessionType === '';
        this._deviceControlAvailable = this._supportsX11Session && this._xinputAvailable;

        const icon = new St.Icon({
            gicon: Gio.icon_new_for_string(`${this._extension.path}/cat.svg`),
            style_class: 'cat-icon',
        });
        this.add_child(icon);

        this.menu.addMenuItem(new PopupMenu.PopupMenuItem(KEYBOARD_LIST_HEADING));

        this.menu.connect('open-state-changed', (_menu, open) => {
            if (open && !this._initialized) {
                this._updateKeyboardList();
                this._initialized = true;
            }
        });
    }

    /**
     * Used to create the dropdown menu for the extension.
     */
    _updateKeyboardList() {
        this.menu.removeAll();

        this.menu.addMenuItem(new PopupMenu.PopupMenuItem(KEYBOARD_LIST_HEADING));

        if (!this._deviceControlAvailable) {
            const message = this._supportsX11Session ? XINPUT_MISSING_MESSAGE : WAYLAND_UNSUPPORTED_MESSAGE;
            const item = new PopupMenu.PopupMenuItem(message);
            item.setSensitive(false);
            this.menu.addMenuItem(item);
            return;
        }

        const keyboards = this._getConnectedKeyboards();

        if (keyboards.length === 0) {
            const item = new PopupMenu.PopupMenuItem('No keyboards connected');
            item.setSensitive(false);
            this.menu.addMenuItem(item);
            return;
        }

        keyboards.forEach(keyboard => {
            const toggleItem = new PopupMenu.PopupSwitchMenuItem(keyboard.name, true);
            this.menu.addMenuItem(toggleItem);

            toggleItem.connect('toggled', (item, state) => {
                if (state) {
                    this._enableKeyboard(keyboard.id);
                } else {
                    this._disableKeyboard(keyboard.id);
                }

                return Clutter.EVENT_STOP;
            });
        });
    }

    /**
     * Used to get the list of connected devices and filter for keyboards.
     * @return {Array} the list of keyboards.
     */
    _getConnectedKeyboards() {
        if (!this._deviceControlAvailable)
            return [];

        const [success, stdout, stderr] = GLib.spawn_command_line_sync('xinput list');
        if (!success) {
            logError(new Error(`Error executing xinput list: ${bytesToString(stderr)}`));
            return [];
        }

        const keyboards = [];
        const lines = bytesToString(stdout).split('\n');
        const keyboardIdRegex = /id=(\d+)/;

        for (const line of lines) {
            if (!line.includes('slave  keyboard'))
                continue;

            const parts = line.split('\t');

            if (!parts[0].toLowerCase().includes('keyboard'))
                continue;

            const keyIdMatch = keyboardIdRegex.exec(line);
            if (!keyIdMatch)
                continue;

            const keyboardName = parts[0].trim().slice(2);
            keyboards.push({
                name: keyboardName,
                id: keyIdMatch[1],
            });
        }

        return keyboards;
    }

    /**
     * Disables a keyboard.
     * @param {Number} keyboardId
     */
    _disableKeyboard(keyboardId) {
        if (!this._deviceControlAvailable)
            return;

        const command = `xinput --disable ${keyboardId}`;
        const [success, _stdout, stderr] = GLib.spawn_command_line_sync(command);

        if (!success)
            logError(new Error(`Error deactivating keyboard: ${bytesToString(stderr)}`));
    }

    /**
     * Enables a keyboard.
     * @param {Number} keyboardId
     */
    _enableKeyboard(keyboardId) {
        if (!this._deviceControlAvailable)
            return;

        const command = `xinput --enable ${keyboardId}`;
        const [success, _stdout, stderr] = GLib.spawn_command_line_sync(command);

        if (!success)
            logError(new Error(`Error enabling keyboard: ${bytesToString(stderr)}`));
    }
}
);

export default class KeyboardCatDefenseExtension extends Extension {
    enable() {
        this._indicator = new KeyboardListMenu(this);
        Main.panel.addToStatusArea('keyboard-list-menu', this._indicator, 0, 'right');
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }
}
