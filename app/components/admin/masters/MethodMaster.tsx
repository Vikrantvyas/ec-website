"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MethodMaster() {

  const [name,setName] = useState("");
  const [methods,setMethods] = useState<any[]>([]);
  const [editingId,setEditingId] = useState<string | null>(null);

  const fetchMethods = async () => {

    const { data } = await supabase
      .from("methods")
      .select("*")
      .order("name");

    if(data) setMethods(data);

  };

  useEffect(()=>{
    fetchMethods();
  },[]);

  const handleSubmit = async (e:any) => {

    e.preventDefault();

    if(!name.trim()) return;

    if(editingId){

      await supabase
        .from("methods")
        .update({ name })
        .eq("id",editingId);

      setEditingId(null);

    } else {

      await supabase
        .from("methods")
        .insert([{ name }]);

    }

    setName("");
    fetchMethods();

  };

  const handleEdit = (m:any) => {
    setName(m.name);
    setEditingId(m.id);
  };

  const handleDelete = async (id:string) => {

    if(!confirm("Delete method?")) return;

    await supabase
      .from("methods")
      .delete()
      .eq("id",id);

    fetchMethods();

  };

  return (

    <div className="space-y-6">

      <p className="font-semibold text-blue-600">
        Method Master
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">

        <input
          type="text"
          placeholder="Method Name"
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
              <th className="text-left p-3">Method</th>
              <th className="text-right p-3">Action</th>
            </tr>

          </thead>

          <tbody>

            {methods.map((m)=>(

              <tr key={m.id} className="border-t">

                <td className="p-3">
                  {m.name}
                </td>

                <td className="p-3 text-right space-x-2">

                  <button
                    onClick={()=>handleEdit(m)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={()=>handleDelete(m.id)}
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