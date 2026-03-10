"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import BranchSelector from "@/app/components/ui/BranchSelector";
import { Input, SelectField } from "@/app/components/ui/FormFields";

export default function TeacherMaster() {

  const [branch,setBranch] = useState("");
  const [branches,setBranches] = useState<any[]>([]);
  const [educations,setEducations] = useState<string[]>([]);

  const [name,setName] = useState("");
  const [mobile,setMobile] = useState("");
  const [email,setEmail] = useState("");
  const [dob,setDob] = useState("");

  const [gender,setGender] = useState("Male");
  const [maritalStatus,setMaritalStatus] = useState("Single");
  const [education,setEducation] = useState("");
  const [joiningDate,setJoiningDate] = useState("");

  const [localAddress,setLocalAddress] = useState("");
  const [permanentAddress,setPermanentAddress] = useState("");

  const [status,setStatus] = useState("Active");

  const [photo,setPhoto] = useState<File | null>(null);

  const [items,setItems] = useState<any[]>([]);
  const [editingId,setEditingId] = useState<string | null>(null);

  const mapOptions = (arr:string[]) =>
    arr.map(v=>({label:v,value:v}));

  const handleMobile = (val:string)=>{

    val = val.replace("+91","").replace(/\D/g,"");
    if(val.length > 10) val = val.slice(0,10);

    setMobile(val);

  };

  const fetchBranches = async () => {

    const { data,error } = await supabase
      .from("branches")
      .select("id,name")
      .order("name",{ ascending:true });

    if(error){
      console.error(error);
      return;
    }

    if(data){
      setBranches(data);
    }

  };

  const fetchEducations = async () => {

    const { data,error } = await supabase
      .from("educations")
      .select("name")
      .order("sort_order",{ ascending:true });

    if(error){
      console.error(error);
      return;
    }

    if(data){
      setEducations(data.map((e:any)=>e.name));
    }

  };

  const fetchItems = async (branchId:string) => {

    if(!branchId) return;

    const { data,error } = await supabase
      .from("teachers")
      .select(`
        *,
        branches(name)
      `)
      .eq("branch_id",branchId)
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
    fetchBranches();
    fetchEducations();
  },[]);

  useEffect(()=>{
    fetchItems(branch);
  },[branch]);

  const handleSubmit = async (e:any) => {

    e.preventDefault();

    if(!name.trim()){
      alert("Name required");
      return;
    }

    if(!/^\d{10}$/.test(mobile)){
      alert("Enter valid 10 digit mobile");
      return;
    }

    let photo_url = null;

    if(photo){

      const fileName = `${Date.now()}_${photo.name}`;

      const { error:uploadError } = await supabase
        .storage
        .from("teacher-photos")
        .upload(fileName,photo);

      if(!uploadError){

        const { data } = supabase
          .storage
          .from("teacher-photos")
          .getPublicUrl(fileName);

        photo_url = data.publicUrl;

      }

    }

    const teacherData = {
      branch_id:branch || null,
      name:name.trim(),
      mobile,
      email:email || null,
      dob:dob || null,
      gender,
      marital_status:maritalStatus,
      education,
      joining_date:joiningDate || null,
      local_address:localAddress || null,
      permanent_address:permanentAddress || null,
      status,
      photo_url
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
    setGender("Male");
    setMaritalStatus("Single");
    setEducation("");
    setJoiningDate("");
    setLocalAddress("");
    setPermanentAddress("");
    setStatus("Active");
    setPhoto(null);

    fetchItems(branch);

  };

  const handleEdit = (item:any) => {

    setBranch(item.branch_id || "");
    setName(item.name || "");
    setMobile(item.mobile || "");
    setEmail(item.email || "");
    setDob(item.dob || "");
    setGender(item.gender || "Male");
    setMaritalStatus(item.marital_status || "Single");
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

    fetchItems(branch);

  };

  return (

    <div className="space-y-6">

      <p className="font-semibold text-blue-600">
        Teacher Master
      </p>

      <BranchSelector
        branches={branches.map(b=>b.name)}
        value={branches.find(b=>b.id===branch)?.name || ""}
        onChange={(name)=>{
          const selected = branches.find(b=>b.name===name);
          if(selected) setBranch(selected.id);
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-4 gap-4"
      >

        <Input label="Name *" value={name} onChange={(e:any)=>setName(e.target.value)} />

        <Input
          label="Mobile *"
          value={mobile}
          onChange={(e:any)=>handleMobile(e.target.value)}
        />

        <Input label="Email" type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)} />

        <Input label="Date of Birth" type="date" value={dob} onChange={(e:any)=>setDob(e.target.value)} />

        <SelectField
          label="Gender"
          value={gender}
          onChange={(val:string)=>setGender(val)}
          options={mapOptions(["Male","Female"])}
        />

        <SelectField
          label="Marital Status"
          value={maritalStatus}
          onChange={(val:string)=>setMaritalStatus(val)}
          options={mapOptions(["Single","Married"])}
        />

        <SelectField
          label="Education"
          value={education}
          onChange={(val:string)=>setEducation(val)}
          options={mapOptions(educations)}
        />

        <Input label="Joining Date" type="date" value={joiningDate} onChange={(e:any)=>setJoiningDate(e.target.value)} />

        <Input label="Local Address" value={localAddress} onChange={(e:any)=>setLocalAddress(e.target.value)} />

        <Input label="Permanent Address" value={permanentAddress} onChange={(e:any)=>setPermanentAddress(e.target.value)} />

        <SelectField
          label="Status"
          value={status}
          onChange={(val:string)=>setStatus(val)}
          options={mapOptions(["Active","Inactive","On Leave"])}
        />

        <div className="flex flex-col">

<label className="mb-1 text-gray-600 text-sm font-medium">
Photo
</label>

<input
  type="file"
  accept="image/*;capture=camera"
  onChange={(e:any)=>setPhoto(e.target.files?.[0] || null)}
  className="w-full h-[44px] px-3 rounded-lg border border-gray-300 bg-white
  focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

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
              <th className="text-left p-3">Branch</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Mobile</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Action</th>
            </tr>

          </thead>

          <tbody>

            {items.map((item)=>(

              <tr key={item.id} className="border-t">

                <td className="p-3">{item.branches?.name}</td>
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