export interface EnquiryType {
  id: number;

  // Basic Info
  studentName: string;
  courses: string;

  // Contact
  mobileNumber?: string;

  // Enquiry Details
  branch?: string;
  enquiryMethod?: string;
  source?: string;
  status?: string;
  enquiryDate?: string;
  enquiryTime?: string;

  // Optional
  remark?: string;
}
