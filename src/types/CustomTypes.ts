import { Browser, BrowserContext, Page } from "@playwright/test";
import { MainFormPage } from "../pages/rsk/MainFormPage";
import { PreFormDetailsPage } from "../pages/rsk/PreFormDetailsPage";
import { PersonalDetailsPage } from "../pages/rsk/PersonalDetailsPage";
import { DomicileDetailsPage } from "../pages/rsk/DomicileDetailsPage";
import { ExperienceDetailsPage } from "../pages/rsk/ExperienceDetailsPage";
import { EducationDetailsPage } from "../pages/rsk/EducationDetailsPage";
import { AddressDetailsPage } from "../pages/rsk/AddressDetailsPage";
import { ReceiptPage } from "../pages/rsk/ReceiptPage";
import { UploadDocumentPage } from "../pages/rsk/UploadDocumentPage";
import { OtherFeaturePage } from "../pages/rsk/OtherFeaturePage";

export interface ProjectConfig {
  name: string;
  use: any;
}

export interface TestCase {
  testId: string;
  testDesc: string;
}

export type FrameworkFixtures = {
  page: Page;
  context: BrowserContext;
  browser: Browser;
};

export interface BrowserConfig {
  headless?: boolean;
  slowMo?: number;
}

export type Pages = {
  mainForm: MainFormPage;
  preForm: PreFormDetailsPage;
  personal: PersonalDetailsPage;
  domicile: DomicileDetailsPage;
  experience: ExperienceDetailsPage;
  education: EducationDetailsPage;
  address: AddressDetailsPage;
  upload: UploadDocumentPage;
  receipt: ReceiptPage;
  otherFeature: OtherFeaturePage;
};

