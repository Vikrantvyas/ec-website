"use client";

import { useState } from "react";
import EnqMainPanel from "../../components/admin/enquiry/EnqMainPanel";
import EnqSidebar from "../../components/admin/enquiry/EnqSidebar";
import { EnquiryType } from "../../components/admin/enquiry/types";

export default function EnquiryPage() {
  const [enquiries, setEnquiries] = useState<EnquiryType[]>([]);
  const [selectedLead, setSelectedLead] = useState<EnquiryType | null>(null);
  const [isNewEnquiry, setIsNewEnquiry] = useState(true);

  const handleAddEnquiry = (data: any) => {
    const newEntry: EnquiryType = {
      id: Date.now(),
      studentName: data.studentName || "",
      courses: data.courses || "",
      mobileNumber: data.mobileNumber || "",
      branch: data.branch || "",
      enquiryMethod: data.enquiryMethod || "",
      source: data.source || "",
      status: data.status || "",
      enquiryDate: data.enquiryDate || "",
      enquiryTime: data.enquiryTime || "",
      remark: data.remark || "",
    };

    setEnquiries((prev) => [newEntry, ...prev]);
    setSelectedLead(newEntry);
    setIsNewEnquiry(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#f1f3f6] -m-6">
      <EnqSidebar
        enquiries={enquiries}
        onSelectEnquiry={(enq) => {
          setSelectedLead(enq);
          setIsNewEnquiry(false);
        }}
        onNewEnquiry={() => {
          setIsNewEnquiry(true);
          setSelectedLead(null);
        }}
      />

      <div className="flex-1 h-full">
        <EnqMainPanel
          selectedStudent={selectedLead}
          isNewEnquiry={isNewEnquiry}
          onAddEnquiry={handleAddEnquiry}
        />
      </div>
    </div>
  );
}
