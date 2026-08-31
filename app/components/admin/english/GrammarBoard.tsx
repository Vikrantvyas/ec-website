"use client";

import { useEffect, useRef, useState } from "react";
import GrammarTable from "./grammar/GrammarTable";
import { supabase } from "@/lib/supabaseClient";

export default function GrammarBoard({
  selectedGrammarTableId,
  onTableChange
}: any) {

  const [tables, setTables] = useState<any[]>([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableHeaders, setTableHeaders] = useState<any[]>([]);

  const requestIdRef = useRef(0);

  // =========================================================
  // LOAD ALL GRAMMAR TABLES
  // =========================================================

  useEffect(() => {

    const loadTablesForTopic = async () => {

      if (!selectedGrammarTableId) {
        setTables([]);
        setSelectedTableId("");
        return;
      }

      // पहले selected table से उसका topic पता करें
      const {
        data: currentTable,
        error: currentTableError
      } = await supabase
        .from("grammar_tables")
        .select("id, topic_id")
        .eq("id", selectedGrammarTableId)
        .single();

      if (currentTableError || !currentTable) {

        console.error(
          "CURRENT GRAMMAR TABLE ERROR:",
          currentTableError
        );

        return;
      }

      const topicId = currentTable.topic_id;

      // अब केवल इसी Grammar Topic की tables लाएँ
      const {
        data: topicTables,
        error: topicTablesError
      } = await supabase
        .from("grammar_tables")
        .select("*")
        .eq("topic_id", topicId)
        .order("created_at", {
          ascending: true
        });

      if (topicTablesError) {

        console.error(
          "TOPIC GRAMMAR TABLES ERROR:",
          topicTablesError
        );

        return;
      }

      setTables(topicTables || []);

      setSelectedTableId(
        selectedGrammarTableId
      );

      // Selected table का पूरा content load करें
      await loadTableData(
        selectedGrammarTableId
      );

    };

    loadTablesForTopic();

  }, [selectedGrammarTableId]);

  // =========================================================
  // LOAD COMPLETE TABLE DATA
  // =========================================================

  const loadTableData = async (
    tableId: string
  ) => {

    const requestId =
      ++requestIdRef.current;

    // Load headers and cells together
    const [
      headersResult,
      cellsResult
    ] = await Promise.all([

      supabase
        .from("grammar_headers")
        .select("*")
        .eq("table_id", tableId)
        .order("column_order", {
          ascending: true
        }),

      supabase
        .from("grammar_cells")
        .select("*")
        .eq("table_id", tableId)
        .order("row_no", {
          ascending: true
        })

    ]);

    const headers =
      headersResult.data;

    const cells =
      cellsResult.data;

    const headerError =
      headersResult.error;

    const cellError =
      cellsResult.error;

    if (headerError) {

      console.error(
        "GRAMMAR HEADERS ERROR:",
        headerError
      );

      return;
    }

    if (cellError) {

      console.error(
        "GRAMMAR CELLS ERROR:",
        cellError
      );

      return;
    }

    if (!headers || !cells) {

      return;

    }

    // Ignore old request
    if (
      requestId !==
      requestIdRef.current
    ) {

      return;

    }

    // =======================================================
    // GROUP CELLS BY ROW
    // =======================================================

    const grouped: any = {};

    cells.forEach((cell: any) => {

      if (!grouped[cell.row_no]) {

        grouped[cell.row_no] = {

          id: cell.row_no,

          hindi: "",

          rows: [
            {}
          ]

        };

      }

      const header =
        headers.find(
          (h: any) =>
            h.id === cell.header_id
        );

      if (!header) {

        return;

      }

      const key =
        header.header_name.trim().toLowerCase();

      let finalKey =
        key;

      // GrammarTable uses hv1 internally
      if (key === "hv") {
        finalKey = "hv1";
      }

      // Hindi is now a normal column
      grouped[
        cell.row_no
      ].rows[0][finalKey] =
        cell.cell_value;

    });

    // =======================================================
    // SORT ROWS
    // =======================================================

    const completeRows =
      Object.keys(grouped)
        .sort(
          (a, b) =>
            Number(a) - Number(b)
        )
        .map(
          key =>
            grouped[key]
        );

    // =======================================================
    // UPDATE EVERYTHING TOGETHER
    // This keeps table stable while navigating
    // =======================================================

    setTableHeaders(headers);

    setTableData(
      completeRows
    );

  };

  // =========================================================
  // INITIAL / EXTERNAL TABLE SELECTION
  // =========================================================



  // =========================================================
  // CURRENT TABLE INDEX
  // =========================================================

  const currentIndex =
    tables.findIndex(
      (table: any) =>
        table.id === selectedTableId
    );

  // =========================================================
  // PREVIOUS TABLE
  // =========================================================

  const goPrevious = async () => {

    if (currentIndex <= 0) {
      return;
    }

    const previousTable =
      tables[currentIndex - 1];

    if (!previousTable) {
      return;
    }

    // पहले पूरा previous table load करें
    await loadTableData(
      previousTable.id
    );

    // GrammarBoard की current table बदलें
    setSelectedTableId(
      previousTable.id
    );

    // 🔥 Left Panel का radio button भी बदलें
    onTableChange?.(
      previousTable.id
    );

  };

  // =========================================================
  // NEXT TABLE
  // =========================================================

  const goNext = async () => {

    if (
      currentIndex < 0 ||
      currentIndex >=
      tables.length - 1
    ) {

      return;

    }

    const nextTable =
      tables[
      currentIndex + 1
      ];

    if (!nextTable) {

      return;

    }

    // Load complete table first.
    // Selection changes after successful load.
    await loadTableData(
      nextTable.id
    );

    setSelectedTableId(
      nextTable.id
    );

    onTableChange?.(
      nextTable.id
    );

  };

  // =========================================================
  // REFRESH CURRENT TABLE
  // =========================================================

  useEffect(() => {

    if (!selectedTableId) {

      return;

    }

    const handleRefresh = () => {

      loadTableData(
        selectedTableId
      );

    };

    window.addEventListener(
      "grammar-table-refresh",
      handleRefresh
    );

    return () => {

      window.removeEventListener(
        "grammar-table-refresh",
        handleRefresh
      );

    };

  }, [selectedTableId]);

  // =========================================================
  // KEYBOARD NAVIGATION
  // PageUp / PageDown
  // =========================================================

  useEffect(() => {

    const handleKey = (
      e: KeyboardEvent
    ) => {

      // Don't interfere with form controls
      if (
        e.target instanceof HTMLElement &&
        e.target.closest(
          "input, textarea, select, button"
        )
      ) {

        return;

      }

      if (
        e.key === "PageUp"
      ) {

        e.preventDefault();

        goPrevious();

      }

      if (
        e.key === "PageDown"
      ) {

        e.preventDefault();

        goNext();

      }

    };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleKey
      );

    };

  }, [
    tables,
    selectedTableId
  ]);

  // =========================================================
  // BUTTON STATE
  // =========================================================

  const isFirst =
    currentIndex <= 0;

  const isLast =
    currentIndex ===
    tables.length - 1 ||
    currentIndex === -1;

  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="w-full h-full p-4 overflow-hidden flex flex-col gap-3">

      {/* =====================================================
          COMPLETE GRAMMAR TABLE
      ===================================================== */}

      <div className="flex-1 min-h-0 overflow-auto">

        <GrammarTable
          data={tableData}
          headers={
            tableHeaders.map(
              (h: any) =>
                h.header_name
            )
          }
        />

      </div>

      {/* =====================================================
          PREVIOUS / NEXT BUTTONS
      ===================================================== */}

      <div className="flex items-center justify-between shrink-0 px-2">

        {/* PREVIOUS */}

        <button
          type="button"
          onClick={goPrevious}
          disabled={isFirst}
          className="
            w-10
            h-10
            rounded-full
            bg-black/50
            text-white
            text-2xl
            flex
            items-center
            justify-center
            hover:bg-black/70
            disabled:opacity-20
            disabled:cursor-not-allowed
          "
          title="Previous Grammar Table"
        >
          ←
        </button>

        {/* NEXT */}

        <button
          type="button"
          onClick={goNext}
          disabled={isLast}
          className="
            w-10
            h-10
            rounded-full
            bg-black/50
            text-white
            text-2xl
            flex
            items-center
            justify-center
            hover:bg-black/70
            disabled:opacity-20
            disabled:cursor-not-allowed
          "
          title="Next Grammar Table"
        >
          →
        </button>

      </div>

    </div>

  );

}