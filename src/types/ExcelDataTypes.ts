
// Custom DataType for sheet : loginData
export interface LoginType {
    run: string;
    test_id: string;
    test_desc: string;
    user_name: string;
    password: string;
    scenario: string; 
    comment: string;
}

// Custom DataType for sheet : rskNewApplication
export interface RskNewFormType extends AddressDetailsType, 
                                        PersonalDetailsType,
                                        ExperienceDetailsType,
                                        EducationDetailsType,
                                        UploadDocumentType,
                                        DomicileDetailsType{
    run: string;
    test_id: string;
    test_desc: string;
    test_tag:string;
    test_comment: string;
    scenario: string;
    edit_case:string;
    course_applied_for: string;
    consent_status: string;
    application_fee: string;
    payment_status:string;

}

export interface PersonalDetailsType {
    first_name: string;
    middle_name: string;
    last_name: string;
    gender_status: string;
    marital_status: string;
    widow_status: string;
    father_name: string;
    mother_name: string;
    dob: string;
    religion: string;
}

export interface AddressDetailsType {
    house_no: string;
    landmark: string;
    city_name: string;
    state_name: string;
    district_name: string;
    tehsil_name: string;
    mobile_no: string;
    email_id: string;
    pincode: string;
}

export interface DomicileDetailsType {
    domicile_state: string;
    domicile_certificate: string;
    dom_no: string;
    dom_date: string;
    dom_place: string;
    dom_designation: string;
    dom_other_designation: string;

    category: string;
    cast_certificate_no: string;
    cast_issue_date: string;
    cast_cert_place: string;
    cast_cert_designation: string;
    is_ex_sainik: string;
    is_ex_freedom_fighter: string;
    is_disability_40per: string;
    disability_type: string;
}

export interface ExperienceDetailsType {
    is_gov_teacher: string;
    vibhag_name: string;
    designation_name: string;
    school_name: string;
    admission_date: string;
    work_district: string;
    school_dice_no: string;
}

export interface EducationDetailsType {
    // 10th Details
    year_10th: string;
    result_type_10th: string;
    obtain_marks_10th: string;
    outof_marks_10th: string;
    percent_10th: string;
    grade_10th: string;
    board_10th: string;
    roll_no_10th: string;
    // 12th Details
    subject_12th: string;
    year_12th: string;
    result_type_12th: string;
    obtain_marks_12th: string;
    outof_marks_12th: string;
    percent_12th: string;
    grade_12th: string;
    board_12th: string;
    roll_no_12th: string;
    // Graduation Details
    degree_name: string;
    degree_year: string;
    degree_percentage: string;
    degree_board: string;
    degree_roll_no: string;
}

export interface UploadDocumentType {
    // Upload Documents
    upload_photo: string;
    upload_10th_cert: string;
    upload_12th_cert: string;
    upload_ug_cert: string;
    upload_pg_cert: string;
    upload_dom_cert: string;
    upload_cast_cert: string;
    upload_income_cert: string;
    upload_handi_cert: string; 
    upload_ews_cert: string;  
}							

export interface ReportToExcel {
  test_id: string;
  test_desc: string;
  scenario: string;
  name: string;
  mobile_no: string;
  email: string;
  dob: string;
  application_id: string;
  reference_id_1:string;
  reference_id_2: string;
  password:string;
  application_fee: string;
  pay_status: string;
  transaction_id_1: string;
  transaction_id_2: string;
  test_status: string;
}

export interface ValidateInputDataType{
  test_id: string;
  test_desc: string; 
  test_comment: string;
  scenario:string;
  valid_input: string;
  alert_error_message: string;
  test_status:string;
}

export interface ValidateReportType{
  test_id: string;
  test_desc: string; 
  test_comment: string;
  scenario:string;
  valid_input: string;
  alert_error_message: string;
  actual_error_message:string;
  test_status:string;
}


export interface ValidateWOScenarioType {
  test_id: string;
  test_desc: string;
  test_comment: string;
  valid_input: string;
  alert_error_message: string;
  actual_error_message:string;
  test_status: string;
}

