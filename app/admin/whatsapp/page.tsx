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

type CampaignRole = {
  role_id: string;
  role_name: string;
};
type CampaignProgress = {
  id: string;
  name: string;
  status: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  total_recipients: number;
  accepted_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  queued_count: number;
  sending_count: number;
};
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
function getPhoneDigits(value: string) {
  return String(value || "").replace(/\D/g, "");
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
function formatDuration(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}
export default function WhatsAppBulkPage() {
  const [source, setSource] = useState<Source>("meta_leads");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [availableRoles, setAvailableRoles] = useState<CampaignRole[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState("");

  const [campaignName, setCampaignName] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [pastedNumbers, setPastedNumbers] = useState("");
  const [excludedNumbers, setExcludedNumbers] = useState("");
  const [importedMetaContacts, setImportedMetaContacts] = useState<Contact[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState("");
  const [campaignProgress, setCampaignProgress] =
    useState<CampaignProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressClosed, setProgressClosed] = useState(false);
  const loadContacts = useCallback(() => {
    setContacts(importedMetaContacts);
    setSelectedIds((current) => {
      const validIds = new Set(importedMetaContacts.map((contact) => contact.id));
      return current.filter((id) => validIds.has(id));
    });
  }, [importedMetaContacts]);
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
  const loadRoles = useCallback(async () => {
    setRolesLoading(true);

    try {
      const { data, error: queryError } = await supabase.rpc(
        "get_whatsapp_available_roles"
      );

      if (queryError) throw queryError;

      setAvailableRoles((data ?? []) as CampaignRole[]);
    } catch (err: any) {
      setError(err?.message || "Roles load nahi ho sake.");
    } finally {
      setRolesLoading(false);
    }
  }, []);
  useEffect(() => {
    try {
      const leadKey = "ec_lead_list_selected_leads";
      const metaKey = "ec_meta_report_selected_leads";

      const leadSaved = sessionStorage.getItem(leadKey);
      const metaSaved = sessionStorage.getItem(metaKey);

      const saved = leadSaved || metaSaved;
      if (!saved) return;

      const importedSource: Source = leadSaved ? "leads" : "meta_leads";

      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) return;
      const rawItems = parsed.filter(
        (item: any) =>
          item &&
          typeof item.id === "string" &&
          typeof item.phone === "string"
      );

      const phoneStats = {
        totalRecords: parsed.length,
        validRecords: rawItems.length,
        tenDigitNumbers: 0,
        twelveDigitNumbers: 0,
        otherLengthNumbers: 0,
        validIndianMobiles: 0,
        rejectedNumbers: 0,
      };
      const lengthBreakdown: Record<string, number> = {};
      rawItems.forEach((item: any) => {
        const digits = getPhoneDigits(item.phone);
        const key = `${digits.length} digits | starts with ${digits.slice(0, 3) || "blank"}`;
        lengthBreakdown[key] = (lengthBreakdown[key] || 0) + 1;
        if (digits.length === 10) {
          phoneStats.tenDigitNumbers++;
        } else if (digits.length === 12 && digits.startsWith("91")) {
          phoneStats.twelveDigitNumbers++;
        } else {
          phoneStats.otherLengthNumbers++;
        }

        if (normalizePhone(item.phone)) {
          phoneStats.validIndianMobiles++;
        } else {
          phoneStats.rejectedNumbers++;
        }
      });

      console.table(phoneStats);
      console.table(lengthBreakdown);
      const imported: Contact[] = parsed
        .filter(
          (item: any) =>
            item &&
            typeof item.id === "string" &&
            typeof item.phone === "string"
        )
        .map((item: any) => ({
          id: item.id,
          name:
            typeof item.name === "string" && item.name
              ? item.name
              : "Name not available",
          phone: normalizePhone(item.phone),
          course:
            typeof item.course === "string" && item.course
              ? item.course
              : "—",
          date:
            typeof item.date === "string"
              ? item.date
              : "",
          source: importedSource,
        }))
        .filter((item) => item.phone.length >= 10);

      if (imported.length) {
        setImportedMetaContacts(imported);
        setContacts(imported);
        setSelectedIds(imported.map((item) => item.id));
        setSource(importedSource);

        setSuccess(
          importedSource === "leads"
            ? `${imported.length} CRM Lead List contact(s) import hue.`
            : `${imported.length} Meta Ads lead(s) report se select kiye gaye.`
        );
      }

      sessionStorage.removeItem(leadKey);
      sessionStorage.removeItem(metaKey);
    } catch {
      setError("Selected contacts read nahi ho sake.");
    }
  }, []);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);
  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);
  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);
  // Restore active campaign after page refresh
  useEffect(() => {
    const savedCampaignId = sessionStorage.getItem(
      "ec_whatsapp_active_campaign_id"
    );

    if (savedCampaignId) {
      setActiveCampaignId(savedCampaignId);
    }
  }, []);

  // Fetch campaign progress every 5 seconds
  useEffect(() => {
    if (!activeCampaignId || campaignProgress?.status === "completed") return;
    let isActive = true;
    let isFetching = false;

    const fetchProgress = async () => {
      if (isFetching) return;

      isFetching = true;

      try {
        setProgressLoading(true);

        const { data: campaign, error: campaignError } = await supabase
          .from("whatsapp_campaigns")
          .select(
            "id, name, status, created_at, started_at, completed_at, total_recipients, accepted_count, delivered_count, read_count, failed_count"
          )
          .eq("id", activeCampaignId)
          .maybeSingle();

        if (campaignError) throw campaignError;
        if (!campaign) throw new Error("Campaign record nahi mili.");

        const [queuedResult, sendingResult] = await Promise.all([
          supabase
            .from("whatsapp_campaign_recipients")
            .select("id", { count: "exact", head: true })
            .eq("campaign_id", activeCampaignId)
            .eq("status", "queued"),

          supabase
            .from("whatsapp_campaign_recipients")
            .select("id", { count: "exact", head: true })
            .eq("campaign_id", activeCampaignId)
            .eq("status", "sending"),
        ]);

        if (queuedResult.error) throw queuedResult.error;
        if (sendingResult.error) throw sendingResult.error;

        if (!isActive) return;

        setCampaignProgress({
          ...campaign,
          queued_count: queuedResult.count ?? 0,
          sending_count: sendingResult.count ?? 0,
        });
      } catch (err: any) {
        if (isActive) {
          console.error("Campaign progress error:", err.message);
        }
      } finally {
        isFetching = false;

        if (isActive) {
          setProgressLoading(false);
        }
      }
    };

    void fetchProgress();

    const interval = window.setInterval(() => {
      void fetchProgress();
    }, 5000);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [activeCampaignId, campaignProgress?.status]);
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
  const excludedRecipients = useMemo(() => {
    const numbers = excludedNumbers
      .split(/[\n,;]+/)
      .map((value) => normalizePhone(value.trim()))
      .filter(Boolean);
    return new Set(numbers);
  }, [excludedNumbers]);
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
    if (selectedRoleIds.length === 0) {
      setError("Campaign ke liye kam se kam ek Role select karein.");
      return;
    }

    if (rolesLoading || availableRoles.length === 0) {
      setError("Roles abhi load nahi hue. Refresh karke dobara try karein.");
      return;
    }
    if (!campaignName.trim()) {
      setError("Campaign Name bharna zaroori hai.");
      return;
    }
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
    ).filter((phone) => !excludedRecipients.has(phone));
    const structuredRecipients = recipients.map((phone) => {
      const contact = selectedContacts.find((item) => item.phone === phone);
      return {
        phone,
        source_type: contact?.source ?? "manual",
        source_record_id: contact?.id ?? null,
      };
    });
    if (recipients.length === 0) {
      setError("Mobile numbers paste karein ya contacts select karein.");
      return;
    }


    setLoading(true);


    try {
      setSuccess("Campaign queue mein add ho rahi hai...");

      const { data, error: invokeError } =
        await supabase.functions.invoke("whatsapp-bulk-send", {
          body: {
            to: recipients,
            recipients: structuredRecipients,
            campaign_name: campaignName.trim(),
            template_id: selectedTemplate.id,
            role_ids: selectedRoleIds,
            template_name: selectedTemplate.template_name,
            language_code: selectedTemplate.language_code,
          },
        });

      if (invokeError) {
        const details = await (invokeError as any).context?.json?.()
          .catch(() => null);

        throw new Error(
          details?.error || details?.message || invokeError.message
        );
      }

      if (!data?.success || !data?.campaign_id) {
        throw new Error(data?.error || "Campaign queue create nahi hui.");
      }
      setActiveCampaignId(data.campaign_id);
      sessionStorage.setItem("ec_whatsapp_active_campaign_id", data.campaign_id);
      setCampaignProgress(null);
      setProgressClosed(false);
      setSuccess(
        `Campaign queue mein successfully add ho gayi. ` +
        `Campaign ID: ${data.campaign_id} | ` +
        `Total recipients: ${data.queued ?? data.total ?? recipients.length}`
      );

    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Campaign creation failed."
      );
    } finally {
      setLoading(false);
    }


  }
  const templateComponents = Array.isArray(selectedTemplate?.components)
    ? (selectedTemplate.components as any[])
    : [];

  const headerComponent = templateComponents.find(
    (item) => item?.type?.toUpperCase() === "HEADER"
  );

  const bodyText = selectedTemplate
    ? getTemplateBody(selectedTemplate.components)
    : "";

  const footerComponent = templateComponents.find(
    (item) => item?.type?.toUpperCase() === "FOOTER"
  );

  const buttonsComponent = templateComponents.find(
    (item) => item?.type?.toUpperCase() === "BUTTONS"
  );

  const headerImageUrl =
    headerComponent?.format?.toUpperCase() === "IMAGE"
      ? headerComponent?.example?.header_handle?.[0]
      : "";

  const templateIsActive =
    selectedTemplate?.status?.toLowerCase() === "active";
  const campaignStartTime = campaignProgress
    ? new Date(
      campaignProgress.started_at || campaignProgress.created_at
    ).getTime()
    : 0;

  const campaignEndTime =
    campaignProgress?.status === "completed" && campaignProgress.completed_at
      ? new Date(campaignProgress.completed_at).getTime()
      : Date.now();

  const elapsedSeconds =
    campaignStartTime > 0
      ? Math.max(0, Math.floor((campaignEndTime - campaignStartTime) / 1000))
      : 0;

  const processedCount = campaignProgress
    ? Math.max(
      0,
      campaignProgress.total_recipients -
      campaignProgress.queued_count -
      campaignProgress.sending_count
    )
    : 0;

  const remainingCount = campaignProgress
    ? campaignProgress.queued_count + campaignProgress.sending_count
    : 0;

  const estimatedRemainingSeconds =
    processedCount > 0 && elapsedSeconds > 0
      ? Math.ceil((elapsedSeconds / processedCount) * remainingCount)
      : null;

  const expectedCompletion =
    estimatedRemainingSeconds !== null
      ? new Date(Date.now() + estimatedRemainingSeconds * 1000)
      : null;
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

      {/* Campaign Live Progress */}
      {campaignProgress && !progressClosed && (
        <section className="rounded-xl border bg-white p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Campaign Live Progress
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {campaignProgress.name}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold capitalize text-green-800">
                {campaignProgress.status}
              </span>

              {campaignProgress.status === "completed" && (
                <button
                  type="button"
                  onClick={() => setProgressClosed(true)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  title="Close campaign progress"
                >
                  × Close
                </button>
              )}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                Processing Progress
              </span>
              <span className="font-semibold text-gray-900">
                {campaignProgress.total_recipients > 0
                  ? Math.round(
                    ((campaignProgress.accepted_count +
                      campaignProgress.failed_count) /
                      campaignProgress.total_recipients) *
                    100
                  )
                  : 0}
                %
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-600 transition-all duration-500"
                style={{
                  width: `${campaignProgress.total_recipients > 0
                    ? Math.min(
                      100,
                      ((campaignProgress.accepted_count +
                        campaignProgress.failed_count) /
                        campaignProgress.total_recipients) *
                      100
                    )
                    : 0
                    }%`,
                }}
              />
            </div>
          </div>
          {/* Campaign Time Estimates */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-blue-50 p-3">
              <p className="text-xs text-gray-600">Elapsed Time</p>
              <p className="mt-1 text-lg font-bold text-blue-800">
                {formatDuration(elapsedSeconds)}
              </p>
            </div>

            <div className="rounded-lg border bg-amber-50 p-3">
              <p className="text-xs text-gray-600">
                Estimated Time Remaining
              </p>
              <p className="mt-1 text-lg font-bold text-amber-800">
                {campaignProgress.status === "completed"
                  ? "Completed"
                  : estimatedRemainingSeconds !== null
                    ? formatDuration(estimatedRemainingSeconds)
                    : "Calculating..."}
              </p>
            </div>

            <div className="rounded-lg border bg-green-50 p-3">
              <p className="text-xs text-gray-600">Expected Completion</p>
              <p className="mt-1 text-lg font-bold text-green-800">
                {campaignProgress.status === "completed"
                  ? "Completed"
                  : expectedCompletion
                    ? expectedCompletion.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "Calculating..."}
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
            {[
              {
                label: "Total",
                value: campaignProgress.total_recipients,
                color: "text-gray-900",
              },
              {
                label: "Queued",
                value: campaignProgress.queued_count,
                color: "text-gray-700",
              },
              {
                label: "Sending",
                value: campaignProgress.sending_count,
                color: "text-blue-700",
              },
              {
                label: "Accepted",
                value: campaignProgress.accepted_count,
                color: "text-indigo-700",
              },
              {
                label: "Delivered",
                value: campaignProgress.delivered_count,
                color: "text-green-700",
              },
              {
                label: "Read",
                value: campaignProgress.read_count,
                color: "text-purple-700",
              },
              {
                label: "Failed",
                value: campaignProgress.failed_count,
                color: "text-red-700",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border bg-gray-50 p-3"
              >
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className={`mt-1 text-xl font-bold ${item.color}`}>
                  {item.value.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>

          {progressLoading && (
            <p className="mt-3 text-xs text-gray-500">
              Progress updating...
            </p>
          )}
        </section>
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
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <section className="rounded-xl border bg-white">
            <div className="grid grid-cols-1 gap-3 border-b p-4 md:grid-cols-2">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  Paste Mobile Numbers
                </h2>
                <textarea
                  value={pastedNumbers}
                  onChange={(event) => setPastedNumbers(event.target.value)}
                  placeholder={"9876543210\n919876543210"}
                  rows={4}
                  className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Unique valid numbers: {pastedRecipients.length}
                </p>
              </div>

              <div className="min-w-0 rounded-lg bg-amber-50 p-3">
                <h2 className="font-semibold text-gray-900">
                  Exclude Mobile Numbers
                </h2>

                <textarea
                  value={excludedNumbers}
                  onChange={(event) => setExcludedNumbers(event.target.value)}
                  placeholder={"919876543210\n919123456789"}
                  rows={4}
                  className="mt-3 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                />
                <p className="mt-2 text-sm font-medium text-amber-800">
                  Excluded numbers: {excludedRecipients.size}
                </p>
              </div>
            </div>

            <div className="border-b p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  1. Select Contacts
                </h2>
                <span className="text-xs text-gray-500">
                  Sirf source se filter karke bheje gaye contacts yahan dikhte hain.
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
                <span className="text-sm text-gray-600">
                  Source: {contacts.length > 0 ? (source === "leads" ? "CRM Lead List contacts" : "Meta Report contacts") : "No source selected"}
                </span>
                <button
                  onClick={toggleVisibleContacts}
                  disabled={filteredContacts.length === 0}
                  className="ml-auto rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Select / deselect visible
                </button>
              </div>
            </div>
            <div className="max-h-[420px] overflow-auto">
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

          <section className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              3. Campaign Summary
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <label htmlFor="campaign-name" className="mb-1 block font-medium text-gray-700">
                  Campaign Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="campaign-name"
                  value={campaignName}
                  onChange={(event) => setCampaignName(event.target.value)}
                  maxLength={120}
                  placeholder="e.g. October Meta Leads Follow-up"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  required
                />
              </div>
              <SummaryRow label="Source" value={contacts.length > 0 ? (source === "leads" ? "CRM Lead List contacts" : "Meta Report contacts") : "No source selected"} />
              <div className="relative">
                <label className="mb-1 block font-medium text-gray-700">
                  Assign Roles <span className="text-red-600">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowRoleDropdown((current) => !current)}
                  disabled={rolesLoading || availableRoles.length === 0}
                  className="flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2.5 text-left hover:bg-gray-50 disabled:opacity-50"
                >
                  <span>
                    {rolesLoading
                      ? "Loading Roles..."
                      : selectedRoleIds.length > 0
                        ? `${selectedRoleIds.length} Role(s) Selected`
                        : "Select Roles"}
                  </span>
                  <span>{showRoleDropdown ? "▲" : "▼"}</span>
                </button>

                {showRoleDropdown && (
                  <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border bg-white p-2 shadow-lg">
                    {availableRoles.map((role) => (
                      <label
                        key={role.role_id}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoleIds.includes(role.role_id)}
                          onChange={(event) => {
                            setSelectedRoleIds((current) =>
                              event.target.checked
                                ? [...current, role.role_id]
                                : current.filter((id) => id !== role.role_id)
                            );
                          }}
                          className="h-4 w-4 accent-green-600"
                        />
                        {role.role_name}
                      </label>
                    ))}
                  </div>
                )}

                <p className="mt-1 text-xs text-gray-500">
                  Selected Roles ke employees ko is Campaign ke chats ka access milega.
                </p>
              </div>
              <SummaryRow
                label="Selected recipients"
                value={Array.from(
                  new Set([
                    ...selectedContacts.map((contact) => contact.phone),
                    ...pastedRecipients,
                  ]),
                )
                  .filter((phone) => !excludedRecipients.has(phone))
                  .length.toLocaleString("en-IN")}
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
              onClick={handleCreateCampaign}
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
        <div className="space-y-4">
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
                WhatsApp Message Preview
              </div>

              <div className="rounded-xl border bg-[#e5ddd5] p-3 sm:p-4">
                {selectedTemplate ? (
                  <div className="mx-auto max-w-[380px] overflow-hidden rounded-xl bg-white shadow-sm">
                    {/* Header */}
                    {headerComponent && (
                      <div>
                        {headerImageUrl ? (
                          <img
                            src={headerImageUrl}
                            alt="Template header"
                            className="max-h-[220px] w-full object-cover"
                          />
                        ) : headerComponent.format?.toUpperCase() === "TEXT" ? (
                          <div className="px-3 pt-3 text-sm font-semibold text-gray-900">
                            {headerComponent.text}
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Body */}
                    <div className="px-3 py-3">
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-800">
                        {bodyText ||
                          "Template body available nahi hai. Components data check karein."}
                      </p>

                      {/* Footer */}
                      {footerComponent?.text && (
                        <p className="mt-2 whitespace-pre-wrap text-xs text-gray-500">
                          {footerComponent.text}
                        </p>
                      )}

                      <p className="mt-2 text-right text-[10px] text-gray-400">
                        10:30 AM
                      </p>
                    </div>

                    {/* Buttons */}
                    {Array.isArray(buttonsComponent?.buttons) &&
                      buttonsComponent.buttons.length > 0 && (
                        <div className="border-t border-gray-100">
                          {buttonsComponent.buttons.map((button: any, index: number) => (
                            <div
                              key={`${button.text || "button"}-${index}`}
                              className="border-b border-gray-100 px-3 py-2.5 text-center text-sm font-medium text-blue-600 last:border-b-0"
                            >
                              {button.type?.toUpperCase() === "URL" && "↗ "}
                              {button.type?.toUpperCase() === "PHONE_NUMBER" && "☎ "}
                              {button.text}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-gray-500">
                    Preview ke liye template select karein.
                  </p>
                )}
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Variables ka final preview actual sending ke samay recipient-specific
                values ke saath banega.
              </p>
            </div>
          </section>

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
