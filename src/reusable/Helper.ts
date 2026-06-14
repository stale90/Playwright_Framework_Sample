import test, { Page } from "@playwright/test";
import { Pages } from "../types/CustomTypes";
import { Actions } from "./Actions";
import { Logger } from "./Logger";
import { ReportToExcel, RskNewFormType, ValidateWOScenarioType } from "../types/ExcelDataTypes";
import { TestData } from "../data/TestData";
import { GlobalConfig } from "../config/PlaywrightConfig";


export class Helper {

  // Navigate to Web URL
  static async launchApplication(page: Page, url: string) {
    await Actions.navigateTo(page, url);
  }

  // refine Test Data with unique rollno, mobileno and email id
  static async refineInputTestData(data: RskNewFormType) {
    data.roll_no_10th = await TestData.getUnique10thRollNumber();
    data.roll_no_12th = await TestData.getUnique12thRollNumber();
    data.degree_roll_no = await TestData.getUniqueUGRollNumber();
    data.mobile_no = await TestData.getUniqueMobileNumber();
    data.email_id = await TestData.getUniqueEmailID();
    if (data.scenario === 'PAY_UNPAID')
      data.payment_status = 'fail';
    if(data.scenario === 'EDIT_PAID')
      data.payment_status = 'first';
  }

  // Prepare Initial Report data
  static async prepareInitialReport(report: ReportToExcel, data: RskNewFormType) {
    report.test_id = data.test_id;
    report.test_desc = data.test_desc;
    report.scenario = data.scenario;
    report.name = data.first_name + " " + data.last_name;
    report.mobile_no = data.mobile_no;
    report.email = data.email_id;
    report.dob = data.dob;
    if(data.scenario !== 'EDIT_PAID'){
        report.transaction_id_1 = 'NA';
        report.reference_id_1 = 'NA';
    }
     
  }

  // Navigate to Web URL
  static async navigateToRegistrationForm(page: Page, pages: Pages) {
    await Helper.launchApplication(page, GlobalConfig.TEST_URL);
    await pages.preForm.navigateToForm();
    await pages.mainForm.openApplicationForm();
  }

  // Navigate to Web URL
  static async fillCompleteForm(page: Page, pages: Pages, data: RskNewFormType, report: ReportToExcel) {
    try {
      await test.step(`New Form : Fill Course Details`, async () => {
        await pages.mainForm.selectCousellingCourse(data);
      });

      await test.step(`New Form : Fill Personal Details`, async () => {
        await pages.personal.fillPersonalDetails(data);
      });

      await test.step(`New Form : Fill Domicile Details`, async () => {
        await pages.domicile.fillDomicileDetails(data);
      });

      await test.step(`New Form : Fill Experience Details`, async () => {
        await pages.experience.fillExperienceDetails(data);
      });

      await test.step(`New Form : Fill Education Details`, async () => {
        await pages.education.fillEducationDetails(data);
      });

      await test.step(`New Form : Fill Address Details`, async () => {
        await pages.address.fillAddressDetails(data);
      });
      await page.pause();

      await test.step(`New Form : Upload Photo Details`, async () => {
        await pages.upload.uploadPhoto(data);
      });

      await test.step(`New Form : Proceed to Save & Next`, async () => {
        await pages.mainForm.checkUserConsent(data);
        //await page.pause();
        report.application_id = await pages.mainForm.saveAndGetAppID();
      });
      return report;
 
    } catch (error) {
      Logger.throwException('Helper : Exception occured while filling Complete Form', error);
      throw error;
    }
  }

  static async uploadRequiredDocuments(pages: Pages, data: RskNewFormType) {
    await test.step(`New Form : Upload Document and Submit`, async () => {
      await pages.upload.uploadAllDocuments(data);
    });
  }

  static async completePaymentProcess(
    pages: Pages,
    data: RskNewFormType,
    report: ReportToExcel
  ) {
    await test.step(`New Form : Click Validate Form and Get Verification Code`, async () => {
      const verificationCode = await pages.mainForm.validateFormAndGetCode();
      await pages.mainForm.proceedForPayment(verificationCode.code);
    });
    await test.step(`New Form : Verify Payment Details & Complete Payment`, async () => {
      await pages.mainForm.verifyPaymentDetails(data, report);
    });
  }

  static async validatePaymentReceipt(pages: Pages, data: RskNewFormType, report: ReportToExcel) {
    await test.step(`Application Receipt : Verify Receipt data`, async () => {
      if (report.pay_status === 'Yes') {
        await pages.receipt.getReceiptTransactionID(data, report);
        await pages.receipt.verifyPaymentReceiptData(data, report);
      } else {
        await Actions.addStepMessage('No Application Receipt as Payment Status : Failed');
      }
    });
  }

  static async performFieldValidation(pages: Pages,
    dataMap: Record<string, ValidateWOScenarioType>) {
    await test.step(`Input Validation : Personal Info Section`, async () => {
      await pages.personal.personalFieldValidation(dataMap);
    });
    await test.step(`Input Validation : Domicile Info Section`, async () => {
      await pages.domicile.validateDomicileFields(dataMap);
    });
    await test.step(`Input Validation : Experience Info Section`, async () => {
      await pages.experience.validateExperienceFields(dataMap);
    });
    await test.step(`Input Validation : Education Info Section`, async () => {
      await pages.education.validateEducationFields(dataMap);
    });
    await test.step(`Input Validation : Address Info Section`, async () => {
      await pages.address.validateAddressFields(dataMap);
    });
  }

