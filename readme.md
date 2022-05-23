# Screenshot Generator

## environment setup

```bash
yarn install
```

**Note: For M1 Mac Only**

1. First install chromium `brew install chromium`
1. Run `code ~/.zshrc`
1. Add those lines into the open file

    ```
    export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
    export PUPPETEER_EXECUTABLE_PATH=`which chromium`
    ```

1. Run `xattr -cr /Applications/Chromium.app`
1. Open this project and run `yarn install`
1. Replace all `/usr/bin/chromium-browser` with `/opt/homebrew/bin/chromium`

## Run the script

enter your urls as an array in the `src/app.js` file. the run the script

```bash
yarn dev
```
