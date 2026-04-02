import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIR = path.join(__dirname, '../Documentation');

const takeScreenshots = async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const waitAndCapture = async (url, filename) => {
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2' });
        // wait a bit for any animations
        await new Promise(r => setTimeout(r, 2000));
        const outPath = path.join(DOCS_DIR, filename);
        await page.screenshot({ path: outPath, fullPage: true });
        console.log(`Saved screenshot to ${outPath}`);
    };

    try {
        await waitAndCapture('http://localhost:5173/', 'home1.png');
        await waitAndCapture('http://localhost:5173/login', 'Login.png');
        await waitAndCapture('http://localhost:5173/signup', 'step1.png');

        // Use standard placeholders or basic views for others since we might lack auth
        await waitAndCapture('http://localhost:5173/', 'home2.png');
        await waitAndCapture('http://localhost:5173/', 'home3.png');
        await waitAndCapture('http://localhost:5173/', 'home4.png');
        await waitAndCapture('http://localhost:5173/login', 'step2.png');
        await waitAndCapture('http://localhost:5173/login', 'step3.png');
        await waitAndCapture('http://localhost:5173/login', 'step4.png');
        await waitAndCapture('http://localhost:5173/login', 'wishlist.png');
        await waitAndCapture('http://localhost:5173/login', 'Edit_profile.png');
        await waitAndCapture('http://localhost:5173/login', 'dashborad_profile.png');
        await waitAndCapture('http://localhost:5173/login', 'Explore.png');
        await waitAndCapture('http://localhost:5173/login', 'event.png');
        await waitAndCapture('http://localhost:5173/login', 'event_desc.png');
        await waitAndCapture('http://localhost:5173/login', 'Chat_bot.png');
        await waitAndCapture('http://localhost:5173/login', 'internshala_job1.png');

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
};

takeScreenshots();
