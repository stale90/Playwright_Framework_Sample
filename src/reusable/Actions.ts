import { Page, Locator, test as baseTest, expect, Dialog, BrowserContext } from '@playwright/test';
import { test } from '@playwright/test';
import { Logger } from './Logger';
import { GlobalConfig } from '../config/PlaywrightConfig';
import * as fs from 'fs';

export class Actions {
  // **Page utility methods**


  // Navigation to URL
  static async navigateTo(page: Page, url: string): Promise<void> {
    await test.step(`Navigate to: ${url}`, async () => {
      await page.goto(url, { waitUntil: 'load', timeout: GlobalConfig.TIMEOUT_NAVIGATION });
    });
  }

  // open New Tab with Url
  static async openNewPage(context: BrowserContext, url: string) {
    await test.step(`Open New Tab with URL : ${url}`, async () => {
      const newPage = await context.newPage();
      await this.navigateTo(newPage, url);
      //await newPage.goto(url, { waitUntil: 'load', timeout: GlobalConfig.TIMEOUT_NAVIGATION });
    });
  }

  // Verify Current URL Contains 'text' 
  static async verifyUrlContains(
    page: Page,
    expectedText: string,
    desc: string,
    timeout: number = GlobalConfig.TIMEOUT_EXPECT
  ): Promise<void> {
    await test.step(`Verify ${desc} contains "${expectedText}" - ${desc}`, async () => {
      await expect(page).toHaveURL(new RegExp(expectedText), { timeout });
    });
  }


  // Verify Current URL
  static async verifyCurrentUrl(page: Page, expectedUrl: string | RegExp, desc: string): Promise<boolean> {
    let result = false;
    await test.step(`Verify URL "${desc}" as "${expectedUrl}"`, async () => {
      await expect(page).toHaveURL(expectedUrl);
      result = true;
    });
    return result;
  }

  // **Screenshot with Allure**
  static async addScreenshot(page: Page, desc: string): Promise<void> {
    await test.step(`📸 Screenshot: ${desc}`, async () => {
      const screenshot = await page.screenshot({ fullPage: true });
      const testInfo = baseTest.info();
      await testInfo.attach(`${desc}.png`, {
        body: screenshot,
        contentType: 'image/png'
      });
    });
  }


  static async hardWait(sec: number): Promise<void> {
    let ms = sec * 1000;
    return await new Promise(resolve => setTimeout(resolve, ms));
  }

  // **Locator helper**
  private static getLocator(page: Page, selector: string | Locator): Locator {
    return typeof selector === 'string' ? page.locator(selector) : selector;
  }

  // **Assertions**
  static async verifyPartText(element: Locator, expectedText: string, desc: string): Promise<void> {
    await test.step(`Verify "${desc}" which contains: "${expectedText}"`, async () => {
      await expect.soft(element).toContainText(expectedText);
    });
  }

  static async verifyText(element: Locator, expectedText: string, desc: string): Promise<void> {
    await test.step(`Verify "${desc}" with full text: "${expectedText}"`, async () => {
      await expect.soft(element).toHaveText(expectedText);
    });
  }

  static async verifyTextHard(element: Locator, expectedText: string, desc: string): Promise<void> {
    await test.step(`Verify "${desc}" with full text: "${expectedText}"`, async () => {
      await expect(element).toHaveText(expectedText);
    });
  }

  static async verifyPartTextHard(element: Locator, expectedText: string, desc: string): Promise<void> {
    await test.step(`Verify "${desc}" which contains: "${expectedText}"`, async () => {
      await expect(element).toContainText(expectedText);
    });
  }

  static async verifyTextIgnoreCase(element: Locator, expectedText: string, desc: string): Promise<void> {
    await test.step(`Verify "${desc}" (case-insensitive) with text: "${expectedText}"`, async () => {
      const actualText = await element.textContent();
      expect.soft(actualText?.toLowerCase().trim()).toBe(
        expectedText.toLowerCase().trim()
      );
    });
  }

  static async verifyPartTextIgnoreCase(element: Locator, expectedText: string, desc: string): Promise<void> {
    await test.step(`Verify "${desc}" (case-insensitive) with text: "${expectedText}"`, async () => {
      const actualText = await element.textContent();
      expect.soft(actualText?.toLowerCase()).toContain(
        expectedText.toLowerCase()
      );
    });
  }


  static async verifyAttributeValue(
    element: Locator,
    attributeName: string,
    attributeValue: string,
    desc: string
  ): Promise<void> {
    await test.step(`Verify "${desc}" attribute "${attributeName}": "${attributeValue}"`, async () => {
      await expect(element).toHaveAttribute(attributeName, attributeValue);
    });
  }

  // **Actions**
  static async fill(element: Locator, value: string, desc: string): Promise<void> {
    await test.step(`Fill "${desc}": "${value}"`, async () => {
      await expect(element).toBeVisible();
      await element.fill(value);
    });
  }

  static async typeInput(element: Locator, value: string, desc: string): Promise<void> {
    await test.step(`Type into "${desc}": "${value}"`, async () => {
      await expect(element).toBeVisible();
      await element.type(value);
    });
  }

  static async clearInput(element: Locator, desc: string): Promise<void> {
    await test.step(`Clear "${desc}"`, async () => {
      await expect(element).toBeVisible();
      await element.fill('');
    });
  }

  static async clickAndGetDialogMessage(element: Locator, page: Page): Promise<string> {
    let dialogMessage = '';

    // Register dialog handler BEFORE click
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });
    await element.click();
    return dialogMessage;
  }

  static async click(element: Locator, desc: string): Promise<void> {
    await test.step(`Click "${desc}"`, async () => {
      await expect(element).toBeEnabled({ timeout: GlobalConfig.TIMEOUT_ACTION });
      await element.click();
    });
  }

  static async clickOutside(page: Page) {
    await test.step(`Click Outside the Element`, async () => {
      await page.mouse.click(5, 5); // small offset to avoid edges
    });
  }

  static async clickSaveAndGetAlertMsg(page: Page) {
    const element = page.getByRole('button', { name: 'Save & Next' });
    const dialogPromise = Actions.handleMultipleDialogs(page, 1);
    await Actions.click(element, "Save & Next CTA");
    const allMessages = await dialogPromise;
    return allMessages[0];
  }

  static async doubleClick(element: Locator, desc: string): Promise<void> {
    await test.step(`Double-click "${desc}"`, async () => {
      await expect(element).toBeVisible();
      await element.dblclick();
    });
  }

  static async rightClick(element: Locator, desc: string): Promise<void> {
    await test.step(`Right-click "${desc}"`, async () => {
      await expect(element).toBeEnabled({ timeout: GlobalConfig.TIMEOUT_EXPECT });
      await element.click({ button: 'right' });
    });
  }

  static async checkCheckbox(element: Locator, desc: string): Promise<void> {
    await test.step(`Check "${desc}"`, async () => {
      await expect(element).toBeVisible();
      await element.check();
    });
  }

  static async uncheckCheckbox(element: Locator, desc: string): Promise<void> {
    await test.step(`Uncheck "${desc}"`, async () => {
      await expect(element).toBeVisible();
      await element.uncheck();
    });
  }

  static async addStepMessage(msg: any): Promise<void> {
    await test.step(`${msg}`, async () => {
      // Externally Added in Report
    });
  }

  static async clickSaveGetAlertMsg1(page: Page) {
    const btn_SaveNext = page.getByRole('button', { name: 'Save & Next' });
    const dialogPromise = Actions.handleMultipleDialogs(page, 1);
    await Actions.click(btn_SaveNext, "Save & Next CTA");
    const allMessages = await dialogPromise;
    return allMessages[0];
  }

  static async clickSaveGetAlertMsg(page: Page, element: Locator) {
    const dialogPromise = Actions.handleSingleDialog(page, "Error Message");
    await Actions.click(element, "Click Button");
    const message = await dialogPromise;
    return message;
  }


  static async selectDropdown(
    element: Locator,
    value: string | string[] | Record<string, any>,
    desc: string
  ): Promise<void> {
    await test.step(`Select "${value}" in "${desc}"`, async () => {
      await expect(element).toBeVisible();
      await element.selectOption(value);
    });
  }


  static async selectDropdownByIndex(
    element: Locator,
    index: number,
    desc: string
  ): Promise<void> {
    await test.step(`Select index "${index}" in "${desc}"`, async () => {
      await expect(element).toBeVisible();
      await element.selectOption({ index });
    });
  }


  static async uploadFile(element: Locator, filePath: string, desc: string): Promise<void> {
    await test.step(`Upload "${desc}"`, async () => {
      await expect(element).toBeVisible();
      await element.setInputFiles(filePath);
    });
  }

  static async hover(element: Locator, desc: string): Promise<void> {
    await test.step(`Hover "${desc}"`, async () => {
      await expect(element).toBeVisible();
      await element.hover();
    });
  }

  // **Verification (Return Boolean)**
  static async isVisible(element: Locator): Promise<boolean> {
    try {
      await expect(element).toBeVisible({ timeout: GlobalConfig.TIMEOUT_EXPECT });
      return true;
    } catch {
      return false;
    }
  }

  static async isLocatorEnabled(element: Locator, timeout = GlobalConfig.TIMEOUT_WAIT): Promise<boolean> {
    try {
      // Wait briefly for element to be attached to DOM
      await element.waitFor({ state: 'attached', timeout }).catch(() => { });

      // Primary: Playwright check (snapshot)
      const enabled = await element.isEnabled().catch(() => false);
      if (enabled) return true;

      // Fallback: aria-disabled attribute
      const aria = await element.getAttribute('aria-disabled').catch(() => null);
      if (aria === 'true') return false;

      // Fallback: disabled attribute
      const disabledAttr = await element.getAttribute('disabled').catch(() => null);
      if (disabledAttr !== null) return false;

      return false;
    } catch {
      return false;
    }
  }

  static async isEnabled(element: Locator) {
    try {
      await expect(element).toBeEnabled();
      return true;
    } catch {
      return false;
    }
  }

  static async hasText(element: Locator, expectedText: string, desc: string): Promise<boolean> {
    try {
      await expect(element).toContainText(expectedText);
      return true;
    } catch {
      return false;
    }
  }

  static async getText(element: Locator, desc: string): Promise<string> {
    return await element.textContent() || '';
  }

  static async getAttributeValue(
    element: Locator,
    attr: string,
    desc: string
  ): Promise<string | null> {
    return await element.getAttribute(attr);
  }

  // **Wait methods**
  static async waitForVisible(element: Locator, desc: string, timeout: number = GlobalConfig.TIMEOUT_WAIT): Promise<void> {
    await test.step(`Wait visible "${desc}"`, async () => {
      await element.waitFor({ state: 'visible', timeout });
    });
  }

  static async waitForHidden(element: Locator, desc: string, timeout: number = GlobalConfig.TIMEOUT_WAIT): Promise<void> {
    await test.step(`Wait hidden "${desc}"`, async () => {
      await element.waitFor({ state: 'hidden', timeout });
    });
  }

  // **Dynamic click**
  static async clickDynamic(page: Page, selector: string | Locator, desc: string): Promise<void> {
    const locator = typeof selector === 'string' ? page.locator(selector) : selector;
    await test.step(`Dynamic click "${desc}"`, async () => {
      await expect(locator).toBeEnabled({ timeout: GlobalConfig.TIMEOUT_EXPECT });
      await locator.click();
    });
  }

  // **Table helpers**
  static async getTableRowCount(table: Locator, desc: string): Promise<number> {
    return await table.locator('tbody tr').count();
  }

  static async getTableCellText(
    table: Locator,
    row: number,
    col: number,
    desc: string
  ): Promise<string> {
    const cell = table.locator(`tbody tr:nth-child(${row}) td:nth-child(${col})`);
    await expect(cell).toBeVisible();
    return await cell.textContent() || '';
  }

  static async handleMultipleDialogs(page: Page, expectedCount: number) {
    const messages: string[] = [];
    return new Promise<string[]>((resolve) => {
      const handler = async (dialog: Dialog) => {
        const msg = dialog.message();
        messages.push(msg);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await dialog.accept();

        if (messages.length === expectedCount) {
          page.off('dialog', handler); // cleanup
          resolve(messages);
        }
      };
      page.on('dialog', handler);
    });
  }

  static async handleSingleDialog(page: Page, desc: string): Promise<string> {
    return new Promise<string>((resolve) => {
      page.once('dialog', async (dialog: Dialog) => {
        const message = dialog.message();
        // Hold popup for 2 seconds
        await new Promise((res) => setTimeout(res, 1000));
        await dialog.accept();
        resolve(message);
      });
    });
  }



  static async compareString(actual: string, expected: string): Promise<boolean> {
    let flag = false;
    await test.step(`Compared - Actual : "${actual}" and Expected : "${expected}"`, async () => {
      if (actual.includes(expected)) {
        flag = true;
      } else {
        flag = false;
        Logger.info('Test Case : ' + 'Failed');
        //throw new Error();
      }
    });
    return flag;
  }
  static async assertPartialString(actual: string, expected: string, desc: string): Promise<void> {
    await test.step(`Actual string : "${actual}"  and Expected string : "${expected}"`, async () => {
      if (actual.includes(expected)) {
        Logger.info('Test Case : ' + 'Passed')
      } else {
        Logger.info('Test Case : ' + 'Failed');
        //throw new Error();
      }
    });
  }


  static async savePageAsPDF(page: Page, filePath: string, desc: string): Promise<void> {
    await test.step(`Save page as PDF - "${desc}"`, async () => {
      // Ensure directory exists
      const dir = filePath.substring(0, filePath.lastIndexOf('/'));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Optional: ensure page is loaded
      await expect(page).toHaveURL(/.*/);

      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true
      });
    });
    // calling - await Actions.savePageAsPDF(page, 'C:/temp/sample.pdf', 'Home Page PDF');
  }

}