"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/app/components/ui/FormFields";

export default function EducationMaster(){

  const [name,setName] = useState("");
  const [items,setItems] = useState<any[]>([]);
  const [editingId,setEditingId] = useState<string | null>(null);

  const fetchItems = async () => {

    const { data,error } = await supabase
      .from("educations")
      .select("*")
      .order("sort_order",{ ascending:true });

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

    const payload = {
      name:name.trim()
    };

    if(editingId){

      const { error } = await supabase
        .from("educations")
        .update(payload)
        .eq("id",editingId);

      if(error) console.error(error);

      setEditingId(null);

    }else{

      const { error } = await supabase
        .from("educations")
        .insert([payload]);

      if(error) console.error(error);

    }

    setName("");
    fetchItems();

  };

  const handleEdit = (item:any) => {

    setName(item.name || "");
    setEditingId(item.id);

  };

  const handleDelete = async (id:string) => {

    if(!confirm("Delete education?")) return;

    const { error } = await supabase
      .from("educations")
      .delete()
      .eq("id",id);

    if(error) console.error(error);

    fetchItems();

  };

  return (

    <div className="space-y-6">

      <p className="font-semibold text-blue-600">
        Education Master
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex gap-4 max-w-xl"
      >

        <div className="flex-1">

          <Input
            label="Education Name"
            value={name}
            onChange={(e:any)=>setName(e.target.value)}
          />

        </div>

        <div className="flex items-end">

          <button
            type="submit"
            className="px-5 h-[44px] rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {editingId ? "Update" : "Add"}
          </button>

        </div>

      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">

            <tr>
              <th className="text-left p-3">Education</th>
              <th className="text-right p-3">Action</th>
            </tr>

          </thead>

          <tbody>

            {items.map((item:any)=>(

              <tr key={item.id} className="border-t">

                <td className="p-3">
                  {item.name}
                </td>

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