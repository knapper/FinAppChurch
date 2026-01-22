<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1tuV1LdZ9uByrZJtXh2pK3VTZFuAc5SW1

## Run Locally

**Prerequisites:**  Node.js


## To run on AWS Cloud9 or local server with Nodejs.

To run SacredFinance on AWS Cloud9, you need to configure a development server (Vite) that is specifically set up to handle the Cloud9 environment's network requirements (port 8080 and host 0.0.0.0).
Since the files you provided use Import Maps (loading libraries directly from the web) but are written in TSX, you still need a compiler to turn that TSX into JavaScript for the browser.

### Phase 1: Environment Setup in Cloud9 Terminal
Open your Cloud9 Environment.
Verify Node.js: Cloud9 usually comes with Node.js. Check the version:
code
Bash
node -v
If it's below version 18, run nvm install 20 && nvm use 20.

### Phase 2: Create Configuration Files

Cloud9 needs to know how to serve the app. Run these commands in your terminal to create the necessary setup files.
1. Create package.json:
Copy and paste this into your terminal:
```
cat <<EOF > package.json
{
  "name": "sacred-finance",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
EOF
```
2. Create vite.config.ts (The Cloud9 Secret Sauce):
Cloud9 requires the server to listen on port 8080 and host 0.0.0.0.
```
cat <<EOF > vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: true
  }
});
EOF
```
### Phase 3: Install and Run

Install the build tools:
```
npm install
```
Start the application:
```
npm run dev
```
### Phase 4: Previewing the App

In the top menu of Cloud9, click Preview -> Preview Running Application.
A small tab will open inside Cloud9 showing the app.
Click the Pop-out icon (arrow pointing top-right) next to the URL bar in that tab to open the app in a full browser window.
