"use client";

import { useState } from "react";
import EnqMainPanel from "../../components/admin/enquiry/EnqMainPanel";
import EnqSidebar from "../../components/admin/enquiry/EnqSidebar";

export default function EnquiryPage() {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isNewEnquiry, setIsNewEnquiry] = useState(true);

  return (
    <div className="flex h-full">

      {/* Sidebar (Slim) */}
      <div className="w-[340px] border-r bg-white shrink-0">

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
