import test from '@lib/BaseTest';

import testData from '../../Environment_variables/staging/onBoardingTestData.json';

test.describe('ClearFeed Login Tests', () => {
  test.skip(
    'Verify Login Page',
    { tag: '@Smoke' },
    async ({ loginPage, webActions }) => {
      await test.step('Navigate to Application', async () => {
        await loginPage.navigateToURL();
      });
      await test.step('Enter gmail and password', async () => {
        const newtab = await loginPage.switchToGoogleLoginPage();

        await newtab.loginWithGoogle(
          testData.existingUserEmail,
          await webActions.decipherPassword(testData.sandBoxPassword),
        );
      });
      await test.step('Verify if ClearFeed Home Page is displayed using Google Login', async () => {
        await loginPage.verifyGoogleLogin();
      });
    },
  );
});
