import { Page } from '@playwright/test';

import test from '@lib/BaseTest';
import { NewWorkspacePage } from '@pages/NewWorkspacePage';
import { OnboardingPage } from '@pages/OnboardingPage';

import testData from '../../Environment_variables/staging/onBoardingTestData.json' assert { type: 'json' };

test.describe('ClearFeed Onboarding E2E Tests', () => {
  let CFPage: Page;

  //Common Onboarding Steps
  const commonOnboardingSteps = async (
    onboardingPage: OnboardingPage,
    newWorkspacePage: NewWorkspacePage,
    supportType: string,
  ) => {
    CFPage = await onboardingPage.navigateToClearFeedApplictaion();
    await onboardingPage.loginToClearFeedWithMagicLink(CFPage);
    await onboardingPage.verifyHaveYouHerePage(
      CFPage,
      Number(testData.phone),
      testData.countryCode,
    );
    await onboardingPage.verifyGreatCompany(CFPage);
    await onboardingPage.verifyGloveSupportOpt(CFPage);
    await onboardingPage.verifyAuthorizeSlack(CFPage);
    await onboardingPage.verifySignInClearFeed(CFPage);
    await onboardingPage.verifyAccountSetUpByUsingExternalTools(CFPage);
    await onboardingPage.verifyAccountSetUp(CFPage, supportType);
    await onboardingPage.verifyCollection(CFPage);
    await onboardingPage.navigateBack(CFPage);
    await newWorkspacePage.againNavigateToCF();
    await onboardingPage.verifyYouAreAllSetPage(CFPage);
  };

  //Common Workflow Steps
  const commonWorkflowSteps = async (
    onboardingPage: OnboardingPage,
    requestChannelIndex: number,
  ) => {
    await onboardingPage.verifyWorkflow(CFPage);
    await onboardingPage.verifyWorkflowCondition(CFPage);
    await onboardingPage.verifyWorkflowSuccessfullMessage(CFPage);
    await onboardingPage.verifyCollectionSetting(CFPage);
    await onboardingPage.verifyRequestChannel(CFPage, requestChannelIndex);
  };

  test(
    'Verify Created Channel,Request,Workflow and Collection Settings Using Customer Support and Standalone helpdesk',
    { tag: '@Smoke' },
    async ({ newWorkspacePage, onboardingPage }) => {
      test.setTimeout(780000); // Set timeout to 780000 seconds for this test
      await test.step('Navigate to existing Slack workspace', async () => {
        await newWorkspacePage.loginToSlack();
      });
      await test.step('Navigate to ClearFeed application Using Magic link', async () => {
        await commonOnboardingSteps(
          onboardingPage,
          newWorkspacePage,
          testData.customerSupport,
        );
        await onboardingPage.verifyDashboardAndCreateRequest(CFPage);
        await commonWorkflowSteps(
          onboardingPage,
          testData.requestChannelInSettingAsCustomer,
        );
      });
      // await test.step('Creation of CF ticket from slack through Automatic ticketing', async () => {
      //   await onboardingPage.verifyTicketSectionConfiguration(CFPage, 10);
      //   await onboardingPage.navigateBack(CFPage);
      //   await newWorkspacePage.enterMessageInCreatedRequestChannel();
      //   await newWorkspacePage.verifyCommentsFromWebAppToSlack();
      //   await newWorkspacePage.againNavigateToCF();
      //   await onboardingPage.verifyCommentsFromSlckToWebApp(CFPage);
      //   // await onboardingPage.verifyTicketSectionConfiguration(CFPage, 1);
      //   // await onboardingPage.navigateBack(CFPage);
      //   // await newWorkspacePage.enterMessageInCreatedRequestChannel();
      //   // await newWorkspacePage.createTicketThroughEmoji();
      //   // await newWorkspacePage.againNavigateToCF();
      //   // await onboardingPage.verifyCommentsFromSlckToWebApp(CFPage);
      // });
      // await test.step('Creation of CF ticket from slack through Emoji', async () => {
      //   await onboardingPage.verifyTicketSectionConfiguration(CFPage, 9);
      //   await onboardingPage.navigateBack(CFPage);
      //   await newWorkspacePage.enterMessageInCreatedRequestChannel();
      //   await newWorkspacePage.createTicketThroughEmoji();
      //   await newWorkspacePage.againNavigateToCF();
      //   await onboardingPage.verifyCommentsFromSlckToWebApp(CFPage);
      // });
    },
  );

  test(
    'Verify Created Channel,Workflow and Collection Settings Using Employee Support and Standalone helpdesk',
    { tag: '@Smoke' },
    async ({ newWorkspacePage, onboardingPage }) => {
      test.setTimeout(780000); // Set timeout to 780000 seconds for this test
      await test.step('Navigate to existing Slack workspace', async () => {
        await newWorkspacePage.loginToSlack();
      });
      await test.step('Navigate to ClearFeed application Using Magic link', async () => {
        await commonOnboardingSteps(
          onboardingPage,
          newWorkspacePage,
          testData.employeeSupport,
        );
        await onboardingPage.clickOnCloseIcon(
          CFPage,
          testData.dashboardPopupCloseIconAsEmployee,
        );
        await commonWorkflowSteps(
          onboardingPage,
          testData.requestChannelInSettingAsEmployee,
        );
      });
    },
  );

  test.afterEach(async ({ page, context, onboardingPage }) => {
    let accountId: string | null = null;
    if (CFPage) {
      await CFPage.reload();
      accountId = await CFPage.evaluate(() => {
        return window.localStorage.getItem('accountId');
      });
    }
    console.log('Account ID:', accountId);
    if (accountId) {
      console.log('Deleting account with ID:', accountId);
      await onboardingPage.deleteAccountAPI(accountId, page, context);
      console.log('Account with ID', accountId, 'has been deleted.');
    } else {
      console.log('No accountId found, skipping user deletion.');
    }
  });
});
