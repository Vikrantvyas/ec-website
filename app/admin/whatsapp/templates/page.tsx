"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  RefreshCw, Plus, Trash2, Pencil, X, Image as ImageIcon, Video,
  FileText, MessageCircle, AlertTriangle, CheckCircle2, LoaderCircle,
  Link as LinkIcon, Phone, Sticker, Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type ButtonType = "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
type TemplateButton = {
  type: ButtonType;
  text: string;
  url?: string;
  phone_number?: string;
};
type MediaType = "IMAGE" | "VIDEO" | "DOCUMENT" | "GIF" | "STICKER";
type Template = {
  id: string;
  template_name: string;
  language_code: string;
  category: string;
  status: string;
  components: any[];
};
type UploadedMedia = {
  file: File;
  previewUrl: string;
  headerHandle: string;
  uploading: boolean;
};

const mediaOptions: { type: MediaType; label: string; accept: string; icon: any }[] = [
  { type: "IMAGE", label: "Image", accept: "image/jpeg,image/png", icon: ImageIcon },
  { type: "VIDEO", label: "Video", accept: "video/mp4", icon: Video },
  { type: "DOCUMENT", label: "Document / PDF", accept: ".pdf,application/pdf", icon: FileText },
  { type: "GIF", label: "GIF", accept: "image/gif", icon: Video },
  { type: "STICKER", label: "Sticker", accept: ".webp,image/webp", icon: Sticker },
];

function getError(error: any) {
  return error?.context?.error || error?.message || "Request complete nahi hui.";
}

function getComponents(components: any[]) {
  const header = components.find((c) => c.type === "HEADER");
  const body = components.find((c) => c.type === "BODY");
  const footer = components.find((c) => c.type === "FOOTER");
  const buttons = components.find((c) => c.type === "BUTTONS");
  return {
    headerType: header?.format ?? "NONE",
    body: body?.text ?? "",
    footer: footer?.text ?? "",
    buttons: (buttons?.buttons ?? []) as TemplateButton[],
  };
}

