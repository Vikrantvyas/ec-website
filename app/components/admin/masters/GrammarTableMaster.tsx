"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

export default function GrammarTableMaster() {

  const [tableName, setTableName] = useState("");
  const [totalRows, setTotalRows] = useState(10);
  const [totalColumns, setTotalColumns] = useState(5);

const updateColumns = (value:number) => {

  setTotalColumns(value);

  const updated = [...headers];

  if(value > updated.length){

    while(updated.length < value){
      updated.push("");
    }

  } else {

    updated.length = value;

  }

  setHeaders(updated);

};

  const [headers, setHeaders] = useState([
    
    "Hindi",
    "Subject",
    "HV",
    "Verb",
    "Object"
  ]);
const [savedTables, setSavedTables] = useState<any[]>([]);
const [selectedTable, setSelectedTable] =
  useState<any>(null);

const [selectedHeaders, setSelectedHeaders] =
  useState<any[]>([]);
  const [cellData, setCellData] = useState<any>({});
  const [editingTableId, setEditingTableId] =
  useState<string | null>(null);
  const [grammarTopics, setGrammarTopics] = useState<any[]>([]);

const [selectedGrammarTopic, setSelectedGrammarTopic] =
  useState("");
  const [showTopicInput, setShowTopicInput] = useState(false);

const [newTopicName, setNewTopicName] = useState("");
  const [topicName, setTopicName] = useState("");

const [topics, setTopics] = useState<any[]>([]);

const [selectedTopic, setSelectedTopic] = useState<any>(null);

const [editingTopicId, setEditingTopicId] =
  useState<string | null>(null);
  const editTable = async(table:any)=>{

  setEditingTableId(table.id);

  setTableName(table.name);

  setTotalRows(table.total_rows);

  updateColumns(table.total_columns);

  const { data } = await supabase
    .from("grammar_headers")
    .select("*")
    .eq("table_id", table.id)
    .order("column_order");

  if(data){

    setHeaders(
      data.map(
        (item:any)=>item.header_name
      )
    );

  }

};
useEffect(() => {

  loadTables();

  loadGrammarTopics();

}, []);

const loadTables = async () => {

  const { data } = await supabase
    .from("grammar_tables")
    .select("*")
    .order("created_at", { ascending: false });

  if (data) {
    setSavedTables(data);
  }

};

const loadGrammarTopics = async () => {

  const { data, error } = await supabase
    .from("grammar_topics")
    .select("*")
    .order("sort_order", { ascending: true });

  console.log("Grammar Topics :", data);
  console.log("Grammar Topics Error :", error);

  if (data) {
    setGrammarTopics(data);
  }

};

const openTable = async (table: any) => {

  setSelectedTable(table);

  const { data } = await supabase
    .from("grammar_headers")
    .select("*")
    .eq("table_id", table.id)
    .order("column_order");

  if (data) {
    setSelectedHeaders(data);
  }

  const { data: cells } = await supabase
    .from("grammar_cells")
    .select("*")
    .eq("table_id", table.id);

  if (cells) {

    const formatted: any = {};

    cells.forEach((cell: any) => {

      formatted[
        `${cell.row_no}__${cell.header_id}`
      ] = cell.cell_value;

    });

    setCellData(formatted);

  }

};
  return (

    <div className="p-5 space-y-5">

      <h1 className="text-2xl font-bold">
        Grammar Table Master
      </h1>

      <div className="grid grid-cols-12 gap-4 items-end">

        <div className="col-span-4">
  <label className="block mb-1 font-medium">
  Grammar Topic
</label>

<div className="flex gap-2">

  <select
    value={selectedGrammarTopic}
    onChange={(e) => setSelectedGrammarTopic(e.target.value)}
    className="border p-2 rounded flex-1"
  >
    <option value="">
      Select Topic
    </option>

    {grammarTopics.map((topic) => (
      <option
        key={topic.id}
        value={topic.id}
      >
        {topic.name}
      </option>
    ))}

  </select>

  <button
    type="button"
    onClick={() => setShowTopicInput(true)}
    className="w-10 border rounded hover:bg-gray-100"
    title="Add Grammar Topic"
  >
    +
  </button>

</div>

{
  showTopicInput && (

    <div className="flex gap-2 mt-3">

      <input
        value={newTopicName}
        onChange={(e) => setNewTopicName(e.target.value)}
        placeholder="New Grammar Topic"
        className="border p-2 rounded flex-1"
      />

      <button
  type="button"
  onClick={async () => {

    if (!newTopicName.trim()) {
      alert("Enter Topic Name");
      return;
    }

    const { error } = await supabase
      .from("grammar_topics")
      .insert([
        {
          name: newTopicName,
          sort_order: grammarTopics.length + 1
        }
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    await loadGrammarTopics();

    setNewTopicName("");

    setShowTopicInput(false);

  }}
  className="bg-green-600 text-white px-4 rounded"
>
  Save
</button>

      <button
        type="button"
        onClick={() => {

          setShowTopicInput(false);

          setNewTopicName("");

        }}
        className="bg-gray-400 text-white px-4 rounded"
      >
        Cancel
      </button>

    </div>

  )
}
</div>
<div className="col-span-4">

  <label className="block mb-1 font-medium">
    Table Name
  </label>

  <input
    type="text"
    value={tableName}
    onChange={(e) => setTableName(e.target.value)}
    placeholder="Affirmative / Negative / Interrogative"
    className="border p-2 w-full rounded"
  />

</div>
        <div className="col-span-2">
          <label className="block mb-1 font-medium">
            Rows
          </label>

          <input
            type="number"
            value={totalRows}
            onChange={(e)=>setTotalRows(Number(e.target.value))}
            className="border p-2 w-full rounded"
          />
        </div>

        <div className="col-span-2">
          <label className="block mb-1 font-medium">
            Columns
          </label>

          <input
            type="number"
            value={totalColumns}
            onChange={(e)=>updateColumns(Number(e.target.value))}
            className="border p-2 w-full rounded"
          />
        </div>

      </div>

      <div>

        <label className="block mb-3 font-medium">
          Headers
        </label>

        <div
  className="grid gap-3"
  style={{
    gridTemplateColumns:
      `repeat(${totalColumns}, minmax(150px,1fr))`
  }}
>

          {headers.map((header, index)=>(
            <input
              key={index}
              value={header}
              onChange={(e)=>{

                const updated = [...headers];
                updated[index] = e.target.value;
                setHeaders(updated);

              }}
              className="border p-2 rounded"
            />
          ))}

        </div>

      </div>

      <button

  onClick={async()=>{
if(!selectedGrammarTopic){

  alert("Please select Grammar Topic");

  return;

}
    if(!tableName.trim()){

      alert("Enter table name");
      return;

    }

    let tableData:any = null;
let tableError:any = null;

if(editingTableId){

  const response = await supabase
    .from("grammar_tables")
    .update({
      name: tableName,
      total_rows: totalRows,
      total_columns: totalColumns
    })
    .eq("id", editingTableId)
    .select()
    .single();

  tableData = response.data;
  tableError = response.error;

} else {

  const response = await supabase
    .from("grammar_tables")
    .insert([
      {
        name: tableName,
        topic_id: selectedGrammarTopic,
        total_rows: totalRows,
        total_columns: totalColumns
      }
    ])
    .select()
    .single();

  tableData = response.data;
  tableError = response.error;

}

    if(tableError){

      alert(tableError.message);
      return;

    }

    const headersPayload = headers.map(
      (header,index)=>({

        table_id: tableData.id,
        header_name: header,
        column_order: index + 1

      })
    );
if(editingTableId){

  await supabase
    .from("grammar_headers")
    .delete()
    .eq("table_id", editingTableId);

}
    const { error:headerError } =
      await supabase
        .from("grammar_headers")
        .insert(headersPayload);

    if(headerError){

      alert(headerError.message);
      return;

    }

    alert("Table Saved");
    setEditingTableId(null);

setTableName("");

setTotalRows(10);

updateColumns(5);

setHeaders([
  "Hindi",
  "Subject",
  "HV",
  "Verb",
  "Object"
]);
    loadTables();

  }}

  className="bg-blue-600 text-white px-5 py-2 rounded"
>
  Save Table
</button>
<div className="border rounded overflow-auto">

  <table className="w-full border-collapse">

    <thead>

      <tr className="bg-gray-100 sticky top-0 z-10">
        <th className="border p-2 w-16">
  #
</th>

        {headers.map((header,index)=>(
          <th
            key={index}
            className="border p-2 min-w-[150px]"
          >
            {header || `Column ${index + 1}`}
          </th>
        ))}

      </tr>

    </thead>

    <tbody>

      {Array.from({ length: totalRows }).map((_,rowIndex)=>(

        <tr key={rowIndex}>
<td className="border p-2 text-center font-semibold">
  {rowIndex + 1}
</td>
          {headers.map((_,colIndex)=>(
            <td
              key={colIndex}
              className="border p-2 h-12"
            >
            </td>
          ))}

        </tr>

      ))}

    </tbody>

  </table>

</div>

<div className="border rounded p-4">

  <h2 className="text-xl font-semibold mb-4">
    Saved Tables
  </h2>

  <table className="w-full border-collapse">

    <thead>

      <tr className="bg-gray-100">

        <th className="border p-2 text-left">
          Table Name
        </th>

        <th className="border p-2 text-left">
          Rows
        </th>

        <th className="border p-2 text-left">
          Columns
        </th>
       <th className="border p-2 text-left">
  Actions
</th>

      </tr>

    </thead>

    <tbody>

      {savedTables.map((table)=>(
        <tr key={table.id}>

          <td className="border p-2">
            {table.name}
          </td>

          <td className="border p-2">
            {table.total_rows}
          </td>

          <td className="border p-2">
            {table.total_columns}
          </td>
<td className="border p-2">

  <div className="flex gap-2">
    <button

  onClick={()=>editTable(table)}

  className="bg-yellow-500 text-white px-3 py-1 rounded"
>
  Edit
</button>

    <button
      onClick={()=>openTable(table)}
      className="bg-blue-600 text-white px-3 py-1 rounded"
    >
      Open
    </button>

    <button

      onClick={async()=>{

        const ok = confirm(
          "Delete this table?"
        );

        if(!ok){
          return;
        }

        await supabase
          .from("grammar_tables")
          .delete()
          .eq("id", table.id);

        if(
          selectedTable?.id === table.id
        ){

          setSelectedTable(null);
          setSelectedHeaders([]);
          setCellData({});

        }

        loadTables();

      }}

      className="bg-red-600 text-white px-3 py-1 rounded"
    >
      Delete
    </button>

  </div>

</td>
        </tr>
      ))}

    </tbody>

  </table>

</div>
{selectedTable && (

  <div className="border rounded p-4 space-y-4">

    <h2 className="text-xl font-semibold">
      {selectedTable.name}
    </h2>
<button

  onClick={async()=>{

    if(!selectedTable){
      return;
    }

    await supabase
      .from("grammar_cells")
      .delete()
      .eq("table_id", selectedTable.id);

    const payload:any[] = [];

    Object.entries(cellData).forEach(
      ([key,value])=>{

        const parts = key.split("__");

        payload.push({

          table_id: selectedTable.id,

          row_no: Number(parts[0]),

          header_id: parts[1],

          cell_value: value

        });

      }
    );

    if(payload.length > 0){

  const { error } = await supabase
    .from("grammar_cells")
    .insert(payload);

  if(error){

    alert(error.message);
    return;

  }

}

    alert("Cells Saved");

  }}

  className="bg-green-600 text-white px-4 py-2 rounded"
>
  Save Cells
</button>
    <table className="w-full border-collapse">

      <thead>

        <tr className="bg-gray-100">

          {selectedHeaders.map((header)=>(
            <th
              key={header.id}
              className="border p-2"
            >
              {header.header_name}
            </th>
          ))}

        </tr>

      </thead>

      <tbody>

        {Array.from({
          length: selectedTable.total_rows
        }).map((_,rowIndex)=>(

          <tr key={rowIndex}>

            {selectedHeaders.map((header)=>(
             <td
  key={header.id}
  className="border p-1"
>

  <input

    value={
      cellData[
        `${rowIndex}__${header.id}`
      ] || ""
    }

    onChange={(e)=>{

      setCellData((prev:any)=>({

        ...prev,

        [`${rowIndex}__${header.id}`]:
          e.target.value

      }));

    }}

    className="w-full p-2 outline-none"

  />

</td>
            ))}

          </tr>

        ))}

      </tbody>

    </table>

  </div>

)}
    </div>

  );

}