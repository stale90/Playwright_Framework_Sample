import { test } from "../../fixtures/NewRegistrationFixture";
import { Helper } from "../../reusable/Helper";
import { TestData } from "../../data/TestData";
import { RskNewFormType } from "../../types/ExcelDataTypes";

const testData = TestData.getData<RskNewFormType>('RskPsyNewForm');

test.describe("RSK New Form module - @regression", () => {
  for (const data of testData) {
    if (data.run !== "yes")
      continue;
    //console.log(data);

    // Test Initiated for each Excel Row
    test(`${data.test_id} - ${data.test_desc}`, async ({ page, report, pages }) => {
      //Pre Data Processing 
      await Helper.refineInputTestData(data);
      await Helper.prepareInitialReport(report, data);
      
      //Step 1
      await test.step('New Form : Navigate to RSK Registration Form', async () => {
        await Helper.navigateToRegistrationForm(page, pages);
      });
      
      //Step 2
      await test.step('New Form : fill New Application Form', async () => {
        await Helper.fillCompleteForm(page, pages, data, report);
      });
      //Step 3
      await test.step('New Form : Upload Required Documents', async () => {
        await Helper.uploadRequiredDocuments(pages, data);
      });
      //Step 4
      await test.step('New Form : Complete Payment Process', async () => {
       await Helper.completePaymentProcess(pages, data, report);
      });
      
      //Step 5
      await test.step('New Form : Validate Payment Receipt', async () => {
        await Helper.validatePaymentReceipt(pages, data, report);
      });

      if (data.scenario !== 'REGISTRATION'){
        //Step 6
      await test.step(`Validate Other Feature : ${data.scenario}`, async () => {
        await Helper.validateOtherFeatures(page, pages, data, report);
      });
      }
      
      //await page.pause();
    });
  }
});