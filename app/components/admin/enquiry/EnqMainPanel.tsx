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

  // 🔥 Central Form State
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
    onAddEnquiry(formData); // sidebar me add karega
    setCurrentTab(0);
    setFormData({});
  };

  // Student selected → show details
  if (!isNewEnquiry && selectedStudent) {
    return (
      <StudentDetailsView selectedStudent={selectedStudent} />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">

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
  );
}
