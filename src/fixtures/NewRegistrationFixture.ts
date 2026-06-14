import { test as base } from '@playwright/test';
import { ReportToExcel } from '../types/ExcelDataTypes';
import { Logger } from '../reusable/Logger';
import { ExcelUtility } from '../reusable/ExcelUtility';

import { MainFormPage } from '../pages/rsk/MainFormPage';
import { PreFormDetailsPage } from '../pages/rsk/PreFormDetailsPage';
import { PersonalDetailsPage } from '../pages/rsk/PersonalDetailsPage';
import { DomicileDetailsPage } from '../pages/rsk/DomicileDetailsPage';
import { ExperienceDetailsPage } from '../pages/rsk/ExperienceDetailsPage';
import { EducationDetailsPage } from '../pages/rsk/EducationDetailsPage';
import { AddressDetailsPage } from '../pages/rsk/AddressDetailsPage';
import { UploadDocumentPage } from '../pages/rsk/UploadDocumentPage';
import { ReceiptPage } from '../pages/rsk/ReceiptPage';
import { Pages } from '../types/CustomTypes';
import { OtherFeaturePage } from '../pages/rsk/OtherFeaturePage';

const reportHeader = [
    { key: 'test_id', label: 'Test ID' },
    { key: 'test_desc', label: 'Test Desc' },
    { key: 'scenario', label: 'Scenario' },
    { key: 'name', label: 'Name' },
    { key: 'mobile_no', label: 'Mobile No' },
    { key: 'email', label: 'Email' },
    { key: 'dob', label: 'Dob' },
    { key: 'application_id', label: 'Application Id' },
    { key: 'reference_id_1', label: 'Reference Id 1' },
    { key: 'reference_id_2', label: 'Reference Id 2' },
    { key: 'application_fee', label: 'Application Fee' },
    { key: 'pay_status', label: 'Pay Status' },
    { key: 'transaction_id_1', label: 'Transaction Id 1' },
    { key: 'transaction_id_2', label: 'Transaction Id 2' },
    { key: 'password', label: 'Password' },
    { key: 'test_status', label: 'Test Status' }
] as const;

export const test = base.extend<{
    pages: Pages;
    report: ReportToExcel;
}>({

    pages: async ({ page }, use) => {
        await use({
            mainForm: new MainFormPage(page),
            preForm: new PreFormDetailsPage(page),
            personal: new PersonalDetailsPage(page),
            domicile: new DomicileDetailsPage(page),
            experience: new ExperienceDetailsPage(page),
            education: new EducationDetailsPage(page),
            address: new AddressDetailsPage(page),
            upload: new UploadDocumentPage(page),
            receipt: new ReceiptPage(page),
            otherFeature:new OtherFeaturePage(page),
        });
    },

    report: async ({ }, use, testInfo) => {
        const report = createEmptyReport();
        const filepath = await ExcelUtility.getFilePath('Registration');
        const sheetName = 'TestResults';
        //Your Test run Below
        await use(report);
        // afterEach equivalent
        Logger.info('Test Status :' + testInfo.status);
        let status = "UNKNOWN";
        if (testInfo.status === "passed") status = "PASS";
        if (testInfo.status === "failed") status = "FAIL";
        if (testInfo.status === "skipped") status = "SKIP";
        report.test_status = status;
        await ExcelUtility.writeEachRowToExcel<ReportToExcel>(
            filepath,
            sheetName, 
            reportHeader, 
            report
        );
    },

});


// Initialise Reporter
export function createEmptyReport(): ReportToExcel {
    const emptyReport = {} as ReportToExcel;

    reportHeader.forEach(({ key }) => {
        emptyReport[key as keyof ReportToExcel] = 'Default';
    });

    return emptyReport;
}
