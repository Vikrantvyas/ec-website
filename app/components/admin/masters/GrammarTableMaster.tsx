"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";
export default function GrammarTableMaster() {

  const [tableName, setTableName] = useState("");

  const [totalRows, setTotalRows] = useState(0);
  const [totalColumns, setTotalColumns] = useState(0);

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

  const [headers, setHeaders] = useState<string[]>([]);
  const [savedTables, setSavedTables] = useState<any[]>([]);
  const [copiedTable, setCopiedTable] = useState<any>(null);

  const [selectedTable, setSelectedTable] =
    useState<any>(null);

  const [selectedHeaders, setSelectedHeaders] =
    useState<any[]>([]);
  const [draggedHeaderIndex, setDraggedHeaderIndex] =
    useState<number | null>(null);
  const [draggedRowIndex, setDraggedRowIndex] =
    useState<number | null>(null);
  const [rowOrder, setRowOrder] = useState<number[]>([]);
  const [copiedRow, setCopiedRow] = useState<any>(null);
  const copyTable = async (table: any) => {

    const { data: headers, error: headerError } = await supabase
      .from("grammar_headers")
      .select("*")
      .eq("table_id", table.id)
      .order("column_order");

    if (headerError) {
      alert(headerError.message);
      return;
    }

    const { data: cells, error: cellError } = await supabase
      .from("grammar_cells")
      .select("*")
      .eq("table_id", table.id);

    if (cellError) {
      alert(cellError.message);
      return;
    }

    setCopiedTable({
      table,
      headers: headers || [],
      cells: cells || [],
      mode: "copy"
    });

    alert(`Table "${table.name}" Copied`);
  };


  const pasteTable = async (
    sourceData: any = copiedTable
  ) => {

    if (!sourceData) {
      alert("Please copy or cut a table first.");
      return;
    }

    const sourceTable =
      sourceData.table ||
      sourceData.sourceTable ||
      null;

    const sourceHeaders =
      sourceData.headers || [];

    const sourceCells =
      sourceData.cells || [];

    if (!sourceTable || !sourceTable.id) {
      console.log("PASTE DEBUG:", sourceData);

      alert(
        "Copied table data is invalid. Please Copy or Cut the table again."
      );

      return;
    }

    const targetTopicId =
      selectedGrammarTopic ||
      sourceTable.topic_id;

    if (!targetTopicId) {
      alert("Please select a Grammar Topic first.");
      return;
    }

    const baseName =
      sourceTable.name || "Grammar Table";

    let newTableName =
      `${baseName} Copy`;

    let copyNumber = 2;

    while (
      savedTables.some(
        (table) => table.name === newTableName
      )
    ) {

      newTableName =
        `${baseName} Copy ${copyNumber}`;

      copyNumber++;

    }

    const {
      data: newTable,
      error: tableError
    } = await supabase
      .from("grammar_tables")
      .insert({
        name: newTableName,
        topic_id: targetTopicId,
        total_rows: sourceTable.total_rows,
        total_columns: sourceTable.total_columns
      })
      .select()
      .single();

    if (tableError) {

      alert(tableError.message);

      return;
    }

    const headerIdMap: any = {};

    for (const header of sourceHeaders) {

      const {
        data: newHeader,
        error: headerError
      } = await supabase
        .from("grammar_headers")
        .insert({
          table_id: newTable.id,
          header_name: header.header_name,
          column_order: header.column_order
        })
        .select()
        .single();

      if (headerError) {

        alert(headerError.message);

        return;
      }

      headerIdMap[header.id] =
        newHeader.id;
    }

    const newCells =
      sourceCells
        .filter(
          (cell: any) =>
            headerIdMap[cell.header_id]
        )
        .map(
          (cell: any) => ({
            table_id: newTable.id,
            header_id:
              headerIdMap[cell.header_id],
            row_no: cell.row_no,
            cell_value: cell.cell_value
          })
        );

    if (newCells.length > 0) {

      const {
        error: cellsError
      } = await supabase
        .from("grammar_cells")
        .insert(newCells);

      if (cellsError) {

        alert(cellsError.message);

        return;
      }
    }

    // If this was CUT, delete the original
    // only after the new table was created successfully.
    if (sourceData.mode === "cut") {

      const originalTableId =
        sourceTable.id;

      const {
        error: deleteCellsError
      } = await supabase
        .from("grammar_cells")
        .delete()
        .eq("table_id", originalTableId);

      if (deleteCellsError) {

        alert(
          `Table pasted, but original table was not deleted.\n\n${deleteCellsError.message}`
        );

        return;
      }

      const {
        error: deleteHeadersError
      } = await supabase
        .from("grammar_headers")
        .delete()
        .eq("table_id", originalTableId);

      if (deleteHeadersError) {

        alert(
          `Table pasted, but original table was not deleted.\n\n${deleteHeadersError.message}`
        );

        return;
      }

      const {
        error: deleteTableError
      } = await supabase
        .from("grammar_tables")
        .delete()
        .eq("id", originalTableId);

      if (deleteTableError) {

        alert(
          `Table pasted, but original table was not deleted.\n\n${deleteTableError.message}`
        );

        return;
      }

      setCopiedTable(null);

      if (
        selectedTable?.id ===
        originalTableId
      ) {

        setSelectedTable(null);
        setSelectedHeaders([]);
        setCellData({});
      }

      await loadTables();

      alert(
        `Table "${newTableName}" Moved Successfully`
      );

      return;
    }

    await loadTables();

    alert(
      `Table "${newTableName}" Pasted`
    );
  };
  const duplicateTable = async (table: any) => {

    const { data: headers, error: headerError } =
      await supabase
        .from("grammar_headers")
        .select("*")
        .eq("table_id", table.id)
        .order("column_order");

    if (headerError) {
      alert(headerError.message);
      return;
    }

    const { data: cells, error: cellError } =
      await supabase
        .from("grammar_cells")
        .select("*")
        .eq("table_id", table.id);

    if (cellError) {
      alert(cellError.message);
      return;
    }

    await pasteTable({
      table,
      headers: headers || [],
      cells: cells || []
    });

  };
  const copyRow = (actualRowIndex: number) => {
    if (!selectedTable) return;

    const rowData: any = {};

    selectedHeaders.forEach((header) => {
      const key = `${actualRowIndex}__${header.id}`;

      rowData[header.id] = cellData[key] || "";
    });

    setCopiedRow(rowData);

    alert(`Row ${actualRowIndex + 1} Copied`);
  };
  const pasteRow = async (insertAfterIndex: number) => {
    if (!selectedTable) return;

    if (!copiedRow) {
      alert("Please copy a row first.");
      return;
    }

    const newRowIndex = insertAfterIndex + 1;

    // Existing rows को नीचे shift करें
    const { data: cells, error } = await supabase
      .from("grammar_cells")
      .select("*")
      .eq("table_id", selectedTable.id);

    if (error) {
      alert(error.message);
      return;
    }

    if (cells) {
      for (const cell of [...cells].sort(
        (a: any, b: any) => b.row_no - a.row_no
      )) {
        if (cell.row_no >= newRowIndex) {
          await supabase
            .from("grammar_cells")
            .update({
              row_no: cell.row_no + 1,
            })
            .eq("id", cell.id);
        }
      }
    }

    // Copied row का data नई row में insert करें
    const newCells = selectedHeaders
      .map((header) => ({
        table_id: selectedTable.id,
        header_id: header.id,
        row_no: newRowIndex,
        cell_value:
          copiedRow?.[header.id] !== undefined
            ? copiedRow[header.id]
            : "",
      }))
      .filter((cell) => cell.cell_value !== "");
    setCellData((prev: any) => {
      const updated = { ...prev };

      selectedHeaders.forEach((header) => {
        updated[`${newRowIndex}__${header.id}`] =
          copiedRow?.[header.id] || "";
      });

      return updated;
    });

    const { error: insertError } = await supabase
      .from("grammar_cells")
      .insert(newCells);

    if (insertError) {
      alert(insertError.message);
      return;
    }

    const newTotalRows = selectedTable.total_rows + 1;

    await supabase
      .from("grammar_tables")
      .update({
        total_rows: newTotalRows,
      })
      .eq("id", selectedTable.id);

    setSelectedTable({
      ...selectedTable,
      total_rows: newTotalRows,
    });

    await loadTables();

    window.dispatchEvent(
      new Event("grammar-table-refresh")
    );

    alert("Row Pasted");
  };
  const cutTable = async (table: any) => {

    const { data: headers, error: headerError } =
      await supabase
        .from("grammar_headers")
        .select("*")
        .eq("table_id", table.id)
        .order("column_order");

    if (headerError) {
      alert(headerError.message);
      return;
    }

    const { data: cells, error: cellError } =
      await supabase
        .from("grammar_cells")
        .select("*")
        .eq("table_id", table.id);

    if (cellError) {
      alert(cellError.message);
      return;
    }

    setCopiedTable({
      table,
      headers: headers || [],
      cells: cells || [],
      mode: "cut"
    });

    alert(`Table "${table.name}" Cut`);
  };
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

    setSelectedGrammarTopic(table.topic_id);

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
  const loadTableForEdit = async (tableId: string) => {

    const { data: table, error } = await supabase
      .from("grammar_tables")
      .select("*")
      .eq("id", tableId)
      .single();

    if (error || !table) {

      console.error("Table load error:", error);

      return;

    }

    await editTable(table);

  };
  useEffect(() => {

    loadTables();
    loadGrammarTopics();

    const params = new URLSearchParams(
      window.location.search
    );

    const editTableId =
      params.get("editTable");

    if (editTableId) {
      loadTableForEdit(editTableId);
    }

  }, []);
  useEffect(() => {

    loadTables();

  }, [selectedGrammarTopic]);

  useEffect(() => {

    if (grammarTopics.length > 0) {

      loadTables();

    }

  }, [grammarTopics]);
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
      { ascending: true }
    );

    if (data) {

      const sortedTables = [...data].sort((a, b) => {

        const topicA =
          grammarTopics.find(
            (topic) => topic.id === a.topic_id
          );

        const topicB =
          grammarTopics.find(
            (topic) => topic.id === b.topic_id
          );

        const orderA =
          parseInt(
            topicA?.name?.match(/\d+/)?.[0] || "9999"
          );

        const orderB =
          parseInt(
            topicB?.name?.match(/\d+/)?.[0] || "9999"
          );

        if (orderA !== orderB) {

          return orderA - orderB;

        }
        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );

      });

      setSavedTables(sortedTables);

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

      const sortedTopics = [...data].sort((a, b) => {

        const numA =
          parseInt(
            a.name?.match(/\d+/)?.[0] || "9999"
          );

        const numB =
          parseInt(
            b.name?.match(/\d+/)?.[0] || "9999"
          );

        return numA - numB;

      });

      setGrammarTopics(sortedTopics);

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
  const addColumn = async (insertAfterIndex: number) => {
    if (!selectedTable) return;

    const newColumnName = prompt("Enter new column name:");

    if (!newColumnName?.trim()) return;

    const trimmedName = newColumnName.trim();

    const duplicateColumn = selectedHeaders.some(
      (header) =>
        header.header_name.trim().toLowerCase() ===
        trimmedName.toLowerCase()
    );

    if (duplicateColumn) {
      alert("A column with this name already exists.");
      return;
    }

    const newHeader = {
      table_id: selectedTable.id,
      header_name: trimmedName,
      column_order: insertAfterIndex + 2,
    };

    const { data, error } = await supabase
      .from("grammar_headers")
      .insert(newHeader)
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (!data) return;

    // Existing columns को आगे shift करें
    for (
      let i = selectedHeaders.length - 1;
      i > insertAfterIndex;
      i--
    ) {
      await supabase
        .from("grammar_headers")
        .update({
          column_order: i + 2,
        })
        .eq("id", selectedHeaders[i].id);
    }

    const updatedHeaders = [
      ...selectedHeaders.slice(0, insertAfterIndex + 1),
      data,
      ...selectedHeaders.slice(insertAfterIndex + 1),
    ];

    setSelectedHeaders(updatedHeaders);

    setSelectedTable({
      ...selectedTable,
      total_columns: updatedHeaders.length,
    });

    await supabase
      .from("grammar_tables")
      .update({
        total_columns: updatedHeaders.length,
      })
      .eq("id", selectedTable.id);

    await loadTables();

    alert("Column Added");
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
  const addRow = async (insertAfterIndex: number) => {
    if (!selectedTable) return;

    const newTotalRows = selectedTable.total_rows + 1;

    // Existing rows को नीचे shift करें
    const { data: cells, error } = await supabase
      .from("grammar_cells")
      .select("*")
      .eq("table_id", selectedTable.id);

    if (error) {
      alert(error.message);
      return;
    }

    if (cells) {
      for (const cell of [...cells].sort(
        (a: any, b: any) => b.row_no - a.row_no
      )) {
        if (cell.row_no > insertAfterIndex) {
          await supabase
            .from("grammar_cells")
            .update({
              row_no: cell.row_no + 1,
            })
            .eq("id", cell.id);
        }
      }
    }

    // Table row count बढ़ाएँ
    await supabase
      .from("grammar_tables")
      .update({
        total_rows: newTotalRows,
      })
      .eq("id", selectedTable.id);

    // UI row order update
    setRowOrder((prev) => {
      const updated = [...prev];

      updated.splice(
        insertAfterIndex + 1,
        0,
        newTotalRows - 1
      );

      return updated;
    });

    setSelectedTable({
      ...selectedTable,
      total_rows: newTotalRows,
    });

    await loadTables();

    // Real Grammar Board refresh
    window.dispatchEvent(
      new Event("grammar-table-refresh")
    );

    alert("Row Added");
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
            <div className="flex gap-1">
              <button
                type="button"
                disabled={!selectedGrammarTopic}
                onClick={() => {
                  const topic = grammarTopics.find(
                    (t) => t.id === selectedGrammarTopic
                  );

                  if (!topic) return;

                  setEditingTopicId(topic.id);
                  setNewTopicName(topic.name);
                  setShowTopicInput(true);
                }}
                className="border rounded px-2 disabled:opacity-40"
                title="Edit Grammar Topic"
              >
                Edit
              </button>

              <button
                type="button"
                disabled={!selectedGrammarTopic}
                onClick={async () => {

                  const topic = grammarTopics.find(
                    (t) => t.id === selectedGrammarTopic
                  );

                  if (!topic) return;

                  // Check whether this topic has grammar tables
                  const { count, error: countError } = await supabase
                    .from("grammar_tables")
                    .select("id", {
                      count: "exact",
                      head: true
                    })
                    .eq("topic_id", topic.id);

                  if (countError) {
                    alert(countError.message);
                    return;
                  }

                  // Do not delete topic if tables exist
                  if (count && count > 0) {
                    alert(
                      `This topic has ${count} Grammar Table(s).\n\nPlease delete or move those tables first.`
                    );
                    return;
                  }

                  const ok = confirm(
                    `Delete Grammar Topic "${topic.name}"?`
                  );

                  if (!ok) return;

                  const { error } = await supabase
                    .from("grammar_topics")
                    .delete()
                    .eq("id", topic.id);

                  if (error) {
                    alert(error.message);
                    return;
                  }

                  setSelectedGrammarTopic("");
                  await loadGrammarTopics();

                }}
                className="border rounded px-2 text-red-600 disabled:opacity-40"
                title="Delete Grammar Topic"
              >
                Delete
              </button>
            </div>

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

                    // EDIT EXISTING TOPIC
                    if (editingTopicId) {

                      const { error } = await supabase
                        .from("grammar_topics")
                        .update({
                          name: newTopicName.trim()
                        })
                        .eq("id", editingTopicId);

                      if (error) {
                        alert(error.message);
                        return;
                      }

                    } else {

                      // ADD NEW TOPIC
                      const { error } = await supabase
                        .from("grammar_topics")
                        .insert([
                          {
                            name: newTopicName.trim(),
                            sort_order: grammarTopics.length + 1
                          }
                        ]);

                      if (error) {
                        alert(error.message);
                        return;
                      }

                    }

                    await loadGrammarTopics();

                    setNewTopicName("");
                    setEditingTopicId(null);
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
                    setEditingTopicId(null);
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
            value={totalRows || ""}
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
            value={totalColumns || ""}
            onChange={(e) => updateColumns(Number(e.target.value))}
            className="border p-2 w-full rounded"
          />
        </div>

      </div>

      {totalRows > 0 && totalColumns > 0 && (

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
                placeholder={`Column ${index + 1}`}
                className="border p-2 rounded"
              />
            ))}

          </div>

        </div>

      )}
      {totalRows > 0 && totalColumns > 0 && (
        <button
          onClick={async () => {
            if (!selectedGrammarTopic) {
              alert("Please select Grammar Topic");
              return;
            }

            if (totalRows <= 0) {
              alert("Enter number of rows");
              return;
            }

            if (totalColumns <= 0) {
              alert("Enter number of columns");
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
                  topic_id: selectedGrammarTopic,
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
            setTotalRows(0);
            setTotalColumns(0);
            setHeaders([]);
            loadTables();
          }}
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          Save Table
        </button>
      )}

      {totalRows > 0 && totalColumns > 0 && (
        <div className="border rounded overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 sticky top-0 z-10">
                <th className="border p-2 w-16">
                  #
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
              {Array.from({ length: totalRows }).map(
                (_, rowIndex) => (
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
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">
            Saved Tables ({savedTables.length})
          </h2>

          <button
            type="button"
            onClick={() => pasteTable()}
            disabled={!copiedTable}
            className="bg-purple-600 text-white px-3 py-1 rounded disabled:opacity-40"
          >
            Paste Table
          </button>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">
                Topic Name
              </th>

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
                  {
                    grammarTopics.find(
                      (topic) => topic.id === table.topic_id
                    )?.name || "-"
                  }
                </td>

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

                    <button
                      onClick={() => copyTable(table)}
                      className="bg-gray-600 text-white px-3 py-1 rounded"
                    >
                      Copy
                    </button>

                    <button
                      onClick={() => duplicateTable(table)}
                      className="bg-purple-600 text-white px-3 py-1 rounded"
                    >
                      Duplicate
                    </button>

                    <button
                      onClick={() => cutTable(table)}
                      className="bg-orange-600 text-white px-3 py-1 rounded"
                    >
                      Cut
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>


        {
          selectedTable && (

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

                          <div className="flex items-center gap-1">

                            <button
                              type="button"
                              draggable={false}
                              onClick={(e) => {
                                e.stopPropagation();
                                addColumn(index);
                              }}
                              className="text-green-700 font-bold px-1 hover:bg-green-100 rounded"
                              title="Add Column After"
                            >
                              +
                            </button>

                            <button
                              type="button"
                              draggable={false}
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
                      <td className="border p-1 w-16 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addRow(actualRowIndex);
                          }}
                          className="text-green-700 font-bold px-2 py-1 hover:bg-green-100 rounded"
                          title="Add Row After"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyRow(actualRowIndex);
                          }}
                          className="text-blue-600 font-bold px-2 py-1 hover:bg-blue-100 rounded"
                          title="Copy Row"
                        >
                          ⧉
                        </button>
                        <button
                          type="button"
                          disabled={!copiedRow}
                          onClick={(e) => {
                            e.stopPropagation();
                            pasteRow(actualRowIndex);
                          }}
                          className="text-purple-600 font-bold px-2 py-1 hover:bg-purple-100 rounded disabled:opacity-30"
                          title="Paste Copied Row After This Row"
                        >
                          📋
                        </button>
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

          )
        }
      </div>
    </div>
  );

}