import { Page, BrowserContext, expect } from '@playwright/test';
import axios from 'axios';

import { WebActions } from '@lib/WebActions';

import qaTestData from '../../Environment_variables/staging/onBoardingTestData.json';
import { testConfig } from '../../testConfig';

const envurl = testConfig.stageApi;

let webActions: WebActions;
const testData = qaTestData;
export let requestChannelName: string;

export class OnboardingPage {
  // private requestChannelName: string;
  private messageID: string;
  private magicLink: string;
  readonly page: Page;
  readonly context: BrowserContext;

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
    webActions = new WebActions(this.page, this.context);
  }

  /**
   * Method to navigate application page
   * @returns
   */
  async navigateToClearFeedApplictaion() {
    const onBoardingPage = await this.context.newPage();
    await onBoardingPage.goto('/');
    await onBoardingPage.waitForLoadState();
    await expect(onBoardingPage).toHaveTitle('Login | ClearFeed');
    return onBoardingPage;
  }

  /**
   * Method to create and enter Magic Link
   * @param onBoardingPage
   * @param email
   * @param password
   */
  async loginWithMagicLink(onBoardingPage: Page) {
    await onBoardingPage
      .locator('//input[@id="email"]')
      .fill(testData.userEmail);
    await onBoardingPage
      .locator('//span[contains(text(),"Send login link to email")]')
      .click();
    await onBoardingPage.locator('//div[@class="mt-2"]//span').isVisible();
    await this.fechMessageId();
    await this.fetchMagicLink();
    const magicLinkPage = await this.context.newPage();
    await magicLinkPage.goto(this.magicLink);
    // await webActions.deleteInbox();
    await magicLinkPage.waitForLoadState();
    await magicLinkPage.close();
  }

  /**
   * Method to verify account setup title
   * @param cfpage
   */
  async loginToClearFeedWithMagicLink(cfpage: Page) {
    await this.loginWithMagicLink(cfpage);
    await cfpage.bringToFront();
    await cfpage.waitForLoadState('load');
    await expect(cfpage).toHaveTitle('Account Setup', { timeout: 10000 });
  }

  /**
   * Method to verify Great to have you here page
   * @param onBoardingPage
   * @param phone
   * @param code
   */
  async verifyHaveYouHerePage(
    onBoardingPage: Page,
    phone: number,
    code: string,
  ): Promise<void> {
    await onBoardingPage
      .locator('(//*[contains(text(),"Step")])[1]')
      .isVisible();
    await onBoardingPage
      .locator('//h2[contains(text(),"Great to have you here")]')
      .isVisible();
    await onBoardingPage
      .locator(
        '//*[contains(text(),"Let’s get your account set up in a few steps")]',
      )
      .isVisible();
    await onBoardingPage
      .locator('//*[contains(text(),"How did you hear about ClearFeed?")]')
      .isVisible();
    await onBoardingPage.locator('//button[@type="submit"]').click();
    await onBoardingPage
      .locator(
        '//*[contains(text(),"Please specify how you heard about ClearFeed")]',
      )
      .isVisible();
    await onBoardingPage
      .locator('//*[contains(text(),"Please specify your use case")]')
      .isVisible();
    await onBoardingPage
      .locator('//*[contains(text(),"Please enter a valid phone number")]')
      .isVisible();
    await onBoardingPage
      .locator('//*[contains(text(),"Opt in for White Glove Support")]')
      .isVisible();
    await this.selectRandomRadioButtonByCSS(onBoardingPage);
    await onBoardingPage
      .locator('//*[contains(text(),"Describe your use case")]')
      .isVisible();
    await this.selectRandomRadioButonForCase(onBoardingPage);
    await onBoardingPage.evaluate(() => window.scrollBy(0, 1000));
    await onBoardingPage.locator('//*[contains(text(),"Phone")]').isVisible();
    await onBoardingPage.locator('//div[@class="ant-select-selector"]').click();
    await onBoardingPage
      .locator('//input[@id="primary_contact_info_country_code"]')
      .fill(code);
    await onBoardingPage.locator('text=[IN] India +91').click();
    await onBoardingPage
      .locator('//input[@placeholder="Your number"]')
      .fill('');
    await onBoardingPage.locator('//button[@type="submit"]').click();
    await onBoardingPage
      .locator('//div[contains(text(),"Please enter a valid phone number")]')
      .isVisible();
    await onBoardingPage
      .locator('//input[@placeholder="Your number"]')
      .fill(phone.toString());
  }

  /**
   * Method to verify Great Company link
   * @param onBoardingPage
   */
  async verifyGreatCompany(onBoardingPage: Page) {
    await onBoardingPage
      .locator('//h1[contains(text(),"You are in great company")]')
      .isVisible();
    const greatCompany = await onBoardingPage.$$(
      '//div[@class="ant-image"]//img',
    );
    for (let i = 0; i < greatCompany.length; i++) {
      await greatCompany[i].isVisible();
    }
  }

  /**
   * Method to verify Glove Support opt
   * @param onBoardingPage
   */
  async verifyGloveSupportOpt(onBoardingPage: Page): Promise<void> {
    await onBoardingPage
      .locator('//input[@id="send_slack_connect_invite"]')
      .isVisible();
    await onBoardingPage.locator('//button[@type="submit"]').click();
  }

  /**
   * Method to verify Glove opt and uncheck the check box
   * @param onBoardingPage
   */
  async clickOnGloveSupportOpt(onBoardingPage: Page): Promise<void> {
    await onBoardingPage
      .locator('//input[@id="send_slack_connect_invite"]')
      .isVisible();
    await onBoardingPage
      .locator('//input[@id="send_slack_connect_invite"]')
      .click();
    await onBoardingPage.locator('//button[@type="submit"]').click();
  }

  /**
   * Method to verify hear about ClearFeed
   * @param onBoardingPage
   */
  async selectRandomRadioButtonByCSS(onBoardingPage: Page): Promise<void> {
    const hearAboutClearfeedOpt = await onBoardingPage.$$(
      '//div[@id="cf_discovery_source_source"]//span/preceding-sibling::input[@type=\'radio\']',
    );
    for (let i = 0; i < hearAboutClearfeedOpt.length; i++) {
      await hearAboutClearfeedOpt[i].click();
    }
    await onBoardingPage
      .locator('//input[@id="cf_discovery_source_other_source"]')
      .isVisible();
    const randomValue: string = testData.radioButtonValues[0];
    const selector: string = `//div[@id="cf_discovery_source_source"]//span/preceding-sibling::input[@type='radio'][@value="${randomValue}"]`;
    await onBoardingPage.waitForSelector(selector, { timeout: 90000 });
    const radioButton = onBoardingPage.locator(selector);
    await radioButton.isVisible();
    await radioButton.click();
    await onBoardingPage.waitForLoadState();
  }

  /**
   * Method to verify teams
   * @param onBoardingPage
   */
  async selectRandomRadioButonForCase(onBoardingPage: Page): Promise<void> {
    await onBoardingPage
      .locator('//*[contains(text(),"Which team are you a part of?")]')
      .isVisible();
    const teamOpt = await onBoardingPage.$$(
      '//div[@id="account_use_case_use_case"]//span/preceding-sibling::input[@type="radio"]',
    );
    for (let i = 0; i < teamOpt.length; i++) {
      await teamOpt[i].check();
    }
    await onBoardingPage
      .locator('//input[@placeholder="Tell us your use case"]')
      .isVisible();
    const randomValue: string = testData.radioButtonValuesForCase[0];
    const selector: string = `//div[@id="account_use_case_use_case"]//span/preceding-sibling::input[@type="radio"][@value="${randomValue}"]`;
    await onBoardingPage.waitForSelector(selector, { timeout: 7000 });
    const radioButton = onBoardingPage.locator(selector);
    await radioButton.isVisible();
    await radioButton.click();
    await onBoardingPage.waitForLoadState();
  }

  /**
   * Method to verify Install ClearFeed App Page
   * @param onBoardingPage
   */
  async verifyAuthorizeSlack(onBoardingPage: Page): Promise<void> {
    await onBoardingPage
      .locator('(//*[contains(text(),"Step")])[1]')
      .isVisible();
    await onBoardingPage
      .locator('//h2[contains(text(),"Install ClearFeed App")]')
      .isVisible();
    await onBoardingPage
      .locator('//label[@class="ant-radio-button-wrapper px-6 py-7"]')
      .isVisible();
    await onBoardingPage
      .locator(
        '//label[@class="ant-radio-button-wrapper ant-radio-button-wrapper-checked px-6 py-7"]',
      )
      .click();
    await onBoardingPage
      .locator(
        '(//*[contains(text(),"Don\'t have permission to add apps to Slack ? ")])[1]',
      )
      .isVisible();
    await onBoardingPage
      .locator('//div[@class="ant-typography-copy"]')
      .isVisible();
    await onBoardingPage.locator('//div[@class="ant-typography-copy"]').click();
    await this.verifySecureFromDayOne(
      onBoardingPage,
      testData.secureFromDayOneImageForAuthorizeSlacPage,
    );
    await onBoardingPage
      .locator(
        '//button[@type="button"]//span[contains(text(),"Authorize Slack")]',
      )
      .click();
  }

  /**
   * Method to verify Secure From Day One images and links
   * @param onBoardingPage
   * @param index
   */
  async verifySecureFromDayOne(onBoardingPage: Page, index: number) {
    await onBoardingPage
      .locator(`(//*[contains(text(),"Step")])[${index}]`)
      .isVisible();
    const secureData = await onBoardingPage.$$(
      '//div[@class="ant-image"]//img',
    );
    for (let i = 0; i < secureData.length; i++) {
      await secureData[i].isVisible();
    }
    const privacyLink = await onBoardingPage.$$('//div[@class="ant-col mb-1"]');
    for (let i = 0; i < privacyLink.length; i++) {
      await privacyLink[i].isVisible();
    }
  }

  /**
   * Method to verify requesting permission
   * @param onBoardingPage
   */
  async verifySignInClearFeed(onBoardingPage: Page): Promise<void> {
    await onBoardingPage
      .locator('//h2[@class="p-oauth_page__heading"]')
      .isVisible();
    await onBoardingPage.evaluate(() => {
      window.scrollBy(0, 1000);
    });
    const clearfeedStagingSections = await onBoardingPage.$$(
      '//section[@class="p-scope_info__section"]',
    );
    for (let i = 0; i < clearfeedStagingSections.length; i++) {
      await clearfeedStagingSections[i].isVisible();
    }
    await onBoardingPage.locator('//button[@aria-label="Allow"]').isVisible();
    await onBoardingPage.locator('//button[@aria-label="Allow"]').click();
    await onBoardingPage.waitForLoadState();
  }

  /**
   * Method to navigate from Clearfeed to Slack workspace
   * @param onBoardingPage
   */
  async navigateBack(onBoardingPage: Page) {
    await onBoardingPage.waitForLoadState();
    const pages = this.context.pages();
    await pages[0].bringToFront();
  }

  /**
   * Method to navigate from Slack to Clearfeed
   * @param onBoardingPage
   */
  async againNavigateToCF(onBoardingPage: Page): Promise<void> {
    const pages = this.context.pages();
    await pages[1].bringToFront();
    await onBoardingPage.waitForLoadState();
  }

  /**
   * Method to verify onboarding page using standalone helpdesk
   * @param onBoardingPage
   * @param accountSetup
   */
  async verifyAccountSetUp(
    onBoardingPage: Page,
    accountSetup: string,
  ): Promise<void> {
    await onBoardingPage
      .locator('//h2[@class="ant-typography mt-1 mb-1"]')
      .isVisible();
    await onBoardingPage
      .locator('//*[contains(text(),"How do you plan to use ClearFeed?")]')
      .isVisible();
    await onBoardingPage
      .locator(`//*[contains(text(),"${accountSetup}")]`)
      .click();
    await onBoardingPage.evaluate(() => {
      window.scrollBy(0, 1000);
    });
    await onBoardingPage
      .locator('//*[@class="ant-radio-input"][@value="STANDALONE"]')
      .click();
    await this.verifySecureFromDayOne(
      onBoardingPage,
      testData.secureFromDayOneImageForAccountSetUpPage,
    );
    await onBoardingPage.locator('//span[contains(text(),"Continue")]').click();
  }

  /**
   * Method to verify onboarding page using Extenal tools
   * @param onBoardingPage
   */
  async verifyAccountSetUpByUsingExternalTools(
    onBoardingPage: Page,
  ): Promise<void> {
    await onBoardingPage
      .locator('//h2[@class="ant-typography mt-1 mb-1"]')
      .isVisible();
    await onBoardingPage
      .locator('//*[contains(text(),"How do you plan to use ClearFeed?")]')
      .isVisible();
    await onBoardingPage.evaluate(() => {
      window.scrollBy(0, 1000);
    });
    await onBoardingPage
      .locator('(//*[@class="ant-radio-input"][@value="EXTERNAL"])[2]')
      .click();
    await onBoardingPage
      .locator('(//span[contains(text(),"Zendesk")])[2]')
      .click();
    await onBoardingPage
      .locator('(//div[contains(text(),"Zendesk")])[1]')
      .click();
    await onBoardingPage
      .locator('//span[contains(text(),"Connect")]')
      .isVisible();
  }

  /**
   * Method to create a requestChannel and triageChannel
   * @param onBoardingPage
   */
  async verifyCollection(onBoardingPage: Page): Promise<void> {
    await onBoardingPage
      .locator('//*[@class="ant-typography mt-1 mb-1"]')
      .isVisible();
    const slackLinks = await onBoardingPage.$$(
      '//ul[@class="my-1 mb-6 px-6 text-neutral-700"]//li',
    );
    for (let i = 0; i < slackLinks.length; i++) {
      await slackLinks[i].isVisible();
    }
    await this.verifyRequestChannelImg(
      onBoardingPage,
      testData.requestChannelImage,
    );
    await onBoardingPage
      .locator('//input[@id="requestChannelName"]')
      .fill('igs' + (await webActions.getCryptoRandomNumber(1, 100)));
    requestChannelName = await onBoardingPage
      .locator('//input[@id="requestChannelName"]')
      .getAttribute('value');
    await onBoardingPage.locator('//span[contains(text(),"Continue")]').click();
    await onBoardingPage
      .locator('//*[@class="ant-typography mt-1 mb-1"]')
      .isVisible();
    await this.verifyRequestChannelImg(
      onBoardingPage,
      testData.requestChannelImage,
    );
    await onBoardingPage
      .locator('//input[@id="triageChannelName"]')
      .fill('igsindia' + (await webActions.getCryptoRandomNumber(1, 100)));
    await onBoardingPage
      .locator('//input[@id="triageChannelName"]')
      .getAttribute('value');
    await onBoardingPage.locator('//span[contains(text(),"Continue")]').click();
    await onBoardingPage
      .locator('//*[@class="ant-typography mt-1 mb-1"]')
      .isVisible();
    await this.verifyRequestChannelImg(
      onBoardingPage,
      testData.requestChannelImage,
    );
    await onBoardingPage
      .locator('//*[contains(text(),"Email Addresses")]')
      .isVisible();
    await onBoardingPage
      .locator('//*[contains(text(),"+ Add Invite")]')
      .click();
    await onBoardingPage.locator('(//button[@type="button"])[1]').isVisible();
    await onBoardingPage
      .locator('//input[@id="dynamic_form_nest_item_users_0_email"]')
      .fill(testData.addInvite);
    await onBoardingPage.locator('//*[contains(text(),"Submit")]').click();
    await onBoardingPage
      .locator('//div[@class="ant-alert-message"]')
      .isVisible();
    await onBoardingPage.locator('//span[contains(text(),"Skip")]').click();
  }

  /**
   * Method to verify Request channel image
   * @param onBoardingPage
   * @param index
   */
  async verifyRequestChannelImg(onBoardingPage: Page, index: number) {
    await onBoardingPage
      .locator(`(//*[contains(text(),"Step")])[${index}]`)
      .isVisible();
    await onBoardingPage
      .locator('(//div[@class="ant-image"]//img)[3]')
      .isVisible();
  }

  /**
   * Method to verify Explore your setup page
   * @param onBoardingPage
   */
  async verifyYouAreAllSetPage(onBoardingPage: Page): Promise<void> {
    await onBoardingPage
      .locator('//*[contains(text(),"You’re all set!")]')
      .isVisible();
    await onBoardingPage
      .locator('//a[contains(text(),"Quick cheat sheet")]')
      .isVisible();
    await onBoardingPage
      .locator('//*[contains(text(),"Quick video")]')
      .isVisible();
    await onBoardingPage
      .locator('//span[contains(text(),"Reach out to us via Slack Connect")]')
      .isVisible();
    await onBoardingPage
      .locator('//span[contains(text(),"Send Invite")]')
      .isEnabled();
    await onBoardingPage
      .locator('//span[contains(text(),"Reach out to us via Chat")]')
      .isVisible();
    await onBoardingPage
      .locator('//span[contains(text(),"Chat Now")]')
      .isEnabled();
    await onBoardingPage
      .locator('//span[contains(text(),"Set up an onboarding call with us")]')
      .isVisible();
    await onBoardingPage
      .locator('//span[contains(text(),"Schedule")]')
      .isEnabled();
    await onBoardingPage
      .locator('//button[@aria-label="Open Beacon popover"]')
      .isVisible();
    const dashboard = onBoardingPage.locator(
      '//*[contains(text(),"Go to dashboard")]',
    );
    await dashboard.click();
    await onBoardingPage.waitForLoadState();
    const actRequestedChannelname = await onBoardingPage
      .locator('//span[@class="break-word"]')
      .textContent();
    expect(actRequestedChannelname).toContain(requestChannelName);

    await onBoardingPage.waitForLoadState('load');
    await onBoardingPage.locator('//span[text()="Inbox"]').isVisible();
    await onBoardingPage.waitForLoadState('load');
  }

  /**
   * Method to verify Dashboard and create a Request
   * @param onBoardingPage
   */
  async verifyDashboardAndCreateRequest(onBoardingPage: Page) {
    await onBoardingPage.waitForLoadState();
    await onBoardingPage.locator('//*[contains(text(),"New Request")]').click();
    await onBoardingPage
      .locator('//h3[contains(text(),"Request")]')
      .isVisible();
    await onBoardingPage
      .locator('//*[contains(text(),"Create Request")]')
      .click();
    await onBoardingPage
      .locator('//*[contains(text(),"Request Description is required")]')
      .isVisible();
    await onBoardingPage
      .locator('//button[@class="ant-modal-close"]//span//span')
      .isVisible();
    await onBoardingPage
      .locator('//label[contains(text(),"Request Channel")]')
      .isVisible();
    await onBoardingPage.locator('//input[@id="topic_id"]').click();
    await onBoardingPage
      .locator('(//div[@class="ant-select-item-option-content"]//div)[2]')
      .click();
    await this.clickOnCloseIcon(
      onBoardingPage,
      testData.dashboardPopupCloseIconAsCustomer,
    );
    await onBoardingPage
      .locator('//label[contains(text(),"Request Description")]')
      .isVisible();
    await onBoardingPage
      .locator('//div[@class="ql-container ql-snow"]//div[1]')
      .fill(testData.requestDescription);
    await onBoardingPage
      .locator(' //label[contains(text(),"Status")]')
      .isVisible();
    await onBoardingPage
      .locator('//label[contains(text(),"Priority")]')
      .isVisible();
    await onBoardingPage
      .locator('//label[contains(text(),"Assignee")]')
      .isVisible();
    await onBoardingPage.locator('//input[@id="assignee_user_id"]').click();
    await onBoardingPage
      .locator('(//*[contains(text(),"clearfeed01")])[1]')
      .click();
    await onBoardingPage
      .locator('//*[contains(text(),"Create Request")]')
      .click();
    await onBoardingPage
      .locator('//*[contains(text(),"Request has been created successfully.")]')
      .isVisible();
    const actRequestedChannelname = await onBoardingPage
      .locator('//span[@class="break-word"]')
      .textContent();
    expect(actRequestedChannelname).toContain(requestChannelName);
  }

  /**
   * Method for close popup
   * @param onBoardingPage
   * @param index
   */
  async clickOnCloseIcon(onBoardingPage: Page, index: number) {
    await onBoardingPage
      .locator(`(//button[@class="ant-modal-close"]//span)[${index}]`)
      .click();
  }

  /**
   * Method to verify Collection Setting
   * @param onBoardingPage
   */
  async verifyCollectionSetting(onBoardingPage: Page) {
    await onBoardingPage
      .locator('(//*[contains(text(),"Slack Channels")])[1]')
      .click();
    await onBoardingPage
      .locator('(//div[@class="ant-segmented-group"]//div)[3]')
      .click();
    const headersText = await onBoardingPage.$$(
      '//span[@class="ant-collapse-header-text"]',
    );
    for (let i = 0; i < headersText.length; i++) {
      await headersText[i].isVisible();
      await headersText[i].click();
      await headersText[i].click();
    }
  }

  /**
   * Method to verify Request Channel
   * @param onBoardingPage
   * @param index
   */
  async verifyRequestChannel(onBoardingPage: Page, index: number) {
    await onBoardingPage
      .locator(`(//span[@class="ant-collapse-header-text"])[${index}]`)
      .click();
    const actRequestedChannelname = await onBoardingPage
      .locator(
        '(//table[@style="table-layout: auto;"]//tbody//tr//td)[1]//span//span',
      )
      .textContent();
    expect(actRequestedChannelname).toContain(requestChannelName);
    await onBoardingPage
      .locator('(//span[@class="ant-collapse-header-text"])[3]')
      .click();
  }

  /**
   * Method to verify Workflow
   * @param onBoardingPage
   */
  async verifyWorkflow(onBoardingPage: Page) {
    await onBoardingPage
      .locator('//*[contains(text(),"COLLECTIONS")]')
      .isVisible();
    await onBoardingPage
      .locator(
        '(//span[@class="ant-tree-switcher ant-tree-switcher_close"])[2]//span',
      )
      .click();
    await onBoardingPage
      .locator('(//*[contains(text(),"Slack Channels")])[1]')
      .isVisible();
    await onBoardingPage
      .locator(
        '(//span[@class="ant-tree-switcher ant-tree-switcher_close"])[2]//span',
      )
      .click();
    await onBoardingPage
      .locator('(//*[contains(text(),"Slack Channels")])[1]')
      .click();
    await onBoardingPage.waitForLoadState();
    await onBoardingPage
      .locator('(//div[@class="ant-segmented-group"]//div)[2]')
      .click();
    await onBoardingPage
      .locator('(//*[contains(text(),"New Workflow")])[1]')
      .click();
  }

  /**
   * Method to verify workflow condition
   * @param onBoardingPage
   */
  async verifyWorkflowCondition(onBoardingPage: Page) {
    const workflowOpt = await onBoardingPage.$$(
      '//div[@class="ant-steps-item-content"]//div',
    );
    for (let i = 0; i < workflowOpt.length; i++) {
      await workflowOpt[i].isVisible();
    }
    await onBoardingPage
      .locator('(//*[contains(text(),"Select a workflow condition")])[1]')
      .isVisible();
    await onBoardingPage
      .locator('(//*[contains(text(),"Priority")])[2]')
      .isVisible();
    await onBoardingPage
      .locator('(//div[@class="ant-select-selector"])[1]')
      .click();
    await onBoardingPage.locator('(//*[contains(text(),"Normal")])[1]').click();
    await onBoardingPage
      .locator('(//*[contains(text(),"Contact Stage:")])[1]')
      .isVisible();
    await onBoardingPage
      .locator('(//div[@class="ant-select-selector"])[2]')
      .click();
    await onBoardingPage
      .locator('(//*[contains(text(),"First Contact")])[1]')
      .click();
    await onBoardingPage
      .locator('(//*[contains(text(),"Request Created During:")])[1]')
      .isVisible();
    await onBoardingPage
      .locator('(//div[@class="ant-select-selector"])[3]')
      .click();
    await onBoardingPage
      .locator('(//*[contains(text(),"Any Time")])[2]')
      .click();
    await onBoardingPage.locator('//span[contains(text(),"Continue")]').click();

    await onBoardingPage
      .locator('//div[@class="ant-row ant-row-center ant-row-middle"]//h2')
      .isVisible();
    const timeInMints = await onBoardingPage.$$(
      '//div[@class="ant-col ant-col-8 d-flex justify-center align-center"]//button',
    );
    for (let i = 0; i < timeInMints.length; i++) {
      await timeInMints[i].isVisible();
    }
    await onBoardingPage
      .locator(
        '(//div[@class="ant-col ant-col-8 d-flex justify-center align-center"]//button)[2]',
      )
      .click();

    await onBoardingPage
      .locator('(//*[contains(text(),"Select an action to be performed")])[1]')
      .isVisible();
    await onBoardingPage
      .locator('(//div[@class="ant-select-selector"])[2]')
      .click();
    await onBoardingPage
      .locator('((//div[@class="ant-select-item-option-content"])[1]//span)[2]')
      .click();
  }

  /**
   * Method to verify workflow successfull message
   * @param onBoardingPage
   */
  async verifyWorkflowSuccessfullMessage(onBoardingPage: Page) {
    const reviewWorkflow = await onBoardingPage.$$(
      '//div[@class="ant-card-body"]',
    );
    for (let i = 0; i < reviewWorkflow.length; i++) {
      await reviewWorkflow[i].isVisible();
    }
    await onBoardingPage
      .locator('(//*[contains(text(),"Publish workflow")])[1]')
      .click();
    await onBoardingPage
      .locator(
        '(//*[contains(text(),"Workflow has been saved successfully")])[1]',
      )
      .isVisible();
  }

  /**
   * Method to verify ticket section configuration
   * @param onBoardingPage 
   * @param index 
   */
  async verifyTicketSectionConfiguration(onBoardingPage: Page, index: number) {
    await onBoardingPage.locator('//div[@title="Settings"]').click();
    await onBoardingPage.locator('(//span[@class="ant-collapse-header-text"])[7]').click();
    // await onBoardingPage.waitForTimeout(2000);
    //if (await onBoardingPage.locator('//span[@class="ant-switch-inner-checked"]').isChecked()) {
    // await onBoardingPage.locator('//span[@class="ant-switch-inner"]').isEnabled();
    //}
    //else if (!await onBoardingPage.locator('//span[@class="ant-switch-inner-unchecked"]').isChecked()) {
    if (await onBoardingPage.locator('(//span[@class="ant-switch-inner"])[7]').isVisible()) {
      await onBoardingPage.locator('(//span[@class="ant-switch-inner"])[7]').click();
    }
    //(//span[@class="ant-switch-inner"])[7]
    //}
    await onBoardingPage.locator('(//div[@class="ant-select-selector"])[4]').click();
    await onBoardingPage.locator('//div[contains(text(),"ClearFeed")]').click();
    await onBoardingPage.locator(`(//input[@class="ant-radio-input"])[${index}]`).click();
    await onBoardingPage.locator('(//input[@class="ant-radio-input"])[11]').click();
    await onBoardingPage.locator('(//button[@type="submit"])[7]').click();
    await onBoardingPage.locator('//div[@title="Requests"]').click();
  }

  /**
   * Method to verify comments from slack to web and reply the comments in web app
   * @param onBoardingPage 
   */
  async verifyCommentsFromSlckToWebApp(onBoardingPage: Page) {
    await onBoardingPage.reload();
    await onBoardingPage.locator('((//div[@class="ant-table-tbody-virtual-holder-inner"]//div)[1]//span)[1]').click();
    await onBoardingPage.locator('//div[@class="story_messageContent__Tugw2"]//p').last().isVisible();
    if (await onBoardingPage.locator('//div[@class="ql-editor ql-blank"]//p').isVisible()) {
      await onBoardingPage.locator('//div[@class="ql-editor ql-blank"]//p').isVisible();
      await onBoardingPage.locator('//div[@class="ql-editor ql-blank"]//p').fill('Done');
      await onBoardingPage.locator('((//div[@class="py-2 px-2 d-flex justify-end gap-2"])[2]//button)[2]//span').click();
      await onBoardingPage.locator('(//span[contains(text(),"Send")])[3]').click();
      // await page2.waitForTimeout(3000);
    }
    // else {
    //   console.log("Not visible");
    // }
    await onBoardingPage.locator('//button[@class="ant-btn ant-btn-default px-2 story_drawerCloseButton__cEe_Q"]').click();

  }

  async fechMessageId() {
    const response = await axios.get(
      `https://api.mailinator.com/v2/domains/igsteam704160.testinator.com/inboxes/${testData.inboxName}/?token=${testData.tokenKey}`,
      {
        headers: {
          "accept": "application/json",
        },
      },
    );
    this.messageID = response.data.msgs[0].id;
    console.log("Message ID", this.messageID)
  }

  async fetchOTP() {
    const response = await axios.get(
      `https://api.mailinator.com/v2/domains/igsteam704160.testinator.com/inboxes/${testData.inboxName}/messages/${this.messageID}/?token=${testData.tokenKey}`,
      {
        headers: {
          "accept": "application/json",
        },
      },
    );
    //this.messageID = response.data.subject;
    console.log("Subject", response.data.subject)
    let sub = response.data.subject;
    const parts = sub.split(' ');
    const otp = parts[parts.length - 1];
    console.log('otp', otp);
    return otp;
  }

  async fetchMagicLink() {
    const response = await axios.get(
      `https://api.mailinator.com/v2/domains/igsteam704160.testinator.com/inboxes/${testData.inboxName}/messages/${this.messageID}/links/?token=${testData.tokenKey}`,
      {
        headers: {
          "accept": "application/json",
        },
      },
    );
    this.magicLink = response.data.links[0];
  }

  /**
   * Method for delete account id
   * @param accountId
   * @param page
   * @param context
   */
  async deleteAccountAPI(
    accountId: string,
    page: Page,
    context: BrowserContext,
  ) {
    const webActions = new WebActions(page, context);
    const token = await webActions.decipherToken();
    const response = await axios.delete(
      envurl + `/super-admin/api/account/${accountId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    expect(response.status).toBe(200);
  }
}
