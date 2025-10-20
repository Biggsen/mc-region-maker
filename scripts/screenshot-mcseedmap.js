import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function takeScreenshot() {
  let browser;
  
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport to ensure consistent screenshot size (very large for maximum quality)
    await page.setViewport({ width: 3840, height: 2160 });
    
    console.log('Navigating to mcseedmap.net...');
    // Use seed and dimension from environment variables or defaults
    const seed = process.env.MC_SEED || '-8570592621265448642';
    const dimension = process.env.MC_DIMENSION || 'overworld';
    
    // Debug: Log all environment variables
    console.log('Environment variables:');
    console.log('MC_SEED:', process.env.MC_SEED);
    console.log('MC_DIMENSION:', process.env.MC_DIMENSION);
    
    // Build URL with dimension in the path
    // For nether, don't include zoom parameter; for other dimensions, use zoom level -3
    const url = dimension === 'nether' 
      ? `https://mcseedmap.net/1.21.5-Java/${seed}/${dimension}`
      : `https://mcseedmap.net/1.21.5-Java/${seed}/${dimension}#l=-3`;
    
    console.log(`Using seed: ${seed}, dimension: ${dimension}`);
    console.log(`URL: ${url}`);
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Handle cookie banner
    try {
      console.log('Checking for cookie banner...');
      
      // Click "Manage options" button
      await page.click('button.fc-cta-manage-options');
      console.log('Clicked "Manage options"');
      
      // Wait for the options to appear
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Click "Confirm choices" button
      await page.click('button.fc-confirm-choices');
      console.log('Clicked "Confirm choices"');
      
      // Wait a bit for the banner to disappear
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log('Cookie banner not found or already handled:', error.message);
    }
    
    // Click the toggle sidebar button
    try {
      console.log('Looking for toggle sidebar button...');
      await page.click('button[title="Toggle sidebar"]');
      console.log('Clicked toggle sidebar button');
      
      // Wait a bit for the sidebar to toggle
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log('Toggle sidebar button not found:', error.message);
    }
    
    // Click on the Markers tab
    try {
      console.log('Looking for Markers tab...');
      await page.click('button[title="Markers"]');
      console.log('Clicked Markers tab');
      
      // Wait for the markers panel to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log('Markers tab not found:', error.message);
    }
    
    // Click on the Village button
    try {
      console.log('Looking for Village button...');
      // Use evaluate to find and click the button containing "Village" text
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const villageButton = buttons.find(btn => btn.textContent.includes('Village'));
        if (villageButton) {
          villageButton.click();
          return true;
        }
        return false;
      });
      console.log('Clicked Village button');
      
      // Wait a bit for the village markers to appear
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log('Village button not found:', error.message);
    }
    
    // Wait a bit more for the map to fully load
    console.log('Waiting for map to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take screenshot
    console.log('Taking screenshot...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `mcseedmap-${dimension}-screenshot-${timestamp}.png`;
    // Save to screenshots folder (go up one directory from scripts folder)
    const screenshotsDir = join(__dirname, '..', 'screenshots');
    const filepath = join(screenshotsDir, filename);
    
    await page.screenshot({
      path: filepath,
      fullPage: true,
      type: 'png'
    });
    
    console.log(`Screenshot saved as: ${filename}`);
    console.log(`Full path: ${filepath}`);
    
    // Crop the screenshot
    console.log('Cropping screenshot...');
    const croppedFilename = filename.replace('.png', '-cropped.png');
    const croppedFilepath = join(screenshotsDir, croppedFilename);
    
    // Set dimensions based on the dimension type
    let finalSize;
    if (dimension === 'nether') {
      // Nether has 1:8 scale, so we need larger final size
      finalSize = 1024;
    } else {
      // Overworld and End use standard size
      finalSize = 1024;
    }
    
    console.log(`Resizing to ${finalSize}x${finalSize} for ${dimension} dimension`);
    
    await sharp(filepath)
      .extract({
        left: 720,    // 720px from the left
        top: 120,     // 120px from the top
        width: 2000,  // 2000px width (3840 - 720 - 1120 = 2000)
        height: 2000  // 2000px height (2220 - 120 - 100 = 2000)
      })
      .resize(finalSize, finalSize)
      .png()
      .toFile(croppedFilepath);
    
    console.log(`Cropped screenshot saved as: ${croppedFilename}`);
    console.log(`Cropped file path: ${croppedFilepath}`);
    
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed.');
    }
  }
}

// Run the function
takeScreenshot().catch(console.error);
