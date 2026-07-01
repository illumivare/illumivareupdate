# Illumivare — Static HTML5/CSS3 Web Template

This folder contains a fully compiled, self-contained, serverless HTML5 + CSS3 edition of the Illumivare website, perfectly ready for hosting on **GitHub Pages**, **Vercel**, **Netlify**, or any basic static file server.

## Features Included
- **Zero Build Dependencies**: Written entirely in clean, native HTML5, modern CSS3 (via Tailwind CSS CDN), and vanilla ES6 JavaScript. No Node.js or npm required.
- **Perfect Parity**: Includes all dynamic UI animations, full-bleed backgrounds, interactive navigation toggles, responsive menus, and active-section scrolling.
- **Mock Video Player Lightbox**: An interactive simulated video viewport complete with customizable titles, seek timelines, and a reactive **CSS Audio Visualizer Spectrum overlay**.
- **Web3Forms AJAX Contact Form**: Ready-to-go contact form with built-in Honeypot anti-spam protection, dropdowns, and automated success indicators.

---

## 🚀 Quick Start Guide: Deploying to GitHub Pages

### Step 1: Create a GitHub Repository
1. Log into your GitHub account and click **New Repository**.
2. Name your repository (e.g., `illumivare` or `<your-username>.github.io`).
3. Set the repository to **Public** and click **Create repository**.

### Step 2: Upload Your Files
1. Copy the contents of the `index.html` file in this directory.
2. Inside your new GitHub repository, click **"creating a new file"**.
3. Name the file `index.html` and paste the contents.
4. Click **Commit changes** to save.

### Step 3: Turn on GitHub Pages
1. In your GitHub repository, navigate to **Settings** (the gear icon on the top tab).
2. Scroll down on the left-hand navigation sidebar and click **Pages**.
3. Under **Build and deployment** -> **Branch**, change the selection from *None* to **`main`** (or `master`), keeping `/ (root)` selected.
4. Click **Save**.
5. Within 1-2 minutes, GitHub will build your site and display a banner at the top of the Pages menu with your live link (e.g., `https://<your-username>.github.io/<repository-name>/`).

---

## ✉️ Connecting the Lead Contact Form to Your Email

This template uses **Web3Forms**, a free service that lets you receive form submissions directly into your inbox via simple AJAX requests without writing a backend.

1. Go to [web3forms.com](https://web3forms.com) and enter your business email. They will instantly email you a free **Access Key**.
2. Open `index.html` and search for the variable declaration on line **585**:
   ```javascript
   const WEB3FORMS_DUMMY_KEY = "YOUR_WEB3FORMS_ACCESS_KEY_HERE";
   ```
3. Replace `"YOUR_WEB3FORMS_ACCESS_KEY_HERE"` with your actual Web3Forms access key:
   ```javascript
   const WEB3FORMS_DUMMY_KEY = "12345678-abcd-1234-abcd-123456789abc";
   ```
4. Commit your changes. The form is now fully live and will email you all client leads instantly!

---

## 🎨 Modifying Your Portfolio Media & Links

To swap out the placeholder portfolio images or customize the YouTube popup video links, open `index.html` and edit the central data structure around line **420**:

```javascript
const videoData = {
    laundry: {
        title: 'Your Custom Video Title Here',
        category: 'Your Category Name',
        duration: 'Duration / Spec',
        image: 'https://images.unsplash.com/your-image-url',
        youtube: 'https://www.youtube.com/watch?v=your-video-id'
    },
    ...
}
```

You can use any hosted image links (Unsplash, Imgur, or files inside a local `assets/` subfolder in your repository) for the thumbnails!
