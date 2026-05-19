"use client";

import { useEffect, useState } from "react";

import GrammarTable from "./grammar/GrammarTable";

import { supabase } from "@/lib/supabaseClient";

export default function GrammarBoard() {

  const [tables, setTables] = useState<any[]>([]);

  const [selectedTableId, setSelectedTableId] =
    useState("");

  const [tableData, setTableData] =
    useState<any[]>([]);
const [tableHeaders, setTableHeaders] =
  useState<any[]>([]);
  useEffect(()=>{

    loadTables();

  },[]);

  const loadTables = async()=>{

    const { data } = await supabase
      .from("grammar_tables")
      .select("*")
      .order("created_at");

    if(data){

      setTables(data);

      if(data.length > 0){

        setSelectedTableId(data[0].id);

        loadTableData(data[0].id);

      }

    }

  };

  const loadTableData = async(tableId:string)=>{

    const { data:headers } = await supabase
      .from("grammar_headers")
      .select("*")
      .eq("table_id", tableId)
      .order("column_order");

    const { data:cells } = await supabase
      .from("grammar_cells")
      .select("*")
      .eq("table_id", tableId);

    if(!headers || !cells){

      return;

    }
setTableHeaders(headers);
    const grouped:any = {};

    cells.forEach((cell:any)=>{

      if(!grouped[cell.row_no]){

        grouped[cell.row_no] = {
          id: cell.row_no,
          hindi: "",
          rows:[{}]
        };

      }

      const header = headers.find(
        (h:any)=>h.id === cell.header_id
      );

      if(!header) return;

      const key =
        header.header_name.toLowerCase();
let finalKey = key;

if(key === "hv"){

  finalKey = "hv1";

}
      if(key === "hindi"){

        grouped[cell.row_no].hindi =
          cell.cell_value;

      } else {

       grouped[cell.row_no]
  .rows[0][finalKey] =
    cell.cell_value;

      }

    });
console.log("HEADERS", headers);

console.log("CELLS", cells);

console.log("GROUPED", grouped);
    setTableData(
      Object.values(grouped)
    );

  };

  return (

    <div className="w-full h-full p-4 overflow-auto flex flex-col gap-3">

      <GrammarTable

  data={tableData}

  headers={
    tableHeaders.map(
      (h:any)=>h.header_name
    )
  }

        tableSelector={

          <select

            value={selectedTableId}

            onChange={(e)=>{

              setSelectedTableId(
                e.target.value
              );

              loadTableData(
                e.target.value
              );

            }}

            className="w-full bg-transparent outline-none text-center font-semibold"
          >

            {tables.map((table)=>(

              <option
                key={table.id}
                value={table.id}
              >
                {table.name}
              </option>

            ))}

          </select>

        }

      />

    </div>
  );

}