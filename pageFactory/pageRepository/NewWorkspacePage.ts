import { Page, BrowserContext, Locator, expect } from '@playwright/test';

import { WebActions } from '@lib/WebActions';

import qaTestData from '../../Environment_variables/staging/onBoardingTestData.json';

let webActions: WebActions;
const testData = qaTestData;

export class NewWorkspacePage {
  readonly page: Page;
  readonly context: BrowserContext;
  readonly title: Locator;
  readonly emailField: Locator;
  readonly emailId: Locator;
  readonly passwordField: Locator;
  readonly signinButton: Locator;
  readonly clickOnHome: Locator;
  readonly clickOnFileTicket: Locator;
  readonly clickOnCloseIcon: Locator;
  readonly clickOnMessage: Locator;
  readonly clickOnSlackLaunch: Locator;
  readonly slackRecognizeTitle: Locator;

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
    webActions = new WebActions(this.page, this.context);
    this.title = page.locator('//*[@title="Slack"]');
    this.emailField = page.locator(
      '//*[contains(text(),"Enter email and password")]',
    );
    this.emailId = page.locator('//input[@placeholder="you@example.com"]');
    this.passwordField = page.locator('//input[@placeholder="password"]');
    this.signinButton = page.locator('//*[contains(text(),"Sign In")]');
    this.clickOnHome = page.locator('//button[@id="app"]');
    this.clickOnMessage = page.locator('//button[@id="messages"]');
    this.clickOnFileTicket = page.locator(
      '//*[contains(text(),"File a ticket")]',
    );
    this.clickOnCloseIcon = page.locator('//button[@aria-label="Close"]');
    this.clickOnSlackLaunch = page.locator(
      '//button[@aria-label="Launch in Slack"]',
    );
    this.slackRecognizeTitle = page.locator(
      '//h1[contains(text(),"We don’t recognize this browser")]',
    );
  }

  /**
   * Method to enter OTP
   */
  async enterOTP() {
    if (await this.slackRecognizeTitle.isVisible({ timeout: 5000 })) {
      const OTP = await webActions.extractOTP();
      await this.page.waitForSelector('input[aria-label="digit 1 of 6"]');
      for (let i = 0; i < OTP.length; i++) {
        await this.page
          .locator(`input[aria-label="digit ${i + 1} of 6"]`)
          .fill(OTP[i]);
      }
      await this.page.waitForLoadState();
    }
  }

  /**
   * Method to navigate Slack Workspace
   */
  async loginToSlack() {
    await this.page.goto(testData.slackURL);
    await this.page.waitForLoadState();
    await webActions.createMailslurpInbox();
    await expect(this.page).toHaveTitle('Sign in to CF-Sandbox | Slack');
    await this.page
      .locator('//*[contains(text(),"Enter email and password")]')
      .isVisible();
    await this.emailField.click();
    await this.emailId.click();
    await this.emailId.fill(testData.userEmail);
    await this.passwordField.click();
    await this.passwordField.fill(
      await webActions.decipherPassword(testData.sandBoxPassword),
    );
    await this.signinButton.click();
    //wait command is used to load the workspace directory page.
    await this.page.waitForTimeout(5000);
    await this.enterOTP();

    if (await this.clickOnSlackLaunch.isVisible({ timeout: 15000 })) {
      await this.clickOnSlackLaunch.click();
      await this.page.waitForLoadState();
      await this.againNavigateToSlack();
    }
  }

  /**
   * Method to verify Slack Page Title
   */
  async verifySlackPageTitle() {
    await expect(this.page).toHaveTitle('Login | Slack');
  }

  /**
   * Method to navigate from Slack to Clearfeed
   */
  async againNavigateToCF() {
    const pages = this.context.pages();
    await pages[1].bringToFront();
  }

  /**
   * Method to navigate from Slack to Clearfeed
   */
  async againNavigateToSlack() {
    const pages = this.context.pages();
    await pages[0].bringToFront();
    await this.page.close();
  }
}
