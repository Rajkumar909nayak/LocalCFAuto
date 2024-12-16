import { Page, BrowserContext, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly context: BrowserContext;
  readonly continueWithGoogle: Locator;
  readonly continueWithMicrosoft: Locator;
  readonly continueWithSAML: Locator;
  readonly emailEditField: Locator;
  readonly gmailIdTextField: Locator;
  readonly nextButton: Locator;
  readonly passwordTextField: Locator;
  readonly clearfeedScreen: Locator;

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;

    // Initialize locators
    this.continueWithGoogle = page.locator(
      '//*[contains(text(),"Continue with Google")]',
    );
    this.continueWithMicrosoft = page.locator(
      '//*[contains(text(),"Continue with Microsoft")]',
    );
    this.continueWithSAML = page.locator(
      '//*[contains(text(),"Continue with SAML SSO")]',
    );
    this.emailEditField = page.locator(
      '//*[contains(@class,"login_accountNameInput")]',
    );
    this.gmailIdTextField = page.locator('//input[@id="identifierId"]');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.passwordTextField = page.locator('//input[@name="Passwd"]');
    this.clearfeedScreen = page.locator('//a//span[text()="Inbox"]');
  }

  /**Method to navigate application page */
  async navigateToURL(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Method to Google Login Page
   * @returns
   */
  async switchToGoogleLoginPage() {
    const [newPage] = await Promise.all([
      this.context.waitForEvent('page'),
      await this.continueWithGoogle.click(),
    ]);
    await newPage.waitForLoadState();
    return new exports.LoginPage(newPage);
  }

  /**
   * Method to navigate to enter Google Login Credential
   * @param email
   * @param password
   */
  async loginWithGoogle(email: string, password: string): Promise<void> {
    await this.page.waitForLoadState();
    await this.gmailIdTextField.fill(email);
    await this.nextButton.click();
    await this.passwordTextField.waitFor({ state: 'visible', timeout: 20000 });
    await this.passwordTextField.fill(password);
    await this.nextButton.click();
  }

  /**
   * Method to verify Google Login as an existing user
   */
  async verifyGoogleLogin(): Promise<void> {
    await expect(this.clearfeedScreen).toBeVisible({ timeout: 50000 });
  }
}