  static async validateOtherFeatures(page: Page, pages: Pages, data: RskNewFormType, report: ReportToExcel) {
    switch (data.scenario.toLowerCase()) {
      case 'registration':
        await test.step('Payment Receipt already validated', async () => {
          // No action Required.
        });
        break;
      case 'duplicate_receipt':
        await test.step('Verify Duplicate/Reprint Receipt', async () => {
          await Helper.verifyDuplicateReceipt(page, pages, data, report);
        });
        break;
      case 'reset_password':
        await test.step('Reset Profile Password', async () => {
          await Helper.verifyResetPassword(page, pages, data, report);
        });
        break;
      case 'pay_unpaid':
        await test.step('Verify payment for unpaid registration', async () => {
          data.payment_status = 'success';
          await Helper.verifyPayUnpaid(page, pages, data, report);
        });
        break;
      case 'edit_paid':
       await test.step('Generate User Password', async () => {
          await Helper.verifyResetPassword(page, pages, data, report);
        }); 
      await test.step('Verify edit registration form', async () => {
          data.payment_status = 'second';
          await Helper.verifyEditpaid(page, pages, data, report);
        });
        break;
      case 'registration_cancel':
        await test.step('Generate User Password', async () => {
          await Helper.verifyResetPassword(page, pages, data, report);
        });
        await test.step('Verify Registration Cancellation', async () => {
          await Helper.verifyRegisterationCancel(page, pages, data, report);
        });
        break;
      default:
        throw new Error("Framework Exception occurs");
    }
  }

  static async verifyDuplicateReceipt(page: Page, pages: Pages, data: RskNewFormType, report: ReportToExcel) {
    await Helper.launchApplication(page, GlobalConfig.TEST_URL);
    await pages.preForm.navigateToDuplicateReceipt();
    await pages.otherFeature.fillDuplicateReceiptform(report);
    await pages.receipt.verifyPaymentReceiptData(data, report);
  }

  static async verifyResetPassword(page: Page, pages: Pages, data: RskNewFormType, report: ReportToExcel) {
    await Helper.launchApplication(page, GlobalConfig.TEST_URL);
    await pages.preForm.navigateToResetPassword();
    await pages.otherFeature.resetPassword(report);
  }

  static async verifyPayUnpaid(page: Page, pages: Pages, data: RskNewFormType, report: ReportToExcel) {
    await Helper.launchApplication(page, GlobalConfig.TEST_URL);
    await pages.preForm.navigateToPayUnpaid();
    await pages.otherFeature.fillPayUnpaidform(report);
    await pages.mainForm.checkUserConsent(data);
    await page.pause();
    await pages.mainForm.saveChanges();
    await Helper.completePaymentProcess(pages, data, report);
    await Helper.validatePaymentReceipt(pages, data, report);
  }

  static async verifyRegisterationCancel(page: Page, pages: Pages, data: RskNewFormType, report: ReportToExcel) {
    await Helper.launchApplication(page, GlobalConfig.TEST_URL);
    await pages.preForm.navigateToRegistrationCancel();
    await pages.otherFeature.fillRegisterationCancelForm(report, data);
  }

  static async verifyEditpaid(page: Page, pages: Pages, data: RskNewFormType, report: ReportToExcel) {
    await Helper.launchApplication(page, GlobalConfig.TEST_URL);
    await pages.preForm.navigateToEditForm();
    await pages.otherFeature.fillEditAuthenticationForm(report);
    await Helper.EditApplicationForm(pages, data);
    await pages.mainForm.checkUserConsent(data);
    //await page.pause();
    await pages.mainForm.saveChanges();
    await Helper.uploadRequiredDocuments(pages, data);
    await Helper.completePaymentProcess(pages, data, report);
    await Helper.validatePaymentReceipt(pages, data, report);
  }

  static async EditApplicationForm(pages: Pages, data: RskNewFormType) {   
    const editCase = data.edit_case.toUpperCase(); 
    
    switch (editCase) {
      case 'UR_TO_OBC':
        await TestData.UR_To_OBC_Gov_Dom_PH(data);  
      break;
      case 'UR_TO_EWS':
        await TestData.UR_To_EWS_Dom_PH(data);  
      break;
      case 'OBC_TO_UR':
        await TestData.OBC_To_UR_Gov_Dom_PH(data);  
      break;
      case 'OBC_TO_EWS':
        await TestData.OBC_To_EWS_Gov_Dom_PH(data);  
      break;
      case 'OBC_TO_UR_GN':
        await TestData.OBC_Gov_PH_Dom_To_UR(data);  
      break;
      
      default:
        throw new Error("Framework Exception occurs");  
    }
    await test.step(`New Form : Fill Domicile Details`, async () => {
        await pages.domicile.fillDomicileDetails(data);
      });

      await test.step(`New Form : Fill Experience Details`, async () => {
        await pages.experience.fillExperienceDetails(data);
      });

      await test.step(`New Form : Fill Education Details`, async () => {
        await pages.education.fillEducationDetails(data);
      });

      await test.step(`New Form : Fill Address Details`, async () => {
        await pages.address.fillAddressDetails(data);
      });

      await test.step(`New Form : Upload Photo Details`, async () => {
        await pages.upload.uploadPhoto(data);
      });
  }

}