import { test as base } from '@playwright/test';
import { ValidateInputDataType, ValidateReportType, ValidateWOScenarioType } from '../types/ExcelDataTypes';
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
import { TestData } from '../data/TestData';
import { OtherFeaturePage } from '../pages/rsk/OtherFeaturePage';

export const test = base.extend<{
    dataMap: Record<string, ValidateWOScenarioType>;
    pages: Pages;

}>({
    dataMap: async ({ }, use) => {
        const testData = TestData.getData<ValidateInputDataType>('RskPsyFormValidation');
        const dataMap = TestData.createScenarioMap(testData);
        const filepath = await ExcelUtility.getFilePath('Validation');
        const sheetName = 'TestResults';
        
        // Test runs
        await use(dataMap);
        
        // Convert Record → Array
        const dataArray = await convertRecordToArray(dataMap);
        ExcelUtility.writeExcelAtOnce<ValidateReportType>(
            filepath, 
            sheetName, 
            header, 
            dataArray
        );
    },

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
            otherFeature: new OtherFeaturePage(page),
        });
    },
});


const header = [
    { key: 'test_id', label: 'Test ID' },
    { key: 'test_desc', label: 'Test Desc' },
    { key: 'test_comment', label: 'Test Comment' },
    { key: 'scenario', label: 'Scenario' },
    { key: 'valid_input', label: 'Valid Input' },
    { key: 'alert_error_message', label: 'Expected Messages' },
    { key: 'actual_error_message', label: 'Actual Messages' },
    { key: 'test_status', label: 'Test Status' }
] as const;


async function convertRecordToArray(dataMap: Record<string, ValidateWOScenarioType>) {
    const dataArray = [];
    for (const key in dataMap) {
        dataArray.push({
            scenario: key,
            ...dataMap[key]
        });
    }
    return dataArray;
}