export default function WhatsAppTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [category, setCategory] = useState("MARKETING");
  const [body, setBody] = useState("");
  const [footer, setFooter] = useState("");
  const [buttons, setButtons] = useState<TemplateButton[]>([]);
  const [callLabel, setCallLabel] = useState("Call");
  const [callNumber, setCallNumber] = useState("");
  const [websiteLabel, setWebsiteLabel] = useState("Visit Website");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [mediaType, setMediaType] = useState<MediaType | "NONE" | "TEXT" | "POLL">("NONE");
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null);
  const [editing, setEditing] = useState<Template | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "whatsapp-templates",
        { body: { action: "list" } },
      );
      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(data.error);
      setTemplates(data?.templates ?? []);
      setSuccess(`${data?.count ?? 0} templates sync hue.`);
    } catch (e: any) {
      setError(getError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    return () => {
      if (uploadedMedia?.previewUrl) URL.revokeObjectURL(uploadedMedia.previewUrl);
    };
  }, [uploadedMedia?.previewUrl]);

  function resetForm() {
    setName("");
    setLanguage("en");
    setCategory("MARKETING");
    setBody("");
    setFooter("");
    setButtons([]);
    setCallLabel("Call");
    setCallNumber("");
    setWebsiteLabel("Visit Website");
    setWebsiteUrl("");
    setMediaType("NONE");
    setUploadedMedia(null);
    setEditing(null);
    setError("");
    setSuccess("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function startEdit(template: Template) {
    const parts = getComponents(template.components ?? []);
    setEditing(template);
    setName(template.template_name);
    setLanguage(template.language_code);
    setCategory(template.category.toUpperCase());
    setMediaType((parts.headerType as MediaType | "TEXT" | "NONE") || "NONE");
    setBody(parts.body);
    setFooter(parts.footer);
    setButtons(parts.buttons);
    setUploadedMedia(null);
    setError("Media header edit karne ke liye file dobara select karke upload karein.");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateButton(index: number, field: keyof TemplateButton, value: string) {
    setButtons((old) => old.map((button, i) => i === index ? { ...button, [field]: value } : button));
  }

  function addButton(type: ButtonType) {
    if (buttons.length >= 3) {
      setError("Maximum 3 buttons allowed in this builder.");
      return;
    }
    setButtons((old) => [...old, {
      type, text: type === "PHONE_NUMBER" ? "Call" : type === "URL" ? "Visit Website" : "",
      ...(type === "URL" ? { url: "" } : {}),
      ...(type === "PHONE_NUMBER" ? { phone_number: "" } : {}),
    }]);
    setError("");
  }

  function chooseMedia(type: MediaType) {
    setMediaType(type);
    setUploadedMedia(null);
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.accept = mediaOptions.find((m) => m.type === type)?.accept ?? "";
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || mediaType === "NONE" || mediaType === "POLL" || mediaType === "TEXT") return;

    const maxBytes = mediaType === "VIDEO" ? 16 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File bahut badi hai. Maximum ${Math.round(maxBytes / 1024 / 1024)} MB rakhein.`);
      event.target.value = "";
      return;
    }

    const valid =
      (mediaType === "IMAGE" && ["image/jpeg", "image/png"].includes(file.type)) ||
      (mediaType === "VIDEO" && file.type === "video/mp4") ||
      (mediaType === "DOCUMENT" && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))) ||
      (mediaType === "GIF" && (file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif"))) ||
      (mediaType === "STICKER" && (file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp")));

    if (!valid) {
      setError(`Selected file ${mediaType} ke supported format mein nahi hai.`);
      event.target.value = "";
      return;
    }

    setUploadedMedia({ file, previewUrl: URL.createObjectURL(file), headerHandle: "", uploading: false });
    setError("");
    setSuccess(`${file.name} selected. Ab Upload par click karein.`);
  }

  async function uploadSelectedMedia() {
    if (!uploadedMedia || mediaType === "NONE" || mediaType === "POLL" || mediaType === "TEXT") return;
    if (mediaType === "GIF" || mediaType === "STICKER") {
      setError(`${mediaType} normal approved template header ke roop mein supported nahi hai.`);
      return;
    }

    const { file, previewUrl } = uploadedMedia;
    setUploadedMedia({ file, previewUrl, headerHandle: "", uploading: true });
    setError("");
    setSuccess("");
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("File read nahi ho payi."));
        reader.onload = () => {
          const result = String(reader.result ?? "");
          resolve(result.includes(",") ? result.split(",")[1] : result);
        };
        reader.readAsDataURL(file);
      });
      const { data, error: invokeError } = await supabase.functions.invoke("whatsapp-templates", {
        body: {
          action: "upload_media",
          fileName: file.name,
          mimeType: file.type || (mediaType === "DOCUMENT" ? "application/pdf" : ""),
          fileBase64: base64,
        },
      });
      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(data.error);
      if (!data?.header_handle) throw new Error("Meta ne media header handle return nahi kiya.");
      setUploadedMedia({ file, previewUrl, headerHandle: data.header_handle, uploading: false });
      setSuccess(`${file.name} Meta par upload ho gayi.`);
    } catch (e: any) {
      setUploadedMedia({ file, previewUrl, headerHandle: "", uploading: false });
      setError(getError(e));
    }
  }

  function buildComponents() {
    const components: any[] = [];
    if (mediaType === "POLL") {
      throw new Error("Poll normal WhatsApp template component nahi hai. Iske liye separate interactive-message flow banana hoga.");
    }
    if (mediaType !== "NONE" && mediaType !== "TEXT") {
      if (mediaType === "GIF" || mediaType === "STICKER") {
        throw new Error(`${mediaType} normal WhatsApp template header ke roop mein supported nahi hai. Is file ko regular media/sticker message flow mein use karna hoga.`);
      }
      if (!uploadedMedia?.headerHandle || uploadedMedia.uploading) {
        throw new Error("Pehle media select karke Meta upload complete hone dein.");
      }
      components.push({
        type: "HEADER",
        format: mediaType,
        example: { header_handle: [uploadedMedia.headerHandle] },
      });
    }

    if (!body.trim()) throw new Error("Message Body bharna zaroori hai.");
    components.push({ type: "BODY", text: body.trim() });
    if (footer.trim()) components.push({ type: "FOOTER", text: footer.trim() });

    if (buttons.length) {
      for (const button of buttons) {
        if (!button.text.trim()) throw new Error("Har button ka label bharna zaroori hai.");
        if (button.type === "URL") {
          try {
            const url = new URL(button.url ?? "");
            if (!["http:", "https:"].includes(url.protocol)) throw new Error();
          } catch {
            throw new Error("Website button mein valid URL daalein.");
          }
        }
        if (button.type === "PHONE_NUMBER" && !button.phone_number?.trim()) {
          throw new Error("Call button mein phone number daalein.");
        }
      }
      components.push({
        type: "BUTTONS",
        buttons: buttons.map((button) => button.type === "QUICK_REPLY"
          ? { type: "QUICK_REPLY", text: button.text.trim() }
          : button.type === "URL"
            ? { type: "URL", text: button.text.trim(), url: button.url!.trim() }
            : { type: "PHONE_NUMBER", text: button.text.trim(), phone_number: button.phone_number!.trim() }),
      });
    }
    return components;
  }

  async function submitTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const templateName = name.trim().toLowerCase();
    if (!/^[a-z0-9_]{1,512}$/.test(templateName)) {
      setError("Template name mein sirf lowercase letters, numbers aur underscores use karein.");
      return;
    }
    let components: any[];
    try {
      components = buildComponents();
    } catch (e: any) {
      setError(e.message);
      return;
    }

    setSaving(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "whatsapp-templates",
        { body: {
          action: editing ? "edit" : "create",
          name: templateName,
          originalName: editing?.template_name,
          language,
          category,
          components,
        } },
      );
      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Meta template request failed.");
      setSuccess(editing ? "Template update request complete hui." : "Template Meta par review ke liye submit ho gaya.");
      resetForm();
      await loadTemplates();
    } catch (e: any) {
      setError(getError(e));
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate(template: Template) {
    if (!window.confirm(`"${template.template_name}" ko Meta se delete karna hai?`)) return;
    setDeleting(template.id);
    setError("");
    setSuccess("");
    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "whatsapp-templates",
        { body: { action: "delete", name: template.template_name, language: template.language_code } },
      );
      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(data.error);
      setSuccess(`"${template.template_name}" delete ho gaya.`);
      if (editing?.id === template.id) resetForm();
      await loadTemplates();
    } catch (e: any) {
      setError(getError(e));
    } finally {
      setDeleting(null);
    }
  }

  const activeMedia = mediaOptions.find((m) => m.type === mediaType);

  return (
    <main className="mx-auto max-w-[1600px] space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Template Builder</h1>
          <p className="mt-1 text-sm text-gray-500">Template, media upload, buttons aur preview.</p>
        </div>
        <button type="button" onClick={() => void loadTemplates()} disabled={loading} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh from Meta
        </button>
      </div>

      {error && <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span><button type="button" onClick={() => setError("")} className="ml-auto"><X className="h-4 w-4" /></button></div>}
      {success && <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"><CheckCircle2 className="h-4 w-4 shrink-0" /><span>{success}</span><button type="button" onClick={() => setSuccess("")} className="ml-auto"><X className="h-4 w-4" /></button></div>}

      <form onSubmit={submitTemplate} className="space-y-5">
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />

        <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[1fr_1.05fr_0.9fr]">
          <section className="space-y-3 rounded-xl border bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">1. Settings & Media</h2>
              {editing && <button type="button" onClick={resetForm} className="text-sm text-red-600">Cancel edit</button>}
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Template Name</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} disabled={Boolean(editing)} placeholder="ec_welcome_message (lowercase_with_underscores)" className="w-full rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100" />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-sm font-medium">Language</span>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={Boolean(editing)} className="w-full rounded-lg border px-2 py-2 text-sm">
                  <option value="en">English (en)</option><option value="en_US">English US (en_US)</option><option value="hi">Hindi (hi)</option><option value="hi_IN">Hindi India (hi_IN)</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium">Category</span>
                <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={Boolean(editing)} className="w-full rounded-lg border px-2 py-2 text-sm">
                  <option value="MARKETING">Marketing</option><option value="UTILITY">Utility</option><option value="AUTHENTICATION">Authentication</option>
                </select>
              </label>
            </div>

            <div className="pt-1">
              <h3 className="mb-2 text-sm font-bold">Select file type</h3>
              <div className="grid grid-cols-3 gap-2">
                {mediaOptions.map((option) => {
                  const Icon = option.icon;
                  return <button key={option.type} type="button" onClick={() => chooseMedia(option.type)} className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs font-semibold ${mediaType === option.type ? "border-green-600 bg-green-50 text-green-800" : "hover:bg-gray-50"}`}>
                    <Icon className="h-4 w-4 shrink-0" /> {option.label}
                  </button>;
                })}
                <button type="button" onClick={() => { setMediaType("POLL"); setUploadedMedia(null); }} className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs font-semibold ${mediaType === "POLL" ? "border-green-600 bg-green-50 text-green-800" : "hover:bg-gray-50"}`}><MessageCircle className="h-4 w-4" /> Poll</button>
              </div>

              {activeMedia && <div className="mt-2 rounded-lg border p-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => chooseMedia(activeMedia.type)} className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-gray-50">
                    {uploadedMedia ? "Change file" : `Select ${activeMedia.label}`}
                  </button>
                  {uploadedMedia && !uploadedMedia.headerHandle && <button type="button" onClick={() => void uploadSelectedMedia()} disabled={uploadedMedia.uploading || mediaType === "GIF" || mediaType === "STICKER"} className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                    {uploadedMedia.uploading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload
                  </button>}
                </div>
                {uploadedMedia && <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="max-w-full break-all font-medium">{uploadedMedia.file.name}</span>
                  {uploadedMedia.headerHandle && <span className="text-green-700"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />Uploaded</span>}
                  <button type="button" onClick={() => { setUploadedMedia(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-red-600">Remove</button>
                </div>}
              </div>}
              {(mediaType === "GIF" || mediaType === "STICKER" || mediaType === "POLL") && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">{mediaType === "POLL" ? "Poll approved template ka standard component nahi hai; poll send karne ke liye separate interactive-message flow chahiye." : "File select karke local preview dekha ja sakta hai, lekin GIF/Sticker ko normal approved template header ke roop mein submit nahi kiya ja sakta. Inka actual send flow alag hoga."}</p>}
            </div>

            <div className="pt-1">
              <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Buttons</h3><span className="text-xs text-gray-500">{buttons.length}/3</span></div>

              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_1.4fr_auto] items-center gap-2">
                  <input value={callLabel} onChange={(e) => setCallLabel(e.target.value)} placeholder="Call" className="min-w-0 rounded-lg border px-2 py-2 text-sm" aria-label="Call button label" />
                  <input value={callNumber} onChange={(e) => setCallNumber(e.target.value)} placeholder="Phone number" className="min-w-0 rounded-lg border px-2 py-2 text-sm" aria-label="Phone number" />
                  <button type="button" onClick={() => {
                    if (buttons.some((b) => b.type === "PHONE_NUMBER")) { setError("Call button pehle se added hai."); return; }
                    if (buttons.length >= 3) { setError("Maximum 3 buttons allowed."); return; }
                    if (!callNumber.trim()) { setError("Call ke liye phone number daalein."); return; }
                    setButtons((old) => [...old, { type: "PHONE_NUMBER", text: callLabel.trim() || "Call", phone_number: callNumber.trim() }]);
                    setError("");
                  }} className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-gray-50">Add</button>
                </div>

                <div className="grid grid-cols-[1fr_1.4fr_auto] items-center gap-2">
                  <input value={websiteLabel} onChange={(e) => setWebsiteLabel(e.target.value)} placeholder="Visit Website" className="min-w-0 rounded-lg border px-2 py-2 text-sm" aria-label="Website button label" />
                  <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://example.com" className="min-w-0 rounded-lg border px-2 py-2 text-sm" aria-label="Website URL" />
                  <button type="button" onClick={() => {
                    if (buttons.some((b) => b.type === "URL")) { setError("Website button pehle se added hai."); return; }
                    if (buttons.length >= 3) { setError("Maximum 3 buttons allowed."); return; }
                    if (!/^https?:\/\/\S+/i.test(websiteUrl.trim())) { setError("Valid website URL daalein."); return; }
                    setButtons((old) => [...old, { type: "URL", text: websiteLabel.trim() || "Visit Website", url: websiteUrl.trim() }]);
                    setError("");
                  }} className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-gray-50">Add</button>
                </div>

                <button type="button" onClick={() => addButton("QUICK_REPLY")} className="w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-gray-50"><Plus className="mr-2 inline h-4 w-4" /> Add Quick Reply</button>

                {buttons.filter((b) => b.type === "QUICK_REPLY").map((button) => {
                  const index = buttons.indexOf(button);
                  return <div key={`quick-${index}`} className="flex gap-2">
                    <input value={button.text} onChange={(e) => updateButton(index, "text", e.target.value)} placeholder="Quick Reply text" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" />
                    <button type="button" onClick={() => setButtons((old) => old.filter((_, i) => i !== index))} className="rounded-lg border p-2 text-red-600" aria-label="Remove Quick Reply"><X className="h-4 w-4" /></button>
                  </div>;
                })}
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-xl border bg-white p-3 shadow-sm">
            <h2 className="font-bold">2. Message Body</h2>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Body Text</span>
              <textarea required rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder={"Hello {{1}},\n\nWelcome to English Club!"} className="w-full resize-y rounded-lg border px-3 py-3 text-sm leading-6" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Footer (optional)</span>
              <input value={footer} onChange={(e) => setFooter(e.target.value)} placeholder="English Club & Computer G" className="w-full rounded-lg border px-3 py-2 text-sm" />
            </label>
            <button type="submit" disabled={saving || Boolean(uploadedMedia?.uploading)} className="sticky bottom-2 z-10 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white shadow-lg hover:bg-green-700 disabled:opacity-60">
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {saving ? "Submitting..." : editing ? "Submit Edit Request" : "Submit Template to Meta"}
            </button>
          </section>

          <section className="space-y-3 rounded-xl border bg-white p-3 shadow-sm">
            <h2 className="font-bold">3. Live Preview</h2>
            <div className="mx-auto max-w-[360px] overflow-hidden rounded-[28px] border-[5px] border-gray-800 bg-[#efeae2] shadow-lg">
              <div className="flex items-center gap-3 bg-[#075e54] p-3 text-white">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20"><MessageCircle className="h-5 w-5" /></div>
                <div><p className="text-sm font-semibold">English Club & Computer G</p><p className="text-xs text-white/80">Business account</p></div>
              </div>
              <div className="min-h-[400px] p-3">
                <div className="ml-auto max-w-[95%] overflow-hidden rounded-xl rounded-tr-sm bg-white shadow-sm">
                  
                  {uploadedMedia && mediaType === "IMAGE" && <img src={uploadedMedia.previewUrl} alt="Selected image preview" className="max-h-52 w-full object-cover" />}
                  {uploadedMedia && mediaType === "VIDEO" && <video src={uploadedMedia.previewUrl} controls className="max-h-52 w-full" />}
                  {uploadedMedia && mediaType === "DOCUMENT" && <div className="flex items-center gap-3 bg-gray-100 p-4"><FileText className="h-8 w-8 text-red-600" /><span className="break-all text-sm">{uploadedMedia.file.name}</span></div>}
                  {uploadedMedia && mediaType === "GIF" && <img src={uploadedMedia.previewUrl} alt="GIF preview" className="max-h-52 w-full object-contain" />}
                  {uploadedMedia && mediaType === "STICKER" && <img src={uploadedMedia.previewUrl} alt="Sticker preview" className="mx-auto max-h-40 object-contain p-3" />}
                  {mediaType === "POLL" && <div className="p-4"><MessageCircle className="mb-2 h-8 w-8 text-green-700" /><p className="font-semibold">Poll option</p><p className="text-xs text-gray-500">Separate interactive message flow</p></div>}
                  <div className="whitespace-pre-wrap break-words px-3 py-3 text-sm leading-5">{body || "Your message will appear here..."}</div>
                  {footer && <div className="px-3 pb-2 text-xs text-gray-500">{footer}</div>}
                  <div className="px-2 pb-2">
                    {buttons.map((button, index) => <div key={`${button.type}-${index}`} className="mb-1 rounded-md border-t py-2 text-center text-sm font-medium text-blue-600">
                      {button.type === "URL" && <LinkIcon className="mr-1 inline h-3.5 w-3.5" />}
                      {button.type === "PHONE_NUMBER" && <Phone className="mr-1 inline h-3.5 w-3.5" />}
                      {button.text || "Button"}
                    </div>)}
                  </div>
                  <div className="px-3 pb-2 text-right text-[10px] text-gray-500">Template preview</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </form>

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
          <div><h2 className="font-bold">Existing Templates</h2><p className="text-xs text-gray-500">Meta se synced templates: {templates.length}</p></div>
          <button type="button" onClick={() => void loadTemplates()} disabled={loading} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Template</th><th className="px-4 py-3">Language</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y">
              {loading && templates.length === 0 ? <tr key="loading"><td colSpan={5} className="p-8 text-center text-gray-500"><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />Loading templates...</td></tr>
                : templates.length === 0 ? <tr key="no-templates"><td colSpan={5} className="p-8 text-center text-gray-500">Koi template nahi mila.</td></tr>
                : templates.map((template) => <tr key={template.id ?? `${template.template_name}-${template.language_code}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{template.template_name}</td><td className="px-4 py-3">{template.language_code}</td><td className="px-4 py-3 capitalize">{template.category}</td><td className="px-4 py-3"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs">{template.status}</span></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-2">
                    <button type="button" onClick={() => startEdit(template)} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-100"><Pencil className="h-3.5 w-3.5" />Edit</button>
                    <button type="button" onClick={() => void deleteTemplate(template)} disabled={deleting === template.id} className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50">{deleting === template.id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}Delete</button>
                  </div></td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
