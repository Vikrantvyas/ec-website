"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CityMaster() {

  const [name, setName] = useState("");
  const [cities, setCities] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCities = async () => {

    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setCities(data);
    }

  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleSubmit = async (e:any) => {

    e.preventDefault();

    if (!name.trim()) return;

    if (editingId) {

      const { error } = await supabase
        .from("cities")
        .update({ name: name.trim() })
        .eq("id", editingId);

      if (error) console.error(error);

      setEditingId(null);

    } else {

      const { error } = await supabase
        .from("cities")
        .insert([{ name: name.trim() }]);

      if (error) console.error(error);

    }

    setName("");
    fetchCities();

  };

  const handleEdit = (city:any) => {

    setName(city.name);
    setEditingId(city.id);

  };

  const handleDelete = async (id:string) => {

    if (!confirm("Delete city?")) return;

    const { error } = await supabase
      .from("cities")
      .delete()
      .eq("id", id);

    if (error) console.error(error);

    fetchCities();

  };

  return (

    <div className="space-y-6">

      <p className="font-semibold text-blue-600">
        City Master
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2"
      >

        <input
          type="text"
          placeholder="City Name"
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

              <th className="text-left p-3">
                City
              </th>

              <th className="text-right p-3">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {cities.map((city)=>(

              <tr key={city.id} className="border-t">

                <td className="p-3">
                  {city.name}
                </td>

                <td className="p-3 text-right space-x-2">

                  <button
                    onClick={()=>handleEdit(city)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={()=>handleDelete(city.id)}
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