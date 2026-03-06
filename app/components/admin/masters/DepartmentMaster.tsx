"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DepartmentMaster() {

  const [name,setName] = useState("");
  const [departments,setDepartments] = useState<any[]>([]);
  const [editingId,setEditingId] = useState<string | null>(null);

  const fetchDepartments = async () => {

    const { data } = await supabase
      .from("departments")
      .select("*")
      .order("name");

    if(data) setDepartments(data);

  };

  useEffect(()=>{
    fetchDepartments();
  },[]);

  const handleSubmit = async (e:any) => {

    e.preventDefault();

    if(!name.trim()) return;

    if(editingId){

      await supabase
        .from("departments")
        .update({ name })
        .eq("id",editingId);

      setEditingId(null);

    } else {

      await supabase
        .from("departments")
        .insert([{ name }]);

    }

    setName("");
    fetchDepartments();

  };

  const handleEdit = (d:any) => {
    setName(d.name);
    setEditingId(d.id);
  };

  const handleDelete = async (id:string) => {

    if(!confirm("Delete department?")) return;

    await supabase
      .from("departments")
      .delete()
      .eq("id",id);

    fetchDepartments();

  };

  return (

    <div className="space-y-6">

      <p className="font-semibold text-blue-600">
        Department Master
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">

        <input
          type="text"
          placeholder="Department Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          {editingId ? "Update" : "Add"}
        </button>

      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">

            <tr>
              <th className="text-left p-3">Department</th>
              <th className="text-right p-3">Action</th>
            </tr>

          </thead>

          <tbody>

            {departments.map((d)=>(

              <tr key={d.id} className="border-t">

                <td className="p-3">
                  {d.name}
                </td>

                <td className="p-3 text-right space-x-2">

                  <button
                    onClick={()=>handleEdit(d)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={()=>handleDelete(d.id)}
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