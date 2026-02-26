import { useEffect, useState } from "react";

export default function useLeadForm() {

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const formattedTime = today.toTimeString().slice(0, 5);

  const [step, setStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const [formData, setFormData] = useState<any>({
    branch: "",
    enquiryDate: formattedDate,
    enquiryTime: formattedTime,
    method: "Visit",
    channel: "Main Board",

    enquiredBy: "",
    forWhom: "Self",
    studentName: "",
    mobileNumber: "",
    mobileOwner: "Self",
    whatsappNumber: "",
    whatsappOwner: "Self",
    area: "",

    gender: "",
    age: "",
    maritalStatus: "",
    profession: "Student",

    education: "",
    schoolTiming: "",
    contactTime: "",

    department: "",
    course: "",
    preferredTiming: "",

    status: "Fresh",
    action: "",
    nextFollowDate: "",
    nextFollowTime: "",
    counsellor: "",
    remark: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prev: any) => {
      let updated = { ...prev, [name]: value };

      if (name === "forWhom") {
        updated.studentName =
          value === "Self" ? prev.enquiredBy : "";
      }

      if (name === "enquiredBy" && prev.forWhom === "Self") {
        updated.studentName = value;
      }

      if (name === "mobileNumber") {
        updated.whatsappNumber = value;
      }

      return updated;
    });
  };

  const branches = ["Nanda Ngr", "Bapat Sq.", "Aurobindo"];

  const courseOptions =
    formData.department === "English"
      ? ["Spoken English", "Basic English", "Advanced English"]
      : formData.department === "Computer"
      ? ["Basic Computer", "Tally", "Typing", "Advanced Computer"]
      : [];

  const mapOptions = (arr: string[]) =>
    arr.map((item) => ({ label: item, value: item }));

  return {
    formData,
    setFormData,
    handleChange,
    step,
    setStep,
    isMobile,
    loading,
    setLoading,
    branches,
    courseOptions,
    mapOptions
  };
}