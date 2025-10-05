# Keyboard Cat Defense

The most advance defense system against keyboard perimeter invasion.

When you see your cat getting close, you only have seconds before imminent disaster.

This gnome extension offers a visual method to disable/enable your keyboard so you can continue using your laptop/PC even in this state:

<img src="https://github.com/onel/leyboard-cat-defense/assets/1862405/796e5580-e2c4-435c-81a9-ee30ca0a7625" width="500px" />


## About

Most methods to disable a keyboard, involve using the terminal (or the keyboard itself) to disable it.

This extension offers a visual method to enable/disable the keyboard so you can continue using your system.

![image](https://github.com/onel/leyboard-cat-defense/assets/1862405/e1459bb2-754a-4c65-93af-bf1f61862dec)


## Instalation

#### GNOME extension store (recommended)

You can get the extension from [here](https://extensions.gnome.org/extension/6819/keyboard-cat-defense/).

### Manually

To install manually:

1. clone the repo:

```
git clone https://github.com/onel/keyboard-cat-defense
```

2. build the extension archive from the latest sources:

```sh
cd keyboard-cat-defense
./build.sh keyboard-cat-defense@onel.github.io.zip
```

3. unzip the content into your local `gnome-shell/extensions` folder:

```sh
unzip -o keyboard-cat-defense@onel.github.io.zip -d ~/.local/share/gnome-shell/extensions/keyboard-cat-defense@onel.github.io
```

4. enable the extension

```sh
gnome-extensions enable keyboard-cat-defense@onel.github.io
```

5. restart GNOME Shell or reboot your system

## Troubleshooting

- **ImportError: Unable to load file from: `resource:///org/gnome/gjs/modules/byteArray.js`** – This indicates that GNOME Shell is still loading an older release of the extension that depended on the deprecated `ByteArray` module. Remove any previous copy from `~/.local/share/gnome-shell/extensions/keyboard-cat-defense@onel.github.io`, reinstall the freshly built zip from this repository, and ensure the updated `metadata.json` version is active in *Extensions*.

## License

[MIT](./LICENSE)
