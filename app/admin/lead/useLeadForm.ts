import { useEffect, useState } from "react";

export default function useLeadForm() {

  const now = new Date();

  const formattedDate = now.toISOString().split("T")[0];
  const formattedTime = now.toTimeString().slice(0, 5);

  // Auto Next Day
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);
  const nextFollowDate = nextDay.toISOString().split("T")[0];

  // Auto +24 Hours
  const nextTime = new Date();
  nextTime.setHours(nextTime.getHours() + 24);
  const nextFollowTime = nextTime.toTimeString().slice(0, 5);

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

    gender: "Male",
    age: "",
    maritalStatus: "Single",
    profession: "Student",

    education: "",
    schoolTiming: "",
    contactTime: "",

    // 🔥 Department Updated
    department: "English",

    // 🔥 Multi Select Course (Array)
    course: ["Spoken English"],

    // 🔥 Preferred Timing + Batch
    preferredTiming: "Any Time",
    preferredBatch: "8 AM",

    leadChances: "Medium",
    leadStage: "Lead",

    action: "Call Again",
    nextFollowDate: nextFollowDate,
    nextFollowTime: nextFollowTime,

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

  // 🔥 Course Logic Updated
  const courseOptions =
    formData.department === "English"
      ? ["Spoken English", "Basic English", "Advanced English"]
      : formData.department === "Computer"
      ? ["Basic Computer", "Tally", "Typing", "Advanced Computer"]
      : formData.department === "Eng & Com"
      ? [
          "Spoken English",
          "Basic English",
          "Advanced English",
          "Basic Computer",
          "Tally",
          "Typing",
          "Advanced Computer",
        ]
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