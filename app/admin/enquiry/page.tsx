"use client";

import { useState } from "react";
import EnqMainPanel from "../../components/admin/enquiry/EnqMainPanel";
import EnqSidebar from "../../components/admin/enquiry/EnqSidebar";

export interface EnquiryType {
  id: number;
  studentName: string;
  mobileNumber?: string;
  branch?: string;
  enquiryMethod?: string;
  source?: string;
  status?: string;
  enquiryDate?: string;
  enquiryTime?: string;
  remark?: string;
}

export default function EnquiryPage() {
  const [enquiries, setEnquiries] = useState<EnquiryType[]>([]);
  const [selectedLead, setSelectedLead] = useState<EnquiryType | null>(null);
  const [isNewEnquiry, setIsNewEnquiry] = useState(true);

  // 🔥 Add new enquiry (Latest on top)
  const handleAddEnquiry = (data: EnquiryType) => {
    const newEntry = {
      ...data,
      id: Date.now(),
    };

    setEnquiries((prev) => [newEntry, ...prev]); // latest on top
    setSelectedLead(newEntry);
    setIsNewEnquiry(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#f1f3f6] -m-6">

      {/* Sidebar */}
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

      {/* Main Panel */}
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
