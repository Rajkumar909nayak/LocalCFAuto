import { TestInfo, test as baseTest } from '@playwright/test';

import { WebActions } from '@lib/WebActions';
import { LoginPage } from '@pages/LoginPage';
import { NewWorkspacePage } from '@pages/NewWorkspacePage';
import { OnboardingPage } from '@pages/OnboardingPage';

const test = baseTest.extend<{
  webActions: WebActions;
  loginPage: LoginPage;
  onboardingPage: OnboardingPage;
  newWorkspacePage: NewWorkspacePage;
  testInfo: TestInfo;
}>({
  webActions: async ({ page, context }, use) => {
    await use(new WebActions(page, context));
  },
  loginPage: async ({ page, context }, use) => {
    await use(new LoginPage(page, context));
  },
  onboardingPage: async ({ page, context }, use) => {
    await use(new OnboardingPage(page, context));
  },
  newWorkspacePage: async ({ page, context }, use) => {
    await use(new NewWorkspacePage(page, context));
  },
});

export default test;
