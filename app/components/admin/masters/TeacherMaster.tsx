"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TeacherMaster() {

  const [name,setName] = useState("");
  const [mobile,setMobile] = useState("");
  const [email,setEmail] = useState("");
  const [dob,setDob] = useState("");
  const [gender,setGender] = useState("");
  const [maritalStatus,setMaritalStatus] = useState("");
  const [education,setEducation] = useState("");
  const [joiningDate,setJoiningDate] = useState("");
  const [localAddress,setLocalAddress] = useState("");
  const [permanentAddress,setPermanentAddress] = useState("");
  const [status,setStatus] = useState("Active");
  const [photo,setPhoto] = useState<File | null>(null);

  const [items,setItems] = useState<any[]>([]);
  const [editingId,setEditingId] = useState<string | null>(null);

  const fetchItems = async () => {

    const { data,error } = await supabase
      .from("teachers")
      .select("*")
      .order("name",{ ascending:true });

    if(error){
      console.error(error);
      return;
    }

    if(data){
      setItems(data);
    }

  };

  useEffect(()=>{
    fetchItems();
  },[]);

  const handleSubmit = async (e:any) => {

    e.preventDefault();

    if(!name.trim()) return;

    const teacherData = {
      name:name.trim(),
      mobile:mobile.trim(),
      email:email.trim(),
      dob,
      gender,
      marital_status:maritalStatus,
      education,
      joining_date:joiningDate,
      local_address:localAddress,
      permanent_address:permanentAddress,
      status
    };

    if(editingId){

      const { error } = await supabase
        .from("teachers")
        .update(teacherData)
        .eq("id",editingId);

      if(error) console.error(error);

      setEditingId(null);

    }else{

      const { error } = await supabase
        .from("teachers")
        .insert([teacherData]);

      if(error) console.error(error);

    }

    setName("");
    setMobile("");
    setEmail("");
    setDob("");
    setGender("");
    setMaritalStatus("");
    setEducation("");
    setJoiningDate("");
    setLocalAddress("");
    setPermanentAddress("");
    setStatus("Active");
    setPhoto(null);

    fetchItems();

  };

  const handleEdit = (item:any) => {

    setName(item.name || "");
    setMobile(item.mobile || "");
    setEmail(item.email || "");
    setDob(item.dob || "");
    setGender(item.gender || "");
    setMaritalStatus(item.marital_status || "");
    setEducation(item.education || "");
    setJoiningDate(item.joining_date || "");
    setLocalAddress(item.local_address || "");
    setPermanentAddress(item.permanent_address || "");
    setStatus(item.status || "Active");

    setEditingId(item.id);

  };

  const handleDelete = async (id:string) => {

    if(!confirm("Delete teacher?")) return;

    const { error } = await supabase
      .from("teachers")
      .delete()
      .eq("id",id);

    if(error) console.error(error);

    fetchItems();

  };

  return (

    <div className="space-y-6">

      <p className="font-semibold text-blue-600">
        Teacher Master
      </p>

      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-4 gap-4"
      >

        {/* Row 1 */}

        <div>
          <label className="text-sm text-gray-600">Name</label>
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Mobile</label>
          <input
            type="text"
            placeholder="e.g. 9876543210"
            value={mobile}
            onChange={(e)=>setMobile(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            placeholder="e.g. rahul@gmail.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e)=>setDob(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
          />
        </div>

        {/* Row 2 */}

        <div>
          <label className="text-sm text-gray-600">Gender</label>
          <select
            value={gender}
            onChange={(e)=>setGender(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">Marital Status</label>
          <select
            value={maritalStatus}
            onChange={(e)=>setMaritalStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
          >
            <option value="">Select</option>
            <option>Single</option>
            <option>Married</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">Education</label>
          <input
            type="text"
            placeholder="e.g. M.Sc., B.Ed."
            value={education}
            onChange={(e)=>setEducation(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Joining Date</label>
          <input
            type="date"
            value={joiningDate}
            onChange={(e)=>setJoiningDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
          />
        </div>

        {/* Row 3 */}

        <div>
          <label className="text-sm text-gray-600">Upload Photo</label>
          <input
            type="file"
            onChange={(e)=>setPhoto(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Local Address</label>
          <input
            type="text"
            placeholder="Flat/House No, Street..."
            value={localAddress}
            onChange={(e)=>setLocalAddress(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Permanent Address</label>
          <input
            type="text"
            placeholder="House No, Street..."
            value={permanentAddress}
            onChange={(e)=>setPermanentAddress(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Status</label>
          <select
            value={status}
            onChange={(e)=>setStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
          >
            <option>Active</option>
            <option>Inactive</option>
            <option>On Leave</option>
          </select>
        </div>

        <div className="md:col-span-4 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {editingId ? "Update" : "Add"}
          </button>
        </div>

      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Mobile</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Action</th>
            </tr>
          </thead>

          <tbody>

            {items.map((item)=>(

              <tr key={item.id} className="border-t">

                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.mobile}</td>
                <td className="p-3">{item.status}</td>

                <td className="p-3 text-right space-x-2">

                  <button
                    onClick={()=>handleEdit(item)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={()=>handleDelete(item.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}