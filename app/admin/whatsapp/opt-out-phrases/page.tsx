
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
  UserRound,
  ShieldCheck,
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

type OptOutContact = {
  id: string;
  name: string | null;
  phone_number: string;
  consent_status: string | null;
  consent_source: string | null;
  consent_at: string | null;
  updated_at: string | null;
  campaign_name?: string | null;
  campaign_date?: string | null;
  opt_out_message?: string | null;
  opt_out_received_at?: string | null;
};

type InboundMessage = { contact_id: string | null; phone_number: string; message_text: string | null; received_at: string };
type CampaignRecipient = { contact_id: string | null; campaign_id: string; sent_at: string | null; created_at: string };
type Campaign = { id: string; name: string; created_at: string; started_at: string | null };

const BLOCKED_STATUSES = ["opted_out", "optout", "unsubscribed", "stopped", "blocked"];

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }
  return "Koi anjaan error aa gaya.";
}

export default function WhatsAppOptOutPhrasesPage() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [optOutContacts, setOptOutContacts] = useState<OptOutContact[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsSaving, setContactsSaving] = useState(false);
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

  const loadOptOutContacts = useCallback(async () => {
    setContactsLoading(true);
    const { data, error: queryError } = await supabase
      .from("whatsapp_contacts")
      .select("id, name, phone_number, consent_status, consent_source, consent_at, updated_at")
      .in("consent_status", BLOCKED_STATUSES)
      .order("updated_at", { ascending: false });

    if (queryError) {
      setError(`Opt-out contacts load nahi hue: ${queryError.message}`);
      setOptOutContacts([]);
      setContactsLoading(false);
      return;
    }

    const contacts = (data ?? []) as OptOutContact[];
    if (contacts.length === 0) {
      setOptOutContacts([]);
      setContactsLoading(false);
      return;
    }

    // Each opted-out contact ke latest incoming reply aur usse pehle bheje gaye campaign ko match karein.
    const ids = contacts.map((item) => item.id);
    const phones = [...new Set(contacts.map((item) => item.phone_number))];
    const [{ data: inboundData }, { data: recipientData }] = await Promise.all([
      supabase.from("whatsapp_inbound_messages")
        .select("contact_id, phone_number, message_text, received_at")
        .in("contact_id", ids)
        .order("received_at", { ascending: false }),
      supabase.from("whatsapp_campaign_recipients")
        .select("contact_id, campaign_id, sent_at, created_at")
        .in("contact_id", ids)
        .order("sent_at", { ascending: false }),
    ]);

    const inbound = (inboundData ?? []) as InboundMessage[];
    const recipients = (recipientData ?? []) as CampaignRecipient[];
    const campaignIds = [...new Set(recipients.map((r) => r.campaign_id))];
    let campaigns: Campaign[] = [];
    if (campaignIds.length) {
      const { data: campaignData } = await supabase.from("whatsapp_campaigns")
        .select("id, name, created_at, started_at")
        .in("id", campaignIds);
      campaigns = (campaignData ?? []) as Campaign[];
    }

    const enriched = contacts.map((contact) => {
      const reply = inbound.find((m) => m.contact_id === contact.id) ??
        inbound.find((m) => m.phone_number.replace(/\D/g, "").slice(-10) === contact.phone_number.replace(/\D/g, "").slice(-10));
      const replyTime = reply ? new Date(reply.received_at).getTime() : Number.POSITIVE_INFINITY;
      const matchingRecipients = recipients
        .filter((r) => r.contact_id === contact.id)
        .filter((r) => !r.sent_at || new Date(r.sent_at).getTime() <= replyTime)
        .sort((a, b) => new Date(b.sent_at ?? b.created_at).getTime() - new Date(a.sent_at ?? a.created_at).getTime());
      const recipient = matchingRecipients[0];
      const campaign = recipient ? campaigns.find((c) => c.id === recipient.campaign_id) : undefined;
      return {
        ...contact,
        campaign_name: campaign?.name ?? null,
        campaign_date: recipient?.sent_at ?? campaign?.started_at ?? campaign?.created_at ?? null,
        opt_out_message: reply?.message_text ?? null,
        opt_out_received_at: reply?.received_at ?? null,
      };
    });
    setOptOutContacts(enriched);
    setContactsLoading(false);
  }, []);

  useEffect(() => {
    void loadPhrases();
    void loadOptOutContacts();
  }, [loadPhrases, loadOptOutContacts]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return phrases;
    return phrases.filter((item) =>
      item.phrase.toLocaleLowerCase().includes(term)
    );
  }, [phrases, search]);

  const filteredContacts = useMemo(() => {
    const term = contactSearch.trim().toLocaleLowerCase();
    if (!term) return optOutContacts;
    return optOutContacts.filter((item) =>
      `${item.name ?? ""} ${item.phone_number}`.toLocaleLowerCase().includes(term)
    );
  }, [optOutContacts, contactSearch]);
  const allFilteredContactsSelected =
    filteredContacts.length > 0 && filteredContacts.every((item) => selectedContacts.includes(item.id));

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

  function toggleContactSelected(id: string) {
    setSelectedContacts((old) =>
      old.includes(id) ? old.filter((value) => value !== id) : [...old, id]
    );
  }

  function toggleAllFilteredContacts() {
    if (allFilteredContactsSelected) {
      setSelectedContacts((old) => old.filter((id) => !filteredContacts.some((item) => item.id === id)));
    } else {
      setSelectedContacts((old) => [...new Set([...old, ...filteredContacts.map((item) => item.id)])]);
    }
  }

  async function reactivateSelectedContacts() {
    const chosen = optOutContacts.filter((item) => selectedContacts.includes(item.id));
    if (chosen.length === 0) return;

    const confirmation = `Aapne confirm kiya hai ki in ${chosen.length} contact(s) se written consent mil chuki hai?\n\n${chosen.map((item) => `${item.name || "Naam nahi"} — ${item.phone_number}`).join("\n")}\n\nSirf written consent verify karne ke baad hi OK karein.`;
    if (!window.confirm(confirmation)) return;

    setContactsSaving(true);
    setError("");
    setNotice("");

    const phoneVariants = [...new Set(chosen.flatMap((item) => {
      const digits = item.phone_number.trim();
      const withoutPlus = digits.startsWith("+") ? digits.slice(1) : digits;
      return [digits, withoutPlus, `+${withoutPlus}`];
    }))];
    const contactIds = chosen.map((item) => item.id);
    const now = new Date().toISOString();

    // Meta lead flag ko bhi clear karein; bulk-send checker dono tables dekhta hai.
    const { error: leadsError } = await supabase
      .from("meta_leads")
      .update({ whatsapp_opted_out: false })
      .in("whatsapp_number", phoneVariants);

    if (leadsError) {
      setContactsSaving(false);
      setError(`Meta leads ka opt-out flag clear nahi hua: ${leadsError.message}. Contacts ko opted-out hi rakha gaya hai.`);
      return;
    }

    const { error: contactsError } = await supabase
      .from("whatsapp_contacts")
      .update({
        consent_status: "opted_in",
        consent_source: "manual_written_consent",
        consent_at: now,
        updated_at: now,
      })
      .in("id", contactIds);

    setContactsSaving(false);

    if (contactsError) {
      setError(`Meta leads flag clear ho gaya, lekin contact status update nahi hua: ${contactsError.message}. Is number ko abhi opted-out samjhein aur database status verify karein.`);
      await loadOptOutContacts();
      return;
    }

    setSelectedContacts([]);
    showNotice(`${chosen.length} contact(s) ko opted-in mark kiya gaya. Written consent record aap apne paas surakshit rakhein.`);
    await loadOptOutContacts();
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
          
        </div>

        <button
          type="button"
          onClick={() => { void loadPhrases(); void loadOptOutContacts(); }}
          disabled={loading || saving || contactsLoading || contactsSaving}
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
          Add new phrase        </h2>
      
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

      <section className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-amber-100 bg-amber-50 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <ShieldCheck size={20} className="text-amber-700" />
              Opt-out contacts
            </h2>
            
            <p className="mt-1 text-sm font-medium text-amber-800">
              {filteredContacts.length} Records · {selectedContacts.length} selected · Total {optOutContacts.length} opted-out
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={contactSearch}
                onChange={(event) => setContactSearch(event.target.value)}
                placeholder="Naam ya WhatsApp number search"
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 sm:w-64"
              />
            </div>
            <button
              type="button"
              onClick={() => void loadOptOutContacts()}
              disabled={contactsLoading || contactsSaving}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={15} className={contactsLoading ? "animate-spin" : ""} /> Refresh list
            </button>
          </div>
        </div>

        {selectedContacts.length > 0 && (
          <div className="flex flex-col gap-3 border-b border-amber-100 bg-amber-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-gray-800">{selectedContacts.length} contact(s) selected</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void reactivateSelectedContacts()}
                disabled={contactsSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
              >
                {contactsSaving ? <LoaderCircle size={15} className="animate-spin" /> : <UserRound size={15} />}
                Written consent verified — Remove opt-out
              </button>
              <button
                type="button"
                onClick={() => setSelectedContacts([])}
                disabled={contactsSaving}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >Clear selection</button>
            </div>
          </div>
        )}

        {contactsLoading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500">
            <LoaderCircle size={20} className="animate-spin" /> Opt-out contacts load ho rahe hain...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-800">Koi opted-out contact nahi mila</p>
            <p className="mt-1 text-sm text-gray-500">Search badal kar dekhein ya list refresh karein.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <span className="text-sm text-gray-600">Contact list</span>
              <button
                type="button"
                onClick={toggleAllFilteredContacts}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {allFilteredContactsSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                {allFilteredContactsSelected ? "Deselect all" : "Select all shown"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
                  <tr>
                    <th className="w-12 px-3 py-3">Select</th>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">WhatsApp number</th>
                    <th className="px-3 py-3">Campaign</th>
                    <th className="px-3 py-3">Campaign date</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Reply</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredContacts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <button type="button" onClick={() => toggleContactSelected(item.id)}
                          aria-label={selectedContacts.includes(item.id) ? "Deselect contact" : "Select contact"}
                          className="rounded p-1 text-gray-500 hover:text-blue-600">
                          {selectedContacts.includes(item.id) ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                        </button>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900">{item.name?.trim() || "Naam available nahi"}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-700">{item.phone_number}</td>
                      <td className="px-3 py-3">{item.campaign_name || <span className="text-gray-400">Campaign nahi mila</span>}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-600">{item.campaign_date ? new Date(item.campaign_date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}</td>
                      <td className="px-3 py-3"><span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">{item.consent_status || "opted_out"}</span></td>
                      <td className="max-w-xs px-3 py-3 text-gray-600" title={item.opt_out_message ?? ""}><span className="line-clamp-2">{item.opt_out_message || "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="border-t border-amber-100 bg-amber-50/60 p-4 text-xs leading-5 text-gray-600">
          Important: button dabane par confirmation maangi jayegi. Written consent pehle manually verify karein. Agar database RLS policy update ko rokegi, page error dikhayega; service-role key browser mein kabhi add na karein.
        </div>
      </section>

    </main>
  );
}
