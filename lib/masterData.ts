import { supabase } from "./supabaseClient";

export async function getDepartments() {

  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  if (error) return [];

  return data;

}

export async function getCourses(departmentId: string) {

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("department_id", departmentId)
    .order("course_name");

  if (error) return [];

  return data;

}

export async function getBatches(courseId: string) {

  const { data, error } = await supabase
    .from("batches")
    .select("*")
    .eq("course_id", courseId)
    .order("batch_time");

  if (error) return [];

  return data;

}