"use client";

import { useState } from "react";
import EnqMainPanel from "@/app/components/admin/enquiry/EnqMainPanel";
import EnqSidebar from "@/app/components/admin/enquiry/EnqSidebar";

export default function EnquiryPage() {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isNewEnquiry, setIsNewEnquiry] = useState(true);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#f1f3f6] -m-6">

      {/* SIDEBAR */}
      <EnqSidebar
        onSelectEnquiry={(lead: any) => {
          setSelectedLead(lead);
          setIsNewEnquiry(false);
        }}
        onNewEnquiry={() => {
          setSelectedLead(null);
          setIsNewEnquiry(true);
        }}
      />

      {/* MAIN PANEL */}
      <div className="flex-1 h-full overflow-hidden">
        <EnqMainPanel
          selectedStudent={selectedLead}
          isNewEnquiry={isNewEnquiry}
        />
      </div>

    </div>
  );
}
