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
    const overworldWorldSize = process.env.MC_OVERWORLD_WORLD_SIZE || '8k';
    
    // Debug: Log all environment variables
    console.log('Environment variables:');
    console.log('MC_SEED:', process.env.MC_SEED);
    console.log('MC_DIMENSION:', process.env.MC_DIMENSION);
    console.log('MC_OVERWORLD_WORLD_SIZE:', process.env.MC_OVERWORLD_WORLD_SIZE);
    
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
    // Include world size in filename for overworld
    const worldSizeSuffix = dimension === 'overworld' ? `-${overworldWorldSize}` : '';
    const filename = `mcseedmap-${dimension}${worldSizeSuffix}-screenshot-${timestamp}.png`;
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
    
    // Set crop parameters and final size based on the dimension type and world size
    let cropParams, finalSize;
    if (dimension === 'nether') {
      // Nether crop parameters (always the same)
      cropParams = {
        left: 720,    // 720px from the left
        top: 120,     // 120px from the top
        width: 2000,  // 2000px width
        height: 2000  // 2000px height
      };
      finalSize = 1000;
    } else {
      // Overworld crop parameters based on world size setting
      if (overworldWorldSize.toLowerCase() === '16k') {
        // 16K world size: larger crop, higher resolution
        cropParams = {
          left: 720,    // 720px from the left
          top: 120,     // 120px from the top
          width: 2000,  // 2000px width
          height: 2000  // 2000px height
        };
        finalSize = 2000;
      } else {
        // 8K world size: smaller crop, standard resolution (default)
        cropParams = {
          left: 1220,   // 1220px from the left
          top: 620,     // 620px from the top
          width: 1000,  // 1000px width
          height: 1000  // 1000px height
        };
        finalSize = 1000;
      }
    }
    
    console.log(`Cropping ${dimension}${dimension === 'overworld' ? ` (${overworldWorldSize} world size)` : ''} with params:`, cropParams);
    console.log(`Resizing to ${finalSize}x${finalSize} for ${dimension} dimension`);
    
    await sharp(filepath)
      .extract(cropParams)
      .resize(finalSize, finalSize)
      .png()
      .toFile(croppedFilepath);
    
    console.log(`Cropped screenshot saved as: ${croppedFilename}`);
    console.log(`Cropped file path: ${croppedFilepath}`);
    
    // Output the generated filename for the API to capture
    console.log(`GENERATED_FILE:${croppedFilename}`);
    
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
