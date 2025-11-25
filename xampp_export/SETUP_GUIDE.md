### Step 3: Configure and Build React App

Now you need to turn the source code (the files outside `xampp_export`) into the frontend that runs on the server.

1.  **Important**: Copy the `xampp_export/package.json` file to the root of your project (replace the existing one). This ensures you have the correct dependencies for animations and charts.
    \`\`\`bash
    cp xampp_export/package.json .
    \`\`\`

2.  **Prepare the Build Config**:
    *   **Next Config**: In your **Project Root**, copy the file `xampp_export/next.config.export.mjs` and rename it to `next.config.mjs` (replace the existing one if asked).
    \`\`\`bash
    cp xampp_export/next.config.export.mjs next.config.mjs
    \`\`\`
    *   *Why?* This config tells Next.js to build for a subfolder (`/mysystem`) with `output: 'export'` and `basePath: '/mysystem'` so it works on XAMPP.

3.  **Install & Build**:
    *   Open a terminal/command prompt in the **Project Root**.
    *   Run: `npm install` (or `yarn install`)
    *   Run: `npm run build` (or `yarn build`)
    *   **Important**: The build will create an `out` folder in your project root.

4.  **Deploy the Build**:
    *   After the build finishes, you will see a new folder named `out` in your Project Root.
    *   **Rename** this folder from `out` to `dist`.
    *   **Move** this `dist` folder into your XAMPP folder: `C:\xampp\htdocs\mysystem\`.
    *   **Verify**: Check that `C:\xampp\htdocs\mysystem\dist\index.html` exists.


### Step 4: Final File Structure

Your XAMPP folder (`C:\xampp\htdocs\mysystem\`) should now look like this:

\`\`\`
mysystem/
├── .htaccess             (Apache routing config - MUST be in root)
├── api/                  (PHP API files)
│   ├── auth/
│   │   ├── login.php
│   │   ├── logout.php
│   │   ├── register.php
│   │   ├── user.php
│   │   ├── script.js
│   │   └── style.css
│   ├── adapters/
│   │   ├── add.php
│   │   ├── delete.php
│   │   └── list.php
│   ├── admin/
│   │   └── generate_keys.php
│   └── db.php
├── dist/                 (Your compiled React App)
│   ├── _next/
│   │   ├── static/
│   │   │   ├── css/
│   │   │   └── chunks/
│   ├── index.html
│   └── ...
└── index.php             (Main entry point)
\`\`\`

**Note**: The `config` folder is NOT needed on the server since `.htaccess` is already in the root.


## 6. Troubleshooting

**Dashboard Shows Unstyled HTML (Plain Text with No CSS)**

**Symptoms**: After login, the dashboard loads but looks like plain text with no styling (white background, Times New Roman font, no colors).

**Root Cause**: The CSS and JavaScript files from Next.js build are not being served correctly.

**Solution Steps**:
1.  **Verify Build Configuration**:
    *   Check that you copied `xampp_export/next.config.export.mjs` to `next.config.mjs` in project root.
    *   Open `next.config.mjs` and verify it contains:
        \`\`\`js
        output: 'export',
        basePath: '/mysystem',
