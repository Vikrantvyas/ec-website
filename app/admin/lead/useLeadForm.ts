import { useEffect, useState } from "react";

export default function useLeadForm() {

  const now = new Date();

  const formattedDate = now.toISOString().split("T")[0];
  const formattedTime = now.toTimeString().slice(0, 5);

  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);
  const nextFollowDate = nextDay.toISOString().split("T")[0];

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
    area: "",

    gender: "Male",
    age: "",
    maritalStatus: "Single",
    profession: "Student",

    education: "",
    schoolCollegeJob: "",
    schoolTiming: "Morning",
    contactTime: "2 PM - 5 PM",

    department: "English",
    course: ["Spoken English"],

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

      // Auto Student Name
      if (name === "forWhom") {
        updated.studentName =
          value === "Self" ? prev.enquiredBy : "";
      }

      if (name === "enquiredBy" && prev.forWhom === "Self") {
        updated.studentName = value;
      }

      // Age Based Smart Logic
      if (name === "age") {
        const ageNum = parseInt(value);

        if (!isNaN(ageNum)) {

          // Marital
          updated.maritalStatus = ageNum >= 25 ? "Married" : "Single";

          // Profession
          updated.profession = ageNum >= 25 ? "Job" : "Student";

          // Education
          if (ageNum <= 10) updated.education = "4th";
          else if (ageNum <= 14) updated.education = "8th";
          else if (ageNum <= 17) updated.education = "10th";
          else if (ageNum <= 20) updated.education = "12th";
          else if (ageNum <= 23) updated.education = "Graduate";
          else updated.education = "Post Graduate";
        }
      }

      // Smart Contact Time Logic
      if (name === "schoolTiming") {
        if (value === "Morning") updated.contactTime = "2 PM - 5 PM";
        if (value === "Afternoon") updated.contactTime = "6 PM - 8 PM";
        if (value === "Evening") updated.contactTime = "10 AM - 12 PM";
        if (value === "Night") updated.contactTime = "9 AM - 11 AM";
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