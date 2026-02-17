"use client";

import { useState } from "react";
import EnqMainPanel from "../../components/admin/enquiry/EnqMainPanel";
import EnqSidebar from "../../components/admin/enquiry/EnqSidebar";

export default function EnquiryPage() {

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isNewEnquiry, setIsNewEnquiry] = useState(true);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#f1f3f6] -m-6">

      <EnqSidebar
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
          onAddEnquiry={() => {}}  // Dummy mode
        />
      </div>

    </div>
  );
}
