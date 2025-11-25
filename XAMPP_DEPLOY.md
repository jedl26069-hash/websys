# Deploying to XAMPP (Apache/PHP)

The current build configuration is set up for the **Next.js Preview** environment, which includes a Node.js simulation of your PHP backend (located in `app/mysystem`).

## To build for XAMPP (Static HTML + Real PHP):

1.  **Delete the Simulation Folder (CRITICAL)**:
    Remove the `app/mysystem` folder. This folder contains the Node.js API mocks which **will cause build errors** if not removed before building for XAMPP.

2.  **Enable Static Export**:
    Open `next.config.mjs` and ensure the `output: 'export'` line is uncommented (I have enabled it for you now).

3.  **Build**:
    Run `npm run build`.
    This will generate an `out` folder containing your static HTML/CSS/JS.

4.  **Deploy**:
    Copy the contents of the `out` folder to your `C:\xampp\htdocs\mysystem` directory.
    Ensure your real PHP API files are located in `C:\xampp\htdocs\mysystem\api\...`.
    
## Simulation Features
- The PHP files in `xampp_export/htdocs/mysystem/api` now include simulation logic.
- **Auto-create Adapters:** You can add any Adapter ID, and it will be created if missing.
- **Auto-generate Data:** If no voltage history exists, it will generate random data so the graph works immediately.
