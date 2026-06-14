import { test } from "../../fixtures/ValidationTestFixture";
import { Helper } from "../../reusable/Helper";

test(`Verify Input validations`, async ({ page, pages, dataMap }) => {

  //Step 1
  await test.step('New Form : Navigate to Application Form', async () => {
    await Helper.navigateToRegistrationForm(page, pages);
  });
  //Step 2
  await test.step('Validate Input Fields', async () => {
    await Helper.performFieldValidation(pages, dataMap);
  });
  //await page.pause();
});