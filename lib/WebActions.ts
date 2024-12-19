import { randomInt } from 'crypto';

import { BrowserContext } from '@playwright/test';
import type { Page } from '@playwright/test';
import * as cheerio from 'cheerio';
import CryptoJS from 'crypto-js';
import MailSlurp from 'mailslurp-client';
import axios from 'axios';

import qaTestData from '../Environment_variables/staging/onBoardingTestData.json';

const testData = qaTestData;

let mailslurp: MailSlurp;
let inboxId: string;

export class WebActions {
  private messageID: string;
  readonly page: Page;
  readonly context: BrowserContext;

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
  }

  /**
   * Method for decrypt password
   * @param password
   * @returns
   */
  async decipherPassword(password: string): Promise<string> {
    const key = 'SECRET';
    return CryptoJS.AES.decrypt(password, key).toString(CryptoJS.enc.Utf8);
  }

  /**
   * Method for decrypt token
   * @returns
   */
  async decipherToken(): Promise<string> {
    const key = 'SECRET';
    const bytes = CryptoJS.AES.decrypt(testData.token, key);
    const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedToken;
  }

  /**
   * Method to generate random string
   * @param length
   * @returns
   */
  async generateRandomString(length: number) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      const randomIndex = randomValues[i] % charactersLength;
      result += characters[randomIndex];
    }
    return result;
  }

  /**
   * Method to generate random number
   * @param min
   * @param max
   * @returns
   */
  async getCryptoRandomNumber(min: number, max: number): Promise<number> {
    return randomInt(min, max + 1);
  }

  /**
   * Method to create Mailslurp inbox
   */
  async createMailslurpInbox() {
    mailslurp = new MailSlurp({ apiKey: testData.apiKey });
    const customEmail = testData.userEmail;
    const createdinbox = await mailslurp.createInbox(customEmail);
    inboxId = createdinbox.id;
  }

  /**
   * Method to extract link from inbox
   * @returns
   */
  async extractLink() {
    const inbox = await mailslurp.waitForLatestEmail(inboxId, 10000);
    const loc = cheerio.load(inbox.body);
    const link = loc('a').attr('href');
    return link;
  }

  /**
   * Method to delete inbox
   */
  async deleteInbox() {
    await mailslurp.deleteInbox(inboxId);
  }

  /**
   * Mathod to extract OTP
   * @returns
   */
  async extractOTP() {
    const inbox = await mailslurp.waitForLatestEmail(inboxId, 10000);
    const parts = inbox.subject.split(' ');
    const otp = parts[parts.length - 1];
    return otp;
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
    let subject = response.data.subject;
    const parts = subject.split(' ');
    const otp = parts[parts.length - 1];
    return otp;
  }

  async fetchMagicLink() {
    await this.fechMessageId();
    const response = await axios.get(
      `https://api.mailinator.com/v2/domains/igsteam704160.testinator.com/inboxes/${testData.inboxName}/messages/${this.messageID}/links/?token=${testData.tokenKey}`,
      {
        headers: {
          "accept": "application/json",
        },
      },
    );
    const magicLink = response.data.links[0];
    return magicLink
  }
}
