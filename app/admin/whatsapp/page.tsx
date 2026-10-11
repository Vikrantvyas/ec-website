
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

// Approximate estimates including GST; verify current Meta rates
// before launching a real campaign.
const ESTIMATED_RATES: Record<string, number> = {
  marketing: 1.02,
  utility: 0.14,
  authentication: 0.14,
  service: 0.14,
};

function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    // Indian 10-digit mobile number
    digits = `91${digits}`;
  } else if (digits.length === 12 && digits.startsWith("91")) {
    // Indian number with country code
    // Keep as-is
  } else {
    return "";
  }

  // Indian mobile numbers should start with 6, 7, 8 or 9
  const indianMobile = digits.slice(2);

  if (!/^[6-9]\d{9}$/.test(indianMobile)) {
    return "";
  }

  return digits;
}

function getTemplateBody(components: unknown): string {
  if (!Array.isArray(components)) return "";

  const body = components.find(
    (item: any) =>
      item?.type?.toUpperCase() === "BODY" && typeof item?.text === "string"
  );

  return body?.text ?? "";
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN");
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [pastedNumbers, setPastedNumbers] = useState("");

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
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
          .filter((row) => normalizePhone(row.mobile_number ?? "").length >= 10)
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
          .select("id, full_name, whatsapp_number, demo_class_time, created_time")
          .order("created_time", { ascending: false })
          .limit(PAGE_SIZE);

        if (queryError) throw queryError;

        const rows: Contact[] = (data ?? [])
          .filter(
            (row) => normalizePhone(row.whatsapp_number ?? "").length >= 10
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
      setError(
        err?.message ||
        "Contacts load nahi hue. Supabase permissions aur connection check karein."
      );
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

        const active = rows.find(
          (item) => item.status?.toLowerCase() === "active"
        );

        return active?.id ?? "";
      });
    } catch (err: any) {
      setError(
        err?.message ||
        "Templates load nahi hue. Template table aur permissions check karein."
      );
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

  const pastedRecipients = useMemo(() => {
    const numbers = pastedNumbers
      .split(/[\n,;]+/)
      .map((value) => normalizePhone(value.trim()))
      .filter((value) => value.length >= 10 && value.length <= 15);

    return Array.from(new Set(numbers));
  }, [pastedNumbers]);
  const selectedContacts = useMemo(
    () => contacts.filter((contact) => selectedIds.includes(contact.id)),
    [contacts, selectedIds]
  );

  const rate =
    ESTIMATED_RATES[selectedTemplate?.category?.toLowerCase() || ""] ?? 1.02;

  const estimatedCost = selectedContacts.length * rate;

  function dedupeContacts(rows: Contact[]) {
    const seen = new Set<string>();

    return rows.filter((contact) => {
      if (!contact.phone || seen.has(contact.phone)) return false;

      seen.add(contact.phone);
      return true;
    });
  }

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

    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  async function handleCreateCampaign() {
    setSuccess("");
    setError("");

    if (!selectedTemplate) {
      setError("Pehle WhatsApp template select karein.");
      return;
    }

    if (selectedTemplate.status?.toLowerCase() !== "active") {
      setError("Selected template Active nahi hai.");
      return;
    }

    const recipients = Array.from(
      new Set([
        ...selectedContacts.map((contact) => contact.phone),
        ...pastedRecipients,
      ]),
    );

    if (recipients.length === 0) {
      setError("Mobile numbers paste karein ya contacts select karein.");
      return;
    }

    if (recipients.length > 100) {
      setError("Ek campaign mein maximum 100 unique numbers bhejein.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: invokeError } =
        await supabase.functions.invoke("whatsapp-bulk-send", {
          body: {
            to: recipients,
            template_name: selectedTemplate.template_name,
            language_code: selectedTemplate.language_code,
          },
        });


      if (invokeError) throw invokeError;

      if (!data?.success) {
        throw new Error(data?.error || "Messages send nahi ho sake.");
      }

      setSuccess(
        `Total: ${data.total ?? 0} | Meta accepted: ${data.accepted ?? 0} | Failed: ${data.failed ?? 0}`,
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Messages send karte waqt error aayi.",
      );
    } finally {
      setLoading(false);
    }
  }

  const bodyText = selectedTemplate
    ? getTemplateBody(selectedTemplate.components)
    : "";

  const templateIsActive =
    selectedTemplate?.status?.toLowerCase() === "active";

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
            Contacts select karein, template preview dekhein aur campaign
            prepare karein.
          </p>
        </div>

        <button
          onClick={() => {
            void loadContacts();
            void loadTemplates();
          }}
          disabled={loading || templateLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading || templateLoading ? "animate-spin" : ""
              }`}
          />
          Refresh
        </button>
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="font-semibold text-amber-900">
              WhatsApp Campaign Ready
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Contacts aur active template verify karein. Send karne se pehle recipients aur template dobara check karein.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {success}
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <section className="min-w-0 rounded-xl border bg-white">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Paste Mobile Numbers
            </h2>
            <textarea
              value={pastedNumbers}
              onChange={(event) => setPastedNumbers(event.target.value)}
              placeholder={"9876543210\n919876543210"}
              rows={5}
              className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
            />
            <p className="mt-2 text-sm text-gray-600">
              Unique valid numbers: {pastedRecipients.length}
            </p>
          </div>
          <div className="border-b p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                1. Select Contacts
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
                  className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
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
                className={`rounded-lg px-4 py-2 text-sm font-medium ${source === "leads"
                  ? "bg-green-600 text-white"
                  : "border bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Enquiries / Leads
              </button>

              <button
                onClick={() => setSource("meta_leads")}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${source === "meta_leads"
                  ? "bg-green-600 text-white"
                  : "border bg-white text-gray-700 hover:bg-gray-50"
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
                      className={`hover:bg-gray-50 ${selectedIds.includes(contact.id) ? "bg-green-50/60" : ""
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
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
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

          <div className="flex flex-col gap-2 border-t p-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredContacts.length} contacts · Loaded {contacts.length}
            </span>
            <span>
              Same normalized mobile number is shown once in this source list.
            </span>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              2. Choose Template
            </h2>

            <label className="mt-4 block text-sm font-medium text-gray-700">
              WhatsApp template
            </label>
            <select
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
              disabled={templateLoading}
              className="mt-2 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600"
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
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {selectedTemplate.category}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${templateIsActive
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
                  <div className="max-w-full rounded-xl border border-green-100 bg-white p-3 shadow-sm">
                    <p className="mb-2 text-xs font-semibold text-green-700">
                      {selectedTemplate.template_name}
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm text-gray-800">
                      {bodyText ||
                        "Template body available nahi hai. Components data check karein."}
                    </p>
                    <p className="mt-3 text-right text-[10px] text-gray-400">
                      Template preview
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Preview ke liye template select karein.
                  </p>
                )}
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Variables ka final preview actual send integration mein
                recipient-specific values ke saath banega.
              </p>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              3. Campaign Summary
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <SummaryRow label="Source" value={source === "leads" ? "Enquiries / Leads" : "Meta Ads Leads"} />
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
              Cost is indicative, not a Meta quote. Actual charges depend on
              category, recipient country, current pricing and applicable taxes.
            </p>

            <button
              onClick={async () => {
                setError("");
                setSuccess("");

                if (!selectedTemplate) {
                  setError("Pehle WhatsApp template select karein.");
                  return;
                }

                if (selectedTemplate.status?.toLowerCase() !== "active") {
                  setError("Selected template Active nahi hai.");
                  return;
                }

                const recipients = Array.from(
                  new Set([
                    ...selectedContacts.map((contact) => contact.phone),
                    ...pastedRecipients,
                  ]),
                );

                if (recipients.length === 0) {
                  setError("Pehle mobile numbers paste karein ya contacts select karein.");
                  return;
                }

                if (recipients.length > 100) {
                  setError("Ek campaign mein maximum 100 unique numbers bhejein.");
                  return;
                }

                setLoading(true);

                try {
                  const { data, error } = await supabase.functions.invoke(
                    "whatsapp-bulk-send",
                    {
                      body: {
                        to: [],
                        template_name: selectedTemplate.template_name,
                        language_code: selectedTemplate.language_code,
                        auth_test_only: true,
                      },
                    },
                  );

                  if (error) throw error;

                  if (!data?.success) {
                    throw new Error(data?.error || "Message sending failed.");
                  }

                  setSuccess(
                    data.message ||
                    "Test successful. No WhatsApp messages sent.",
                  );
                } catch (err: unknown) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Test failed.",
                  );
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Send WhatsApp Messages
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              Clicking this button will send the selected template to all valid recipients.
            </p>
          </section>
        </div>
      </div>

      <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
        <div className="flex gap-2">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
          <p>
            <strong>Important:</strong> Is initial UI mein source tables se
            contacts load hote hain aur same normalized number har source list
            mein ek baar dikhaya jata hai. Consent status abhi in source tables
            se verify nahi hota. Real campaign se pehle global opt-out filtering,
            server-side authorization, recipient eligibility aur delivery-status
            tracking connect karna zaroori hai.
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
        <div className="rounded-lg bg-green-50 p-2 text-green-700">{icon}</div>
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
