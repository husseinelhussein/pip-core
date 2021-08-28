const google_validated = '1';
const google_failed = '2';
const smarty_street_failed = '4';
const smarty_street_validated = '8';
export const literals = {
    activityType: ['phone', 'meeting', 'email', 'note'],
    addressType: ['Home', 'Work', 'Other'],
    emailType: ['Personal', 'Work', 'Other'],
    contactType: ['All', 'Lead', 'Contact', 'Customer', 'Related person', 'Company', 'Organization'],
    prefix: ['Dr.', 'Miss', "Mr.", "Mrs.", "Ms.", "Prof."],
    suffix: ['Jr.', 'Sr.', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'],
    statementType: ['Paper', 'Electronic'],
    gender: ['Male', 'Female'],
    phoneNumberType: ['Home', 'Mobile', 'Work', 'Fax', 'Other'],
    socialLinkType: ['Facebook', 'Twitter', 'Linkedin'],
    priority: ['Low', 'Medium', 'High'],
    sendBefore: ['900', '1800', '2700', '3600', '7200', '86400'],
    callType: ['Talked', 'Left a Message', 'No Answer'],
    location: ['Headquarters', 'Regional office'],
    accountType: ['Individual, Joint & Sole Proprietorship Account', 'Partnership Account', 'Managed Futures Account', 'Corporate Account', 'Limited Liability Company', 'RPM Customer'],
    onboardStatus: ['0', '1', '2'],
    fileType: ['Account Paperwork', 'ACH Authorization form and Voided Check', 'Additional Risk Disclosure', 'Partnership Agreement', 'By Laws', 'Operating Agreement', 'Beneficial Owners', 'Balance Sheet', 'Articles of Organization', 'RPM Power of Attorney', 'RPM Paperwork'],
    documentStatus: ['requested', 'received', 'approved', 'rejected'],
    postalAddressStatus: [google_validated, google_failed, smarty_street_validated, smarty_street_failed],
};


export type ActivityType = 'phone'|'meeting'|'email'|'note';
export type AddressType = 'Home'|'Work'|'Other';
export type EmailType = 'Personal'|'Work'|'Other';
export type ContactType = 'All'|'Lead'|'Contact'|'Customer'|'Related person'|'Company'|'Organization';
export type Prefix = 'Dr.'|'Miss'|"Mr."|"Mrs."|"Ms."|"Prof.";
export type Suffix = 'Jr.'|'Sr.'|'I'|'II'|'III'|'IV'|'V'|'VI'|'VII'|'VIII'|'IX'|'X';
export type StatementType = 'Paper'|'Electronic';
export type Gender = 'Male'|'Female';
export type PhoneNumberType = 'Home'|'Mobile'|'Work'|'Fax'|'Other';
export type SocialLinkType = 'Facebook'|'Twitter'|'Linkedin';
export type Priority = 'Low'|'Medium'|'High';
export type SendBefore = 900|1800|2700|3600|7200|86400;
export type CallType = 'Talked'|'Left a Message'|'No Answer';
export type Location = 'Headquarters' | 'Regional office';
export type AccountType = 'Individual, Joint & Sole Proprietorship Account' | 'Partnership Account' | 'Managed Futures Account' | 'Corporate Account' | 'Limited Liability Company' | 'RPM Customer';
export type OnboardStatus = 0 | 1 | 2;
export type FileType = 'Account Paperwork' | 'ACH Authorization form and Voided Check' | 'Additional Risk Disclosure' | 'Partnership Agreement' | 'By Laws' | 'Operating Agreement' | 'Beneficial Owners' | 'Balance Sheet' | 'Articles of Organization' | 'RPM Power of Attorney' | 'RPM Paperwork';
export type DocumentStatus = 'requested' | 'received' | 'approved' | 'rejected';
export type PostalAddressStatus = 1 | 2 | 4 | 8;