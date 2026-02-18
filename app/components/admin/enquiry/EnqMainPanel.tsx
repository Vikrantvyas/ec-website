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

  // If viewing existing student
  if (!isNewEnquiry && selectedStudent) {
    return (
      <div className="w-full bg-white min-h-screen">
        <StudentDetailsView selectedStudent={selectedStudent} />
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen">

      <div className="max-w-full overflow-x-hidden">
        <EnquiryTabs
          tabs={tabs}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

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
