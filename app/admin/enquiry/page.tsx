"use client";

import { useState } from "react";
import EnqMainPanel from "../../components/admin/enquiry/EnqMainPanel";
import EnqSidebar from "../../components/admin/enquiry/EnqSidebar";

export default function EnquiryPage() {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isNewEnquiry, setIsNewEnquiry] = useState(true);

  return (
    <div className="flex flex-col md:flex-row gap-6">

      {/* Sidebar */}
      <div className="w-full md:w-[320px] bg-white rounded-xl border shadow-sm">
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
      </div>

      {/* Main Panel */}
      <div className="flex-1 bg-white rounded-xl border shadow-sm">
        <EnqMainPanel
          selectedStudent={selectedLead}
          isNewEnquiry={isNewEnquiry}
          onAddEnquiry={() => {}}
        />
      </div>

    </div>
  );
}
