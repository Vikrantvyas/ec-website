
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  MessageCircle,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  FileText,
  Filter,
  ShieldAlert,
  Plus,
  X,
  LoaderCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Source = "leads" | "meta_leads";

type Contact = {
  id: string;
  name: string;
  phone: string;
  course: string;
  date: string;
  source: Source;
};

type Template = {
  id: string;
  template_name: string;
  language_code: string;
  category: string;
  status: string;
  components: unknown;
};

const PAGE_SIZE = 500;

const ESTIMATED_RATES: Record<string, number> = {
  marketing: 1.02,
  utility: 0.14,
  authentication: 0.14,
  service: 0.14,
};

function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  return digits;
}

function getTemplateBody(components: unknown): string {
  if (!Array.isArray(components)) return "";
  const body = components.find(
    (item: any) =>
      item?.type?.toUpperCase() === "BODY" &&
      typeof item?.text === "string"
  );
  return body?.text ?? "";
}

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN");
}

function dedupeContacts(rows: Contact[]) {
  const seen = new Set<string>();
  return rows.filter((contact) => {
    if (!contact.phone || seen.has(contact.phone)) return false;
    seen.add(contact.phone);
    return true;
  });
}

function getErrorMessage(error: any) {
  return (
    error?.context?.error ||
    error?.message ||
    "Request fail hua. Function logs check karein."
  );
}

export default function WhatsAppBulkPage() {
  const [source, setSource] = useState<Source>("leads");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newName, setNewName] = useState("");
  const [newLanguage, setNewLanguage] = useState("en_US");
  const [newCategory, setNewCategory] = useState("MARKETING");
  const [newBody, setNewBody] = useState("");
  const [newFooter, setNewFooter] = useState("");

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError("");
    setSelectedIds([]);

    try {
      if (source === "leads") {
        const { data, error: queryError } = await supabase
          .from("leads")
          .select("id, student_name, mobile_number, course, enquiry_date")
          .order("enquiry_date", { ascending: false })
          .limit(PAGE_SIZE);

        if (queryError) throw queryError;

        const rows: Contact[] = (data ?? [])
          .filter(
            (row) => normalizePhone(row.mobile_number ?? "").length >= 10
          )
          .map((row) => ({
            id: String(row.id),
            name: row.student_name || "Name not available",
            phone: normalizePhone(row.mobile_number ?? ""),
            course: row.course || "—",
            date: row.enquiry_date || "",
            source: "leads",
          }));

        setContacts(dedupeContacts(rows));
      } else {
        const { data, error: queryError } = await supabase
          .from("meta_leads")
          .select(
            "id, full_name, whatsapp_number, demo_class_time, created_time"
          )
          .order("created_time", { ascending: false })
          .limit(PAGE_SIZE);

        if (queryError) throw queryError;

        const rows: Contact[] = (data ?? [])
          .filter(
            (row) =>
              normalizePhone(row.whatsapp_number ?? "").length >= 10
          )
          .map((row) => ({
            id: String(row.id),
            name: row.full_name || "Name not available",
            phone: normalizePhone(row.whatsapp_number ?? ""),
            course: row.demo_class_time || "—",
            date: row.created_time || "",
            source: "meta_leads",
          }));

        setContacts(dedupeContacts(rows));
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [source]);

  const loadTemplates = useCallback(async () => {
    setTemplateLoading(true);

    try {
      const { data, error: queryError } = await supabase
        .from("whatsapp_templates")
        .select(
          "id, template_name, language_code, category, status, components"
        )
        .order("template_name");

      if (queryError) throw queryError;

      const rows = (data ?? []) as Template[];
      setTemplates(rows);

      setTemplateId((current) => {
        if (current && rows.some((item) => item.id === current)) {
          return current;
        }
        return (
          rows.find((item) => item.status?.toLowerCase() === "active")?.id ??
          ""
        );
      });
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setTemplateLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const selectedTemplate = templates.find(
    (item) => item.id === templateId
  );

  const filteredContacts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return contacts.filter((contact) => {
      const matchesSearch =
        !term ||
        contact.name.toLowerCase().includes(term) ||
        contact.phone.includes(term) ||
        contact.course.toLowerCase().includes(term);

      const matchesSelection =
        !showSelectedOnly || selectedIds.includes(contact.id);

      return matchesSearch && matchesSelection;
    });
  }, [contacts, search, showSelectedOnly, selectedIds]);

  const selectedContacts = useMemo(
    () => contacts.filter((contact) => selectedIds.includes(contact.id)),
    [contacts, selectedIds]
  );

  const rate =
    ESTIMATED_RATES[selectedTemplate?.category?.toLowerCase() || ""] ??
    1.02;
  const estimatedCost = selectedContacts.length * rate;
  const bodyText = selectedTemplate
    ? getTemplateBody(selectedTemplate.components)
    : "";
  const templateIsActive =
    selectedTemplate?.status?.toLowerCase() === "active";

  function toggleContact(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleVisibleContacts() {
    const visibleIds = filteredContacts.map((item) => item.id);
    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    );
  }

  async function refreshFromMeta() {
    setError("");
    setSuccess("");
    setTemplateLoading(true);

    try {
      const { data, error: invokeError } =
        await supabase.functions.invoke("whatsapp-templates", {
          body: { action: "list" },
        });

      if (invokeError) {
        throw new Error(
          data?.error || getErrorMessage(invokeError)
        );
      }

      if (!data?.success) {
        throw new Error(data?.error || "Meta template sync fail hua.");
      }

      await loadTemplates();
      setSuccess(
        `Meta se ${data.count ?? 0} templates sync hue.`
      );
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setTemplateLoading(false);
    }
  }

  async function submitNewTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = newName.trim();
    const body = newBody.trim();

    if (!/^[a-z0-9_]{1,512}$/.test(name)) {
      setError(
        "Template name mein sirf lowercase letters, numbers aur underscore (_) use karein."
      );
      return;
    }

    if (!body) {
      setError("Template message khaali nahi ho sakta.");
      return;
    }

    const components: Array<Record<string, string>> = [
      { type: "BODY", text: body },
    ];

    if (newFooter.trim()) {
      components.push({
        type: "FOOTER",
        text: newFooter.trim(),
      });
    }

    setCreatingTemplate(true);

    try {
      const { data, error: invokeError } =
        await supabase.functions.invoke("whatsapp-templates", {
          body: {
            action: "create",
            name,
            language: newLanguage,
            category: newCategory,
            components,
          },
        });

      if (invokeError) {
        throw new Error(
          data?.error || getErrorMessage(invokeError)
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.error || "Meta ne template submission accept nahi ki."
        );
      }

      setSuccess(
        "Template Meta ko submit ho gaya. Approval status ke liye Refresh Templates dabayein."
      );
      setShowTemplateForm(false);
      setNewName("");
      setNewBody("");
      setNewFooter("");

      await loadTemplates();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setCreatingTemplate(false);
    }
  }

  function handleCreateCampaign() {
    setSuccess("");
    setError("");

    if (selectedContacts.length === 0) {
      setError("Pehle kam se kam ek contact select karein.");
      return;
    }

    if (!selectedTemplate) {
      setError("Pehle WhatsApp template select karein.");
      return;
    }

    if (!templateIsActive) {
      setError("Selected template Active nahi hai.");
      return;
    }

    setError(
      "Campaign abhi send nahi ki gayi. Consent/Opt-out filtering aur secure sending endpoint verify hone ke baad sending enable hogi."
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-7 w-7 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              WhatsApp Bulk Messaging
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Contacts, templates aur campaign ko ek hi dashboard se manage karein.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowTemplateForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </button>

          <button
            onClick={() => {
              void loadContacts();
              void loadTemplates();
            }}
            disabled={loading || templateLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {showTemplateForm && (
        <div className="rounded-xl border border-green-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Create WhatsApp Template
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Submit karne par template Meta approval ke liye jayega.
              </p>
            </div>
            <button
              onClick={() => setShowTemplateForm(false)}
              className="rounded-lg p-2 hover:bg-gray-100"
              aria-label="Close template form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={submitNewTemplate}
            className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Template Name
              </label>
              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value.toLowerCase())}
                placeholder="ec_course_information"
                required
                pattern="[a-z0-9_]+"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-green-600"
              />
              <p className="mt-1 text-xs text-gray-500">
                Lowercase letters, numbers aur underscores.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                value={newLanguage}
                onChange={(event) => setNewLanguage(event.target.value)}
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm"
              >
                <option value="en_US">English (US) — en_US</option>
                <option value="en">English — en</option>
                <option value="hi">Hindi — hi</option>
                <option value="hi_IN">Hindi (India) — hi_IN</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm"
              >
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utility</option>
                <option value="AUTHENTICATION">Authentication</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Message Body
              </label>
              <textarea
                value={newBody}
                onChange={(event) => setNewBody(event.target.value)}
                placeholder="Hello! Welcome to English Club..."
                required
                rows={5}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-green-600"
              />
              <p className="mt-1 text-xs text-gray-500">
                Pehle simple text template banayein. Variables aur media
                headers ki advanced support baad mein add kar sakte hain.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Footer (optional)
              </label>
              <input
                value={newFooter}
                onChange={(event) => setNewFooter(event.target.value)}
                placeholder="English Club"
                maxLength={60}
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2 md:col-span-2">
              <button
                type="submit"
                disabled={creatingTemplate}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {creatingTemplate ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {creatingTemplate ? "Submitting..." : "Submit for Approval"}
              </button>
              <button
                type="button"
                onClick={() => setShowTemplateForm(false)}
                className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="font-semibold text-amber-900">
              Campaign sending abhi disabled hai
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Template create aur sync ki facility available hai. Actual bulk
              sending tab enable hogi jab authentication, consent/Opt-out
              filtering aur delivery tracking verify ho jayenge.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Unique contacts loaded"
          value={contacts.length.toLocaleString("en-IN")}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Selected contacts"
          value={selectedContacts.length.toLocaleString("en-IN")}
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Templates available"
          value={templates.length.toLocaleString("en-IN")}
        />
        <StatCard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Estimated campaign cost"
          value={`₹${estimatedCost.toFixed(2)}`}
        />
      </div>

      <section className="rounded-xl border bg-white">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Template Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Meta se latest templates aur approval status sync karein.
            </p>
          </div>
          <button
            onClick={refreshFromMeta}
            disabled={templateLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${templateLoading ? "animate-spin" : ""}`}
            />
            Refresh Templates
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Meta Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    {templateLoading
                      ? "Templates load ho rahe hain..."
                      : "Templates nahi mile. Refresh Templates dabayein."}
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {template.template_name}
                    </td>
                    <td className="px-4 py-3">{template.language_code}</td>
                    <td className="px-4 py-3 capitalize">{template.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          template.status.toLowerCase() === "active"
                            ? "bg-green-100 text-green-800"
                            : template.status.toLowerCase() === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {template.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <section className="min-w-0 rounded-xl border bg-white">
          <div className="border-b p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Select Contacts
              </h2>
              <span className="text-xs text-gray-500">
                Maximum {PAGE_SIZE} source records loaded per selection
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, mobile ya course search karein..."
                  className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-green-600"
                />
              </div>
              <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <Filter className="h-4 w-4 text-gray-500" />
                <input
                  type="checkbox"
                  checked={showSelectedOnly}
                  onChange={(event) =>
                    setShowSelectedOnly(event.target.checked)
                  }
                  className="accent-green-600"
                />
                Selected only
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSource("leads")}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  source === "leads"
                    ? "bg-green-600 text-white"
                    : "border bg-white text-gray-700"
                }`}
              >
                Enquiries / Leads
              </button>
              <button
                onClick={() => setSource("meta_leads")}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  source === "meta_leads"
                    ? "bg-green-600 text-white"
                    : "border bg-white text-gray-700"
                }`}
              >
                Meta Ads Leads
              </button>
              <button
                onClick={toggleVisibleContacts}
                disabled={filteredContacts.length === 0}
                className="ml-auto rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Select / deselect visible
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="w-10 px-4 py-3">Select</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Course / Info</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      Contacts load ho rahe hain...
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      Koi contact nahi mila.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr
                      key={`${contact.source}-${contact.id}`}
                      className={`hover:bg-gray-50 ${
                        selectedIds.includes(contact.id) ? "bg-green-50/60" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(contact.id)}
                          onChange={() => toggleContact(contact.id)}
                          className="h-4 w-4 accent-green-600"
                          aria-label={`Select ${contact.name}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {contact.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        +{contact.phone}
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-gray-600">
                        {contact.course}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                        {formatDate(contact.date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t p-4 text-xs text-gray-500 sm:flex-row sm:justify-between">
            <span>
              Showing {filteredContacts.length} · Loaded {contacts.length}
            </span>
            <span>
              Duplicate normalized numbers are hidden within the selected source.
            </span>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Choose Template
            </h2>

            <label className="mt-4 block text-sm font-medium text-gray-700">
              WhatsApp template
            </label>
            <select
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
              disabled={templateLoading}
              className="mt-2 w-full rounded-lg border bg-white px-3 py-2.5 text-sm"
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.template_name} · {template.language_code} ·{" "}
                  {template.status}
                </option>
              ))}
            </select>

            {selectedTemplate && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize">
                  {selectedTemplate.category}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    templateIsActive
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedTemplate.status}
                </span>
              </div>
            )}

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Eye className="h-4 w-4" />
                Message Preview
              </div>
              <div className="min-h-32 rounded-xl bg-[#e8f5e9] p-4">
                {selectedTemplate ? (
                  <div className="rounded-xl border border-green-100 bg-white p-3 shadow-sm">
                    <p className="mb-2 text-xs font-semibold text-green-700">
                      {selectedTemplate.template_name}
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm text-gray-800">
                      {bodyText || "Template body available nahi hai."}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Preview ke liye template select karein.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Campaign Summary
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <SummaryRow
                label="Source"
                value={
                  source === "leads" ? "Enquiries / Leads" : "Meta Ads Leads"
                }
              />
              <SummaryRow
                label="Selected recipients"
                value={selectedContacts.length.toLocaleString("en-IN")}
              />
              <SummaryRow
                label="Template"
                value={selectedTemplate?.template_name || "Not selected"}
              />
              <SummaryRow
                label="Estimated rate / message"
                value={`₹${rate.toFixed(2)}`}
              />
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-semibold text-gray-900">
                  Estimated total
                </span>
                <span className="text-xl font-bold text-green-700">
                  ₹{estimatedCost.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-gray-500">
              Cost indicative hai. Actual charges template category, country,
              current Meta pricing aur taxes par depend karte hain.
            </p>

            <button
              onClick={handleCreateCampaign}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
              Validate Campaign
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              Yeh button selection validate karta hai; messages send nahi karta.
            </p>
          </section>
        </div>
      </div>

      <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
        <div className="flex gap-2">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <strong>Important:</strong> Contact list abhi consent/Opt-out status
            verify nahi karti. Bulk sending tab tak disabled rahegi jab tak
            opted-out contacts ko exclude karna, server-side authorization aur
            delivery tracking verify nahi ho jaate.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-green-50 p-2 text-green-700">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 break-words text-xl font-bold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className="max-w-[60%] break-words text-right font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
}
