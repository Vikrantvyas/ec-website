"use client";

import { useState } from "react";
import EnqMainPanel from "../../components/admin/enquiry/EnqMainPanel";
import EnqSidebar from "../../components/admin/enquiry/EnqSidebar";

export default function EnquiryPage() {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isNewEnquiry, setIsNewEnquiry] = useState(true);

  return (
    <div className="flex flex-col md:flex-row w-full bg-white">

      {/* Sidebar */}
      <div className="w-full md:w-[350px] md:border-r border-gray-200 bg-white">
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
      <div className="flex-1 w-full bg-white">
        <EnqMainPanel
          selectedStudent={selectedLead}
          isNewEnquiry={isNewEnquiry}
          onAddEnquiry={() => {}}
        />
      </div>

    </div>
  );
}
