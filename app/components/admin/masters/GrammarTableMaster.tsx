"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";
export default function GrammarTableMaster() {

  const [tableName, setTableName] = useState("");

  const [totalRows, setTotalRows] = useState(2);
  const [totalColumns, setTotalColumns] = useState(5);

  const updateColumns = (value: number) => {

    setTotalColumns(value);

    const updated = [...headers];

    if (value > updated.length) {

      while (updated.length < value) {
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
  const [draggedHeaderIndex, setDraggedHeaderIndex] =
    useState<number | null>(null);
  const [draggedRowIndex, setDraggedRowIndex] =
    useState<number | null>(null);
  const [rowOrder, setRowOrder] = useState<number[]>([]);
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
  const editTable = async (table: any) => {

    setEditingTableId(table.id);

    setTableName(table.name);

    setTotalRows(table.total_rows);

    updateColumns(table.total_columns);

    const { data } = await supabase
      .from("grammar_headers")
      .select("*")
      .eq("table_id", table.id)
      .order("column_order");

    if (data) {

      setHeaders(
        data.map(
          (item: any) => item.header_name
        )
      );

    }

  };
  useEffect(() => {

    loadTables();

    loadGrammarTopics();

  }, []);
  useEffect(() => {

    loadTables();

  }, [selectedGrammarTopic]);


  const loadTables = async () => {

    let query = supabase
      .from("grammar_tables")
      .select("*");

    if (selectedGrammarTopic) {

      query = query.eq(
        "topic_id",
        selectedGrammarTopic
      );

    }

    const { data } = await query.order(
      "created_at",
      { ascending: false }
    );

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
  useEffect(() => {
    if (!selectedTable) return;

    setRowOrder(
      Array.from(
        { length: selectedTable.total_rows },
        (_, i) => i
      )
    );
  }, [selectedTable]);
  const deleteColumn = async (headerId: string) => {
    if (!selectedTable) return;

    const headerIndex = selectedHeaders.findIndex(
      (header) => header.id === headerId
    );

    if (headerIndex === -1) return;

    const header = selectedHeaders[headerIndex];

    const ok = confirm(
      `Delete column "${header.header_name}" and all its data?`
    );

    if (!ok) return;

    // Delete all cells of this column
    const { error: cellError } = await supabase
      .from("grammar_cells")
      .delete()
      .eq("table_id", selectedTable.id)
      .eq("header_id", headerId);

    if (cellError) {
      alert(cellError.message);
      return;
    }

    // Delete header
    const { error: headerError } = await supabase
      .from("grammar_headers")
      .delete()
      .eq("id", headerId);

    if (headerError) {
      alert(headerError.message);
      return;
    }

    // Remaining headers
    const updatedHeaders = selectedHeaders.filter(
      (header) => header.id !== headerId
    );

    // Re-number column order
    for (let i = 0; i < updatedHeaders.length; i++) {
      await supabase
        .from("grammar_headers")
        .update({
          column_order: i + 1,
        })
        .eq("id", updatedHeaders[i].id);
    }

    // Update table column count
    await supabase
      .from("grammar_tables")
      .update({
        total_columns: updatedHeaders.length,
      })
      .eq("id", selectedTable.id);

    setSelectedHeaders(updatedHeaders);

    setHeaders((prev: string[]) =>
      prev.filter((_, index) => index !== headerIndex)
    );

    setSelectedTable({
      ...selectedTable,
      total_columns: updatedHeaders.length,
    });

    await loadTables();

    alert("Column Deleted");
  };
  const deleteRow = async (actualRowIndex: number) => {
    if (!selectedTable) return;

    const ok = confirm(
      `Delete Row ${actualRowIndex + 1} and all its data?`
    );

    if (!ok) return;

    // Delete all cells of this row
    const { error: cellError } = await supabase
      .from("grammar_cells")
      .delete()
      .eq("table_id", selectedTable.id)
      .eq("row_no", actualRowIndex);

    if (cellError) {
      alert(cellError.message);
      return;
    }

    // Get remaining cells
    const { data: remainingCells, error: fetchError } =
      await supabase
        .from("grammar_cells")
        .select("*")
        .eq("table_id", selectedTable.id);

    if (fetchError) {
      alert(fetchError.message);
      return;
    }

    // Shift rows after deleted row
    if (remainingCells) {
      for (const cell of remainingCells) {
        if (cell.row_no > actualRowIndex) {
          await supabase
            .from("grammar_cells")
            .update({
              row_no: cell.row_no - 1,
            })
            .eq("id", cell.id);
        }
      }
    }

    const newTotalRows =
      selectedTable.total_rows - 1;

    // Update table row count
    await supabase
      .from("grammar_tables")
      .update({
        total_rows: newTotalRows,
      })
      .eq("id", selectedTable.id);

    // Update local row order
    setRowOrder((prev) =>
      prev
        .filter((row) => row !== actualRowIndex)
        .map((row) =>
          row > actualRowIndex ? row - 1 : row
        )
    );

    setSelectedTable({
      ...selectedTable,
      total_rows: newTotalRows,
    });

    await loadTables();

window.dispatchEvent(
  new Event("grammar-table-refresh")
);

alert("Row Deleted");
  };
  const saveHeaderOrder = async (showMessage = true) => {

    if (!selectedTable || selectedHeaders.length === 0) {
      return;
    }

    for (let i = 0; i < selectedHeaders.length; i++) {

      const { error } = await supabase
        .from("grammar_headers")
        .update({
          column_order: i + 1
        })
        .eq("id", selectedHeaders[i].id);

      if (error) {
        alert(error.message);
        return;
      }
    }

    setSelectedHeaders([...selectedHeaders]);

    if (showMessage) {
      alert("Column Order Saved");
    }
  };
  const saveRowOrder = async (showMessage = true) => {

    if (!selectedTable) return;

    // Current UI order
    const orderedRows = rowOrder;

    // Get all cells
    const { data: cells, error } = await supabase
      .from("grammar_cells")
      .select("*")
      .eq("table_id", selectedTable.id);

    if (error) {
      alert(error.message);
      return;
    }

    if (!cells) return;

    // -----------------------------------------
    // STEP 1: Give temporary row numbers
    // -----------------------------------------

    for (const cell of cells) {

      const { error: tempError } =
        await supabase
          .from("grammar_cells")
          .update({
            row_no: cell.row_no + 10000
          })
          .eq("id", cell.id);

      if (tempError) {
        alert(tempError.message);
        return;
      }
    }

    // -----------------------------------------
    // STEP 2: Apply new row numbers
    // -----------------------------------------

    for (let newIndex = 0; newIndex < orderedRows.length; newIndex++) {

      const oldRowIndex = orderedRows[newIndex];

      const oldCells = cells.filter(
        (cell: any) =>
          cell.row_no === oldRowIndex
      );

      for (const cell of oldCells) {

        const { error: finalError } =
          await supabase
            .from("grammar_cells")
            .update({
              row_no: newIndex
            })
            .eq("id", cell.id);

        if (finalError) {
          alert(finalError.message);
          return;
        }
      }
    }

    if (showMessage) {
      alert("Row Order Saved");
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
              onChange={(e) => {

                setSelectedGrammarTopic(e.target.value);

              }}
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
            onChange={(e) => {

              setTableName(e.target.value);


            }}
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
            onChange={(e) => setTotalRows(Number(e.target.value))}
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
            onChange={(e) => updateColumns(Number(e.target.value))}
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

          {headers.map((header, index) => (
            <input
              key={index}
              value={header}
              onChange={(e) => {

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

        onClick={async () => {
          if (!selectedGrammarTopic) {

            alert("Please select Grammar Topic");

            return;

          }
          if (!tableName.trim()) {

            alert("Enter table name");
            return;

          }

          let tableData: any = null;
          let tableError: any = null;

          if (editingTableId) {

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

          if (tableError) {

            alert(tableError.message);
            return;

          }

          const headersPayload = headers.map(
            (header, index) => ({

              table_id: tableData.id,
              header_name: header,
              column_order: index + 1

            })
          );
          if (editingTableId) {

            const { data: oldHeaders, error: oldHeadersError } =
              await supabase
                .from("grammar_headers")
                .select("*")
                .eq("table_id", editingTableId)
                .order("column_order");

            if (oldHeadersError) {
              alert(oldHeadersError.message);
              return;
            }

            for (let index = 0; index < headers.length; index++) {

              const headerName = headers[index]?.trim() || "";

              if (index < oldHeaders.length) {

                await supabase
                  .from("grammar_headers")
                  .update({
                    header_name: headerName,
                    column_order: index + 1
                  })
                  .eq("id", oldHeaders[index].id);

              } else {

                await supabase
                  .from("grammar_headers")
                  .insert({
                    table_id: editingTableId,
                    header_name: headerName,
                    column_order: index + 1
                  });

              }

            }

          } else {

            const { error: headerError } =
              await supabase
                .from("grammar_headers")
                .insert(headersPayload);

            if (headerError) {
              alert(headerError.message);
              return;
            }

          }



          alert("Table Saved");
          setEditingTableId(null);

          setTableName("");

          setTotalRows(2);

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
              <th className="border p-2 w-10">
                ×
              </th>

              {headers.map((header, index) => (
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

            {Array.from({ length: totalRows }).map((_, rowIndex) => (

              <tr key={rowIndex}>
                <td className="border p-2 text-center font-semibold">
                  {rowIndex + 1}
                </td>
                {headers.map((_, colIndex) => (
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

            {savedTables.map((table) => (
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

                      onClick={() => editTable(table)}

                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => openTable(table)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Open
                    </button>

                    <button

                      onClick={async () => {

                        const ok = confirm(
                          "Delete this table?"
                        );

                        if (!ok) {
                          return;
                        }

                        await supabase
                          .from("grammar_tables")
                          .delete()
                          .eq("id", table.id);

                        if (
                          selectedTable?.id === table.id
                        ) {

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

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-semibold">
              {selectedTable.name}
            </h2>

            <button
              onClick={async () => {
                await saveHeaderOrder(false);
                await saveRowOrder(false);
                alert("Order Saved");
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save Order
            </button>

          </div>
          <button

            onClick={async () => {

              if (!selectedTable) {
                return;
              }

              await supabase
                .from("grammar_cells")
                .delete()
                .eq("table_id", selectedTable.id);

              const payload: any[] = [];

              Object.entries(cellData).forEach(
                ([key, value]) => {

                  const parts = key.split("__");

                  payload.push({

                    table_id: selectedTable.id,

                    row_no: Number(parts[0]),

                    header_id: parts[1],

                    cell_value: value

                  });

                }
              );

              if (payload.length > 0) {

                const { error } = await supabase
                  .from("grammar_cells")
                  .insert(payload);

                if (error) {

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

                {selectedHeaders.map((header, index) => (
                  <th
                    key={header.id}
                    draggable
                    onDragStart={() => {
                      setDraggedHeaderIndex(index);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={() => {

                      if (
                        draggedHeaderIndex === null ||
                        draggedHeaderIndex === index
                      ) {
                        return;
                      }

                      const updated = [...selectedHeaders];

                      const [movedHeader] =
                        updated.splice(draggedHeaderIndex, 1);

                      updated.splice(index, 0, movedHeader);

                      setSelectedHeaders(updated);
                      setDraggedHeaderIndex(null);
                    }}
                    className="border p-2 cursor-move select-none"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{header.header_name}</span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteColumn(header.id);
                        }}
                        className="text-red-600 font-bold px-1 hover:bg-red-100 rounded"
                        title="Delete Column"
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}

              </tr>

            </thead>

            <tbody>

              {rowOrder.map((actualRowIndex, displayIndex) => (

                <tr
                  key={actualRowIndex}
                  draggable
                  onDragStart={() => {
                    setDraggedRowIndex(displayIndex);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={() => {

                    if (
                      draggedRowIndex === null ||
                      draggedRowIndex === displayIndex
                    ) {
                      return;
                    }

                    const updated = [...rowOrder];

                    const [movedRow] =
                      updated.splice(draggedRowIndex, 1);

                    updated.splice(displayIndex, 0, movedRow);

                    setRowOrder(updated);
                    setDraggedRowIndex(null);
                  }}
                  className="cursor-move"
                >

                  {selectedHeaders.map((header) => (
                    <td
                      key={header.id}
                      className="border p-1"
                    >

                      <input

                        value={
                          cellData[
                          `${actualRowIndex}__${header.id}`
                          ] || ""
                        }

                        onChange={(e) => {

                          setCellData((prev: any) => ({

                            ...prev,

                            [`${actualRowIndex}__${header.id}`]: e.target.value

                          }));

                        }}

                        className="w-full p-2 outline-none"

                      />

                    </td>
                  ))}
                  <td className="border p-1 w-10 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRow(actualRowIndex);
                      }}
                      className="text-red-600 font-bold px-2 py-1 hover:bg-red-100 rounded"
                      title="Delete Row"
                    >
                      ×
                    </button>
                  </td>
                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}
    </div>

  );

}