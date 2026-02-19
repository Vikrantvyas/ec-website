"use client";

import { useState } from "react";
import EnqMainPanel from "../../components/admin/enquiry/EnqMainPanel";
import EnqSidebar from "../../components/admin/enquiry/EnqSidebar";

export default function EnquiryPage() {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isNewEnquiry, setIsNewEnquiry] = useState(true);

  return (
    <div className="flex h-full">

      {/* Sidebar */}
      <div className="w-[420px] border-r border-gray-200 bg-white shrink-0">

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
      <div className="flex-1 bg-white min-w-0">

        <EnqMainPanel
          selectedStudent={selectedLead}
          isNewEnquiry={isNewEnquiry}
          onAddEnquiry={() => {}}
        />
      </div>

    </div>
  );
}
