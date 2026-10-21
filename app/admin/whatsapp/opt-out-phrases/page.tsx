
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckSquare,
  Clipboard,
  Copy,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Square,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Phrase = {
  id: string;
  phrase: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }
  return "Koi anjaan error aa gaya.";
}

export default function WhatsAppOptOutPhrasesPage() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [newPhrase, setNewPhrase] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const pasteRef = useRef<HTMLTextAreaElement>(null);

  const loadPhrases = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("whatsapp_opt_out_phrases")
      .select("id, phrase, is_active, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(`Phrases load nahi hue: ${queryError.message}`);
      setPhrases([]);
    } else {
      setPhrases((data ?? []) as Phrase[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadPhrases();
  }, [loadPhrases]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return phrases;
    return phrases.filter((item) =>
      item.phrase.toLocaleLowerCase().includes(term)
    );
  }, [phrases, search]);

  const activeCount = phrases.filter((item) => item.is_active).length;
  const inactiveCount = phrases.length - activeCount;
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((item) => selected.includes(item.id));

  function showNotice(message: string) {
    setNotice(message);
    setError("");
  }

  function normalizeLines(value: string) {
    const lines = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const seen = new Set<string>();
    return lines.filter((line) => {
      const key = line.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async function addPhrases(values: string[]) {
    const existing = new Set(
      phrases.map((item) => item.phrase.trim().toLocaleLowerCase())
    );
    const unique = normalizeLines(values.join("\n")).filter((line) => {
      const key = line.toLocaleLowerCase();
      if (existing.has(key)) return false;
      existing.add(key);
      return true;
    });

    if (unique.length === 0) {
      setError("Koi naya phrase nahi mila. Duplicate ya khaali entry ho sakti hai.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const { error: insertError } = await supabase
      .from("whatsapp_opt_out_phrases")
      .insert(unique.map((phrase) => ({ phrase, is_active: true })));

    setSaving(false);

    if (insertError) {
      setError(`Save nahi hua: ${insertError.message}`);
      return;
    }

    setNewPhrase("");
    setPasteText("");
    setShowPaste(false);
    setSelected([]);
    showNotice(`${unique.length} phrase successfully add ho gaye.`);
    await loadPhrases();
  }

  async function saveNewPhrase() {
    if (!newPhrase.trim()) {
      setError("Pehle phrase likhiye.");
      return;
    }
    await addPhrases([newPhrase]);
  }

  async function saveEdit(id: string) {
    const value = editText.trim();

    if (!value) {
      setError("Phrase khaali nahi ho sakta.");
      return;
    }

    const duplicate = phrases.some(
      (item) =>
        item.id !== id &&
        item.phrase.trim().toLocaleLowerCase() === value.toLocaleLowerCase()
    );

    if (duplicate) {
      setError("Ye phrase pehle se maujood hai.");
      return;
    }

    setBusyId(id);
    setError("");
    setNotice("");

    const { error: updateError } = await supabase
      .from("whatsapp_opt_out_phrases")
      .update({ phrase: value, updated_at: new Date().toISOString() })
      .eq("id", id);

    setBusyId(null);

    if (updateError) {
      setError(`Update nahi hua: ${updateError.message}`);
      return;
    }

    setEditId(null);
    setEditText("");
    showNotice("Phrase update ho gaya.");
    await loadPhrases();
  }

  async function toggleActive(item: Phrase) {
    setBusyId(item.id);
    setError("");
    setNotice("");

    const { error: updateError } = await supabase
      .from("whatsapp_opt_out_phrases")
      .update({
        is_active: !item.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    setBusyId(null);

    if (updateError) {
      setError(`Status change nahi hua: ${updateError.message}`);
      return;
    }

    showNotice(
      !item.is_active
        ? "Phrase activate ho gaya."
        : "Phrase deactivate ho gaya."
    );
    await loadPhrases();
  }

  async function deletePhrases(ids: string[]) {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) return;

    const message =
      uniqueIds.length === 1
        ? "Kya aap is phrase ko delete karna chahte hain?"
        : `Kya aap ${uniqueIds.length} selected phrases ko delete karna chahte hain?`;

    if (!window.confirm(`${message}\nYe action undo nahi hoga.`)) return;

    setSaving(true);
    setError("");
    setNotice("");

    const { error: deleteError } = await supabase
      .from("whatsapp_opt_out_phrases")
      .delete()
      .in("id", uniqueIds);

    setSaving(false);

    if (deleteError) {
      setError(`Delete nahi hua: ${deleteError.message}`);
      return;
    }

    setSelected((old) => old.filter((id) => !uniqueIds.includes(id)));
    if (editId && uniqueIds.includes(editId)) {
      setEditId(null);
      setEditText("");
    }
    showNotice(`${uniqueIds.length} phrase delete ho gaye.`);
    await loadPhrases();
  }

  function toggleSelected(id: string) {
    setSelected((old) =>
      old.includes(id) ? old.filter((value) => value !== id) : [...old, id]
    );
  }

  function toggleAllFiltered() {
    if (allFilteredSelected) {
      setSelected((old) =>
        old.filter((id) => !filtered.some((item) => item.id === id))
      );
    } else {
      setSelected((old) => [
        ...new Set([...old, ...filtered.map((item) => item.id)]),
      ]);
    }
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      showNotice("Clipboard par copy ho gaya.");
    } catch {
      setError("Copy nahi ho saka. Browser clipboard permission check karein.");
    }
  }

  async function pasteFromClipboard() {
    try {
      const value = await navigator.clipboard.readText();
      if (!value.trim()) {
        setError("Clipboard khaali hai.");
        return;
      }
      setPasteText((old) => (old.trim() ? `${old}\n${value}` : value));
      setShowPaste(true);
      showNotice("Clipboard ka text paste area mein aa gaya.");
    } catch {
      setShowPaste(true);
      setError(
        "Browser ne clipboard access nahi diya. Text ko neeche manually paste karein."
      );
      window.setTimeout(() => pasteRef.current?.focus(), 0);
    }
  }

  function startEdit(item: Phrase) {
    setEditId(item.id);
    setEditText(item.phrase);
    setError("");
    setNotice("");
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            WhatsApp Opt-out Phrases
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Incoming reply mein active phrase milne par opt-out process ke liye
            istemal hone wale phrases manage karein.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadPhrases()}
          disabled={loading || saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span className="whitespace-pre-wrap">{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Error band karein"
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <Check size={18} className="shrink-0" />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Notice band karein"
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total phrases</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {phrases.length}
          </p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">Active</p>
          <p className="mt-1 text-2xl font-bold text-green-800">
            {activeCount}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="mt-1 text-2xl font-bold text-gray-700">
            {inactiveCount}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Naya phrase add karein
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Ek phrase add karein ya multiple phrases ko alag-alag lines mein
          paste karein.
        </p>

        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void saveNewPhrase();
          }}
        >
          <input
            value={newPhrase}
            onChange={(event) => setNewPhrase(event.target.value)}
            placeholder="Jaise: Mujhe message mat bhejein"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            disabled={saving || !newPhrase.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Add Phrase
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setShowPaste((old) => !old);
              setError("");
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Clipboard size={16} />
            Multiple phrases paste karein
          </button>
          <button
            type="button"
            onClick={() => void pasteFromClipboard()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Clipboard size={16} />
            Clipboard se paste
          </button>
        </div>

        {showPaste && (
          <div className="mt-4 space-y-3">
            <label
              htmlFor="bulk-phrases"
              className="block text-sm font-medium text-gray-700"
            >
              Har line mein ek phrase
            </label>
            <textarea
              id="bulk-phrases"
              ref={pasteRef}
              value={pasteText}
              onChange={(event) => setPasteText(event.target.value)}
              rows={5}
              placeholder={"Mujhe message mat bhejein\nStop\nDo not message me"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={saving || !pasteText.trim()}
                onClick={() => void addPhrases(pasteText.split(/\r?\n/))}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus size={16} />
                Sabhi phrases add karein
              </button>
              <button
                type="button"
                onClick={() => setPasteText("")}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Clear text
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Saved phrases
            </h2>
            <p className="text-sm text-gray-500">
              {filtered.length} dikh rahe hain · {selected.length} selected
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Phrase search karein"
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 sm:w-64"
              />
            </div>
            <button
              type="button"
              disabled={filtered.length === 0}
              onClick={toggleAllFiltered}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {allFilteredSelected ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
              {allFilteredSelected ? "Deselect all" : "Select all"}
            </button>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-col gap-3 border-b border-blue-100 bg-blue-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selected.length} phrase select kiye gaye
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const chosen = phrases.filter((item) =>
                    selected.includes(item.id)
                  );
                  void copyText(chosen.map((item) => item.phrase).join("\n"));
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-50"
              >
                <Copy size={15} />
                Copy selected
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void deletePhrases(selected)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 size={15} />
                Delete selected
              </button>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-gray-500">
            <LoaderCircle size={20} className="animate-spin" />
            Phrases load ho rahe hain...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-medium text-gray-800">Koi phrase nahi mila</p>
            <p className="mt-1 text-sm text-gray-500">
              Naya phrase add karein ya search badal kar dekhein.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((item) => {
              const isEditing = editId === item.id;
              const isBusy = busyId === item.id;

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 p-4 hover:bg-gray-50 sm:flex-row sm:items-center"
                >
                  <button
                    type="button"
                    onClick={() => toggleSelected(item.id)}
                    aria-label={
                      selected.includes(item.id)
                        ? "Deselect phrase"
                        : "Select phrase"
                    }
                    className="self-start rounded p-1 text-gray-500 hover:text-blue-600 sm:self-center"
                  >
                    {selected.includes(item.id) ? (
                      <CheckSquare size={19} className="text-blue-600" />
                    ) : (
                      <Square size={19} />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          autoFocus
                          value={editText}
                          onChange={(event) => setEditText(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void saveEdit(item.id);
                            }
                            if (event.key === "Escape") {
                              setEditId(null);
                              setEditText("");
                            }
                          }}
                          className="min-w-0 flex-1 rounded-lg border border-blue-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                        />
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void saveEdit(item.id)}
                          className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Check size={15} />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditId(null);
                            setEditText("");
                          }}
                          className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <X size={15} />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="break-words text-sm font-medium text-gray-900">
                          {item.phrase}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span
                            className={`rounded-full px-2 py-0.5 font-medium ${
                              item.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.is_active ? "Active" : "Inactive"}
                          </span>
                          <span>
                            Added{" "}
                            {new Date(item.created_at).toLocaleDateString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <button
                        type="button"
                        title="Phrase copy karein"
                        onClick={() => void copyText(item.phrase)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Copy size={15} />
                        Copy
                      </button>
                      <button
                        type="button"
                        title="Phrase edit karein"
                        onClick={() => startEdit(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button
                        type="button"
                        title={
                          item.is_active ? "Deactivate karein" : "Activate karein"
                        }
                        disabled={isBusy}
                        onClick={() => void toggleActive(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        {item.is_active ? (
                          <ToggleRight size={17} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={17} />
                        )}
                        {item.is_active ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        title="Phrase delete karein"
                        disabled={saving || isBusy}
                        onClick={() => void deletePhrases([item.id])}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-xs leading-5 text-gray-500">
        Dhyan dein: is page par phrase add, edit, disable ya delete karne se
        incoming WhatsApp replies par actual opt-out action tabhi hoga jab
        deployed webhook active phrases ko read karke match kare. Opt-out ho
        chuke contacts ko future promotional campaigns se block karne ke liye
        bulk-send function mein bhi opt-out check zaroori hai.
      </p>
    </main>
  );
}
