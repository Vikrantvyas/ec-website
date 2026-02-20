"use client";

import { useState } from "react";
import EnquiryTabs from "./EnquiryTabs";
import TabContent from "./TabContent";
import StudentDetailsView from "./StudentDetailsView";

interface Props {
  selectedStudent: any;
  isNewEnquiry: boolean;
  onAddEnquiry: (data: any) => void;
}

export default function EnqMainPanel({
  selectedStudent,
  isNewEnquiry,
  onAddEnquiry,
}: Props) {
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState<any>({});

  const tabs = [
    "Enquiry Form",
    "Admission Form",
    "Payment Details",
    "Batch & Attendance",
    "Documents",
    "Comments & History",
  ];

  const nextTab = () => {
    if (currentTab < tabs.length - 1) {
      setCurrentTab(currentTab + 1);
    }
  };

  const prevTab = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };

  const handleFinalSubmit = () => {
    onAddEnquiry(formData);
    setCurrentTab(0);
    setFormData({});
  };

  // ===== Existing Student View =====
  if (!isNewEnquiry && selectedStudent) {
    return (
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <StudentDetailsView selectedStudent={selectedStudent} />
        </div>
      </div>
    );
  }

  // ===== New Enquiry View =====
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">

      {/* Tabs */}
      <div className="shrink-0 border-b bg-white">
        <div className="px-4">
          <EnquiryTabs
            tabs={tabs}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <TabContent
          currentTab={currentTab}
          formData={formData}
          setFormData={setFormData}
          nextTab={nextTab}
          prevTab={prevTab}
          handleFinalSubmit={handleFinalSubmit}
        />
      </div>

    </div>
  );
}