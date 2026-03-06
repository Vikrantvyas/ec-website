import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

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
    contactTime: "Any Time",

    department: ["English"],
    course: ["Basic + Advance English"],

    preferredTime: "Any Time",
    preferredBatch: "Any Time",

    leadChances: "High",
    leadStage: "Lead",

    status: "Fresh Lead",

    action: "Follow up",

    nextFollowDate: nextFollowDate,
    nextFollowTime: nextFollowTime,

    counsellor: "Simran Salvi",

    remark: ""
  };

  const [formData, setFormData] = useState<any>(initialState);
  const [loading, setLoading] = useState(false);

  const [cities, setCities] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [methods, setMethods] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [leadFor, setLeadFor] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [leadChances, setLeadChances] = useState<string[]>([]);
  const [leadStages, setLeadStages] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [counsellors, setCounsellors] = useState<string[]>([]);

  useEffect(() => {

    fetchCities();
    fetchBranches();
    fetchMethods();
    fetchChannels();
    fetchLeadFor();
    fetchDepartments();
    fetchCourses();
    fetchLeadChances();
    fetchLeadStages();
    fetchActions();
    fetchCounsellors();

  }, []);

  useEffect(() => {

    if(formData.city){
      fetchAreas(formData.city);
    }

  },[formData.city]);

  useEffect(() => {

    if (!formData.department || formData.department.length === 0) {
      setCourses([]);
      return;
    }

    const filtered = allCourses
      .filter((c) => formData.department.includes(c.department))
      .map((c) => c.name);

    setCourses(filtered);

  }, [formData.department, allCourses]);

  const capitalizeName = (value:string) => {

    return value
      .toLowerCase()
      .replace(/\b\w/g,(char)=>char.toUpperCase());

  };

  const getEducationFromAge = (age:number) => {

    const classes = [
      "1st","2nd","3rd","4th","5th",
      "6th","7th","8th","9th","10th",
      "11th","12th"
    ];

    if(age >=5 && age <=17){

      const index = age - 6;

      if(classes[index]){
        return classes[index];
      }

    }

    if(age >= 18 && age <= 21){
      return "Graduate";
    }

    if(age > 21){
      return "Post Graduate";
    }

    return "";

  };

  const handleChange = (e:any) => {

    let { name, value } = e.target;

    if (name === "mobileNumber" || name === "alternateNumber") {
      value = value.replace("+91","").replace(/\D/g,"").slice(0,10);
    }

    if (name === "enquiredBy" || name === "studentName") {

      value = capitalizeName(value);

      if (name === "enquiredBy" && formData.forWhom === "Self") {

        setFormData((prev:any)=>({
          ...prev,
          enquiredBy:value,
          studentName:value
        }));

        return;

      }

    }

    if(name === "age"){

      const age = parseInt(value);

      let education = getEducationFromAge(age);

      let maritalStatus = age >= 25 ? "Married" : "Single";

      let profession = age >= 25 ? "Job" : "Student";

      setFormData((prev:any)=>({

        ...prev,

        age:value,
        education:education,
        maritalStatus:maritalStatus,
        profession:profession

      }));

      return;

    }

    setFormData((prev:any)=>({
      ...prev,
      [name]:value
    }));

  };

  const mapOptions = (arr:any[]=[]) =>
    arr.map((item)=>({
      label:item,
      value:item
    }));

  const fetchCities = async () => {

    const { data } = await supabase
      .from("cities")
      .select("name")
      .order("name");

    if (data) setCities(data.map((c:any)=>c.name));

  };

  const fetchAreas = async (city:string) => {

    const { data } = await supabase
      .from("areas")
      .select("name")
      .eq("city",city)
      .order("name");

    if (data) setAreas(data.map((a:any)=>a.name));

  };

  const fetchBranches = async () => {

    const { data } = await supabase
      .from("branches")
      .select("name")
      .eq("status","Active")
      .order("name");

    if (data) setBranches(data.map((b:any)=>b.name));

  };

  const fetchMethods = async () => {

    const { data } = await supabase
      .from("methods")
      .select("name")
      .order("name");

    if (data) setMethods(data.map((m:any)=>m.name));

  };

  const fetchChannels = async () => {

    const { data } = await supabase
      .from("channels")
      .select("name")
      .order("name");

    if (data) setChannels(data.map((c:any)=>c.name));

  };

  const fetchLeadFor = async () => {

    const { data } = await supabase
      .from("lead_for")
      .select("name")
      .order("name");

    if (data) setLeadFor(data.map((l:any)=>l.name));

  };

  const fetchDepartments = async () => {

    const { data } = await supabase
      .from("departments")
      .select("name")
      .order("name");

    if (data) setDepartments(data.map((d:any)=>d.name));

  };

  const fetchCourses = async () => {

    const { data } = await supabase
      .from("courses")
      .select("name, department")
      .order("name");

    if (data) {

      setAllCourses(data);

      const filtered = data
        .filter((c:any)=>initialState.department.includes(c.department))
        .map((c:any)=>c.name);

      setCourses(filtered);

    }

  };

  const fetchLeadChances = async () => {

    const { data } = await supabase
      .from("lead_chances")
      .select("name")
      .order("name");

    if (data) setLeadChances(data.map((l:any)=>l.name));

  };

  const fetchLeadStages = async () => {

    const { data } = await supabase
      .from("lead_stages")
      .select("name")
      .order("name");

    if (data) setLeadStages(data.map((l:any)=>l.name));

  };

  const fetchActions = async () => {

    const { data } = await supabase
      .from("lead_actions")
      .select("name")
      .order("name");

    if (data) setActions(data.map((a:any)=>a.name));

  };

  const fetchCounsellors = async () => {

    const { data } = await supabase
      .from("counsellors")
      .select("name")
      .order("name");

    if (data) setCounsellors(data.map((c:any)=>c.name));

  };

  const resetForm = () => {
    setFormData(initialState);
  };

  return {

    formData,
    setFormData,
    handleChange,
    loading,
    setLoading,

    branches,
    methods,
    channels,
    areas,
    leadFor,
    departments,
    courses,
    leadChances,
    leadStages,
    actions,
    counsellors,

    cities,

    mapOptions,

    resetForm,
    fetchCities

  };

}