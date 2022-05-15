# Screenshot Generator

## environment setup

```bash
yarn install
```

**Note: For M1 mac**

1. First setup like [this](https://linguinecode.com/post/how-to-fix-m1-mac-puppeteer-chromium-arm64-bug)
2. Then, you need to find and replace all `/usr/bin/chromium-browser` with `/opt/homebrew/bin/chromium` using VS-code after `yarn install`.

## Run the script

enter your urls as an array in the `src/app.js` file. the run the script

```bash
yarn dev
```
