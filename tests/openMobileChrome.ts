// import { chromium, BrowserContext, Page } from '@playwright/test';
// import { execSync } from 'child_process';
// import fetch from 'node-fetch';

// /**
//  * Opens a fresh Chrome session on an Android device using Playwright + ADB,
//  * ensures clean state by clearing all storage and starting a new page.
//  *
//  * @param url The URL to open on the Android Chrome instance.
//  * @returns An object containing the browser context and a new page.
//  */
// export async function openMobileWebsiteWithCacheCleared(
//   url: string
// ): Promise<{ context: BrowserContext; page: Page }> {
//   // Helper to execute ADB commands safely
//   const execAdb = (command: string) => {
//     try {
//       execSync(command, { stdio: 'inherit' });
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : String(error);
//       console.error(`❌ ADB command failed: ${command}`, errorMessage);
//       throw error;
//     }
//   };

//   // Helper to check if CDP endpoint is ready
//   const waitForCdpEndpoint = async (maxRetries = 10, delayMs = 3000): Promise<string> => {
//     for (let i = 1; i <= maxRetries; i++) {
//       try {
//         const response = await fetch('http://127.0.0.1:9222/json/version');
//         if (response.ok) {
//           const data = await response.json();
//           console.log(`✅ CDP endpoint ready: ${JSON.stringify(data)}`);
//           return data.webSocketDebuggerUrl; // Return WebSocket URL
//         }
//       } catch (err) {
//         const errorMessage = err instanceof Error ? err.message : String(err);
//         console.warn(`⚠️ CDP endpoint not ready (attempt ${i}/${maxRetries}): ${errorMessage}`);
//       }
//       await new Promise((res) => setTimeout(res, delayMs));
//     }
//     throw new Error('❌ CDP endpoint not available after retries');
//   };

//   // Helper to reset Chrome and port forwarding
//   const resetChrome = async () => {
//     console.log('🔄 Resetting Chrome and port forwarding...');
//     execAdb('adb shell am force-stop com.android.chrome'); // Terminate Chrome
//     execAdb('adb forward --remove tcp:9222'); // Remove existing port forwarding
//     execAdb('adb forward tcp:9222 localabstract:chrome_devtools_remote'); // Re-establish port forwarding
//     console.log(`🚀 Relaunching Chrome with URL: ${url}`);
//     execAdb(`adb shell am start -n com.android.chrome/com.google.android.apps.chrome.Main -d "${url}"`);
//   };

//   // Step 1: Validate ADB and device
//   console.log('🔧 Checking ADB-connected devices...');
//   execAdb('adb devices');

//   // Step 2: Clean up Chrome state
//   console.log('🔧 Cleaning up Chrome state...');
//   execAdb('adb shell am force-stop com.android.chrome'); // Terminate Chrome processes

//   // Step 3: Set up port forwarding
//   console.log('🔧 Forwarding port 9222...');
//   execAdb('adb forward tcp:9222 localabstract:chrome_devtools_remote');

//   // Step 4: Launch Chrome
//   console.log(`🚀 Launching Chrome on Android with URL: ${url}`);
//   execAdb(`adb shell am start -n com.android.chrome/com.google.android.apps.chrome.Main -d "${url}"`);

//   // Step 5: Wait for CDP endpoint
//   let wsEndpoint = await waitForCdpEndpoint();

//   // Step 6: Connect to Chrome via CDP with retries
//   let browser;
//   const maxCdpRetries = 3;
//   for (let i = 1; i <= maxCdpRetries; i++) {
//     try {
//       console.log(`🔗 Connecting to CDP (attempt ${i}/${maxCdpRetries})...`);
//       browser = await chromium.connectOverCDP(wsEndpoint);
//       console.log(`✅ Browser connected: ${browser.isConnected()}`);
//       await new Promise((res) => setTimeout(res, 2000)); // Wait for CDP stabilization
//       break;
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : String(err);
//       console.warn(`⚠️ CDP connection failed (attempt ${i}/${maxCdpRetries}): ${errorMessage}`);
//       if (i === maxCdpRetries) {
//         throw new Error('❌ Failed to connect to CDP after retries');
//       }
//       await resetChrome(); // Reset Chrome and port forwarding
//       wsEndpoint = await waitForCdpEndpoint(); // Re-wait for endpoint
//     }
//   }

//   // Ensure browser is defined
//   if (!browser) {
//     throw new Error('❌ Browser initialization failed');
//   }

//   // Step 7: Use existing context
//   const context = browser.contexts()[0];
//   if (!context) {
//     throw new Error('❌ No existing browser context available');
//   }

//   // Step 8: Create new page
//   const page = await context.newPage();

//   // Step 9: Clear storage, cookies, and cache
//   await context.clearCookies();

//   // Clear browser cache using CDP
//   try {
//     const cdpSession = await context.newCDPSession(page);
//     await cdpSession.send('Network.clearBrowserCache');
//     await cdpSession.detach();
//     console.log('🧹 Browser cache cleared via CDP');
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : String(err);
//     console.warn(`⚠️ Failed to clear browser cache via CDP: ${errorMessage}`);
//   }

