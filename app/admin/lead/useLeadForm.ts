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
    method: "",
    channel: "",

    enquiredBy: "",
    forWhom: "",
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

    department: "",
    course: [],

    leadChances: "",
    leadStage: "",

    action: "",
    nextFollowDate: nextFollowDate,
    nextFollowTime: nextFollowTime,

    counsellor: "",
    remark: "",
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
    fetchAreas();
    fetchLeadFor();
    fetchDepartments();
    fetchCourses();
    fetchLeadChances();
    fetchLeadStages();
    fetchActions();
    fetchCounsellors();

  }, []);

  const fetchCities = async () => {

    const { data } = await supabase
      .from("cities")
      .select("name")
      .order("name");

    if (data) setCities(data.map((c:any) => c.name));

  };

  const fetchBranches = async () => {

    const { data } = await supabase
      .from("branches")
      .select("name")
      .eq("status","Active")
      .order("name");

    if (data) setBranches(data.map((b:any) => b.name));

  };

  const fetchMethods = async () => {

    const { data } = await supabase
      .from("methods")
      .select("name")
      .order("name");

    if (data) setMethods(data.map((m:any) => m.name));

  };

  const fetchChannels = async () => {

    const { data } = await supabase
      .from("channels")
      .select("name")
      .order("name");

    if (data) setChannels(data.map((c:any) => c.name));

  };

  const fetchAreas = async () => {

    const { data } = await supabase
      .from("areas")
      .select("name")
      .order("name");

    if (data) setAreas(data.map((a:any) => a.name));

  };

  const fetchLeadFor = async () => {

    const { data } = await supabase
      .from("lead_for")
      .select("name")
      .order("name");

    if (data) setLeadFor(data.map((l:any) => l.name));

  };

  const fetchDepartments = async () => {

    const { data } = await supabase
      .from("departments")
      .select("name")
      .order("name");

    if (data) setDepartments(data.map((d:any) => d.name));

  };

  const fetchCourses = async () => {

    const { data } = await supabase
      .from("courses")
      .select("name")
      .order("name");

    if (data) setCourses(data.map((c:any) => c.name));

  };

  const fetchLeadChances = async () => {

    const { data } = await supabase
      .from("lead_chances")
      .select("name")
      .order("name");

    if (data) setLeadChances(data.map((l:any) => l.name));

  };

  const fetchLeadStages = async () => {

    const { data } = await supabase
      .from("lead_stages")
      .select("name")
      .order("name");

    if (data) setLeadStages(data.map((l:any) => l.name));

  };

  const fetchActions = async () => {

    const { data } = await supabase
      .from("lead_actions")
      .select("name")
      .order("name");

    if (data) setActions(data.map((a:any) => a.name));

  };

  const fetchCounsellors = async () => {

    const { data } = await supabase
      .from("counsellors")
      .select("name")
      .order("name");

    if (data) setCounsellors(data.map((c:any) => c.name));

  };

  const resetForm = () => {
    setFormData(initialState);
  };

  const handleChange = (e:any) => {

    let { name, value } = e.target;

    if (name === "mobileNumber" || name === "alternateNumber") {
      value = value.replace("+91","").replace(/\D/g,"").slice(0,10);
    }

    setFormData((prev:any)=>({
      ...prev,
      [name]: value
    }));

  };

  const mapOptions = (arr:any[]=[]) =>
    arr.map((item)=>({
      label:item,
      value:item
    }));

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