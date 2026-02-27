import { useState } from "react";

export default function useLeadForm() {

  const now = new Date();

  const formattedDate = now.toISOString().split("T")[0];
  const formattedTime = now.toTimeString().slice(0, 8);

  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);
  const nextFollowDate = nextDay.toISOString().split("T")[0];

  const nextTime = new Date();
  nextTime.setHours(nextTime.getHours() + 24);
  const nextFollowTime = nextTime.toTimeString().slice(0, 8);

  const initialState = {
    branch: "",
    enquiryDate: formattedDate,
    enquiryTime: formattedTime,
    method: "Visit",
    channel: "Main Board",

    enquiredBy: "",
    forWhom: "Self",
    studentName: "",
    mobileNumber: "",
    alternateNumber: "",
    city: "Indore",
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
  };

  const [formData, setFormData] = useState<any>(initialState);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData(initialState);
  };

  const handleChange = (e: any) => {
    let { name, value } = e.target;

    // Mobile cleaning
    if (name === "mobileNumber" || name === "alternateNumber") {
      value = value.replace("+91", "").replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev: any) => {
      let updated = { ...prev, [name]: value };

      // Auto copy EnquiredBy → StudentName (if Self)
      if (name === "enquiredBy" && prev.forWhom === "Self") {
        updated.studentName = value;
      }

      if (name === "forWhom") {
        updated.studentName = value === "Self" ? prev.enquiredBy : "";
      }

      // Age Based Smart Logic
      if (name === "age") {
        const ageNum = parseInt(value);

        if (!isNaN(ageNum)) {

          // Education logic (Age - 5 = Class)
          const classLevel = ageNum - 5;

          if (classLevel <= 0) {
            updated.education = "";
          }
          else if (classLevel >= 1 && classLevel <= 9) {
            updated.education = `${classLevel}th`;
          }
          else if (classLevel === 10) {
            updated.education = "10th";
          }
          else if (classLevel === 11) {
            updated.education = "11th";
          }
          else if (classLevel === 12) {
            updated.education = "12th";
          }
          else if (classLevel >= 13 && classLevel <= 15) {
            updated.education = "Graduate";
          }
          else if (classLevel > 15) {
            updated.education = "Post Graduate";
          }

          // Marital & Profession logic
          updated.maritalStatus = ageNum >= 25 ? "Married" : "Single";
          updated.profession = ageNum >= 25 ? "Job" : "Student";
        }
      }

      // Contact time auto adjust
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
      : [
          "Spoken English",
          "Basic English",
          "Advanced English",
          "Basic Computer",
          "Tally",
          "Typing",
          "Advanced Computer",
        ];

  const mapOptions = (arr: string[]) =>
    arr.map((item) => ({ label: item, value: item }));

  return {
    formData,
    setFormData,
    handleChange,
    loading,
    setLoading,
    branches,
    courseOptions,
    mapOptions,
    resetForm
  };
}