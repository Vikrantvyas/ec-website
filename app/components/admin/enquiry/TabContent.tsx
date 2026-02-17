"use client";

import EnquiryFormTab from "./tabs/EnquiryFormTab";
import AdmissionFormTab from "./tabs/AdmissionFormTab";
import PaymentDetailsTab from "./tabs/PaymentDetailsTab";
import BatchAttendanceTab from "./tabs/BatchAttendanceTab";
import DocumentsTab from "./tabs/DocumentsTab";
import CommentsHistoryTab from "./tabs/CommentsHistoryTab";

interface Props {
  currentTab: number;
  formData: any;
  setFormData: any;
  nextTab: () => void;
  prevTab: () => void;
  handleFinalSubmit: () => void;
}

export default function TabContent({
  currentTab,
  formData,
  setFormData,
  nextTab,
  prevTab,
  handleFinalSubmit,
}: Props) {

  switch (currentTab) {
    case 0:
      return (
        <EnquiryFormTab
          formData={formData}
          setFormData={setFormData}
          nextTab={nextTab}
        />
      );

    case 1:
      return (
        <AdmissionFormTab
          formData={formData}
          setFormData={setFormData}
          nextTab={nextTab}
          prevTab={prevTab}
        />
      );

    case 2:
      return (
        <PaymentDetailsTab
          formData={formData}
          setFormData={setFormData}
          nextTab={nextTab}
          prevTab={prevTab}
        />
      );

    case 3:
      return (
        <BatchAttendanceTab
          formData={formData}
          setFormData={setFormData}
          nextTab={nextTab}
          prevTab={prevTab}
        />
      );

    case 4:
      return (
        <DocumentsTab
          formData={formData}
          setFormData={setFormData}
          nextTab={nextTab}
          prevTab={prevTab}
        />
      );

    case 5:
      return (
        <CommentsHistoryTab
          formData={formData}
          setFormData={setFormData}
          prevTab={prevTab}
          handleFinalSubmit={handleFinalSubmit}
        />
      );

    default:
      return null;
  }
}