//   await page.goto(url, { waitUntil: 'domcontentloaded' });
//   await page.evaluate(() => {
//     localStorage.clear();
//     sessionStorage.clear();
//   });

//   console.log('✅ Fresh context ready with cleared cache, cookies, localStorage, and sessionStorage.');
//   return { context, page };
// }

import { chromium, BrowserContext, Page } from '@playwright/test';
import { execSync } from 'child_process';
import fetch from 'node-fetch';

/**
 * Opens a fresh Chrome session on an Android device using Playwright + ADB,
 * ensures clean state by clearing all storage and starting a new page.
 *
 * @param url The URL to open on the Android Chrome instance.
 * @returns An object containing the browser context and a new page.
 */
export async function openMobileWebsiteWithCacheCleared(
  url: string
): Promise<{ context: BrowserContext; page: Page }> {
  // Helper to execute ADB commands safely
  const execAdb = (command: string) => {
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ ADB command failed: ${command}`, errorMessage);
      throw error;
    }
  };

  // Helper to check if CDP endpoint is ready
  const waitForCdpEndpoint = async (maxRetries = 10, delayMs = 3000): Promise<string> => {
    for (let i = 1; i <= maxRetries; i++) {
      try {
        const response = await fetch('http://127.0.0.1:9222/json/version');
        if (response.ok) {
          const data: unknown = await response.json();
          if (
            typeof data === 'object' &&
            data !== null &&
            'webSocketDebuggerUrl' in data &&
            typeof (data as any).webSocketDebuggerUrl === 'string'
          ) {
            console.log(`✅ CDP endpoint ready: ${JSON.stringify(data)}`);
            return (data as { webSocketDebuggerUrl: string }).webSocketDebuggerUrl;
          } else {
            console.warn(`⚠️ Invalid response structure: ${JSON.stringify(data)}`);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.warn(`⚠️ CDP endpoint not ready (attempt ${i}/${maxRetries}): ${errorMessage}`);
      }
      await new Promise((res) => setTimeout(res, delayMs));
    }
    throw new Error('❌ CDP endpoint not available after retries');
  };

  // Helper to reset Chrome and port forwarding
  const resetChrome = async () => {
    console.log('🔄 Reseting Chrome and port forwarding...');
    execAdb('adb shell am force-stop com.android.chrome');
    execAdb('adb forward --remove tcp:9222');
    execAdb('adb forward tcp:9222 localabstract:chrome_devtools_remote');
    console.log(`🚀 Relaunching Chrome with URL: ${url}`);
    execAdb(`adb shell am start -n com.android.chrome/com.google.android.apps.chrome.Main -d "${url}"`);
  };

  // Step 1: Validate ADB and device
  console.log('🔧 Checking ADB-connected devices...');
  execAdb('adb devices');

  // Step 2: Clean up Chrome state
  console.log('🔧 Cleaning up Chrome state...');
  execAdb('adb shell am force-stop com.android.chrome');

  // Step 3: Set up port forwarding
  console.log('🔧 Forwarding port 9222...');
  execAdb('adb forward tcp:9222 localabstract:chrome_devtools_remote');

  // Step 4: Launch Chrome
  console.log(`🚀 Launching Chrome on Android with URL: ${url}`);
  execAdb(`adb shell am start -n com.android.chrome/com.google.android.apps.chrome.Main -d "${url}"`);

  // Step 5: Wait for CDP endpoint
  let wsEndpoint = await waitForCdpEndpoint();

  // Step 6: Connect to Chrome via CDP with retries
  let browser;
  const maxCdpRetries = 3;
  for (let i = 1; i <= maxCdpRetries; i++) {
    try {
      console.log(`🔗 Connecting to CDP (attempt ${i}/${maxCdpRetries})...`);
      browser = await chromium.connectOverCDP(wsEndpoint);
      console.log(`✅ Browser connected: ${browser.isConnected()}`);
      await new Promise((res) => setTimeout(res, 2000));
      break;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn(`⚠️ CDP connection failed (attempt ${i}/${maxCdpRetries}): ${errorMessage}`);
      if (i === maxCdpRetries) {
        throw new Error('❌ Failed to connect to CDP after retries');
      }
      await resetChrome();
      wsEndpoint = await waitForCdpEndpoint();
    }
  }

  if (!browser) {
    throw new Error('❌ Browser initialization failed');
  }

  const context = browser.contexts()[0];
  if (!context) {
    throw new Error('❌ No existing browser context available');
  }

  const page = await context.newPage();

  // Clear cookies
  await context.clearCookies();

  // Clear browser cache via CDP
  try {
    const cdpSession = await context.newCDPSession(page);
    await cdpSession.send('Network.clearBrowserCache');
    await cdpSession.detach();
    console.log('🧹 Browser cache cleared via CDP');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn(`⚠️ Failed to clear browser cache via CDP: ${errorMessage}`);
  }

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  console.log('✅ Fresh context ready with cleared cache, cookies, localStorage, and sessionStorage.');
  return { context, page };
}
