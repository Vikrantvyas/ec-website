
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Check,
  LoaderCircle,
  RefreshCw,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type BotTemplate = {
  id: string;
  name: string;
  status: "draft" | "active" | "paused";
  start_mode: "manual" | "automatic" | "both";
  trigger_keyword: string | null;
};

type AutomationSettings = {
  automation_enabled: boolean;
  default_bot_id: string;
};

const card =
  "rounded-2xl border border-slate-200 bg-white shadow-sm";

const field =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50";

const secondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50";

export default function WhatsAppBotSettingsPage() {
  const [bots, setBots] = useState<BotTemplate[]>([]);
  const [keywords, setKeywords] = useState<Record<string, string>>({});
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [defaultBotId, setDefaultBotId] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingBotId, setSavingBotId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    const [botsResult, settingsResult] = await Promise.all([
      supabase
        .from("whatsapp_bot_templates")
        .select("id, name, status, start_mode, trigger_keyword")
        .order("name", { ascending: true }),

      supabase
        .from("whatsapp_bot_automation_settings")
        .select("automation_enabled, default_bot_id")
        .eq("id", 1)
        .maybeSingle(),
    ]);

    if (botsResult.error) {
      setError(botsResult.error.message);
      setLoading(false);
      return;
    }

    if (settingsResult.error) {
      setError(settingsResult.error.message);
      setLoading(false);
      return;
    }

    const botList = (botsResult.data ?? []) as BotTemplate[];

    setBots(botList);

    const keywordValues: Record<string, string> = {};
    botList.forEach((bot) => {
      keywordValues[bot.id] = bot.trigger_keyword ?? "";
    });
    setKeywords(keywordValues);

    if (settingsResult.data) {
      setAutomationEnabled(
        settingsResult.data.automation_enabled ?? true,
      );
      setDefaultBotId(settingsResult.data.default_bot_id ?? "");
    } else {
      setAutomationEnabled(true);
      setDefaultBotId("");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const eligibleBots = bots.filter(
  (bot) => bot.status === "active",
);

  async function saveSettings() {
    setSavingSettings(true);
    setError("");
    setNotice("");

    if (
      defaultBotId &&
      !eligibleBots.some((bot) => bot.id === defaultBotId)
    ) {
      setError(
        "Default Bot के लिए Active और Automatic/Both Start Mode वाला Bot चुनें।",
      );
      setSavingSettings(false);
      return;
    }

    const { error: saveError } = await supabase
      .from("whatsapp_bot_automation_settings")
      .upsert(
        {
          id: 1,
          automation_enabled: automationEnabled,
          default_bot_id: defaultBotId || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

    if (saveError) {
      setError(saveError.message);
      setSavingSettings(false);
      return;
    }

    setNotice("Automation Settings सफलतापूर्वक Save हो गईं।");
    setSavingSettings(false);
  }

  async function saveKeywords(bot: BotTemplate) {
    setSavingBotId(bot.id);
    setError("");
    setNotice("");

    const cleanedKeywords = (keywords[bot.id] ?? "")
      .split(/[,;\n]+/)
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    const uniqueKeywords = Array.from(
      new Set(cleanedKeywords.map((keyword) => keyword.toUpperCase())),
    );

    if (
      uniqueKeywords.length > 0 &&
      (bot.status !== "active" ||
        (bot.start_mode !== "automatic" && bot.start_mode !== "both"))
    ) {
     setError(
  '"' +
    bot.name +
    '" में keyword trigger इस्तेमाल करने के लिए Bot को Active करें और Start Mode Automatic या Both रखें।',
);
      setSavingBotId("");
      return;
    }

    const { error: updateError } = await supabase
      .from("whatsapp_bot_templates")
      .update({
        trigger_keyword: uniqueKeywords.length
          ? uniqueKeywords.join(", ")
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bot.id);

    if (updateError) {
      setError(updateError.message);
      setSavingBotId("");
      return;
    }

    setKeywords((current) => ({
      ...current,
      [bot.id]: uniqueKeywords.join(", "),
    }));

    setBots((current) =>
      current.map((item) =>
        item.id === bot.id
          ? {
              ...item,
              trigger_keyword: uniqueKeywords.length
                ? uniqueKeywords.join(", ")
                : null,
            }
          : item,
      ),
    );

    setNotice(`"${bot.name}" के keywords Save हो गए।`);
    setSavingBotId("");
  }

  async function deleteKeywords(bot: BotTemplate) {
    const confirmed = window.confirm(
      `"${bot.name}" के सभी keywords हटाने हैं?`,
    );

    if (!confirmed) return;

    setSavingBotId(bot.id);
    setError("");
    setNotice("");

    const { error: deleteError } = await supabase
      .from("whatsapp_bot_templates")
      .update({
        trigger_keyword: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bot.id);

    if (deleteError) {
      setError(deleteError.message);
      setSavingBotId("");
      return;
    }

    setKeywords((current) => ({
      ...current,
      [bot.id]: "",
    }));

    setBots((current) =>
      current.map((item) =>
        item.id === bot.id
          ? { ...item, trigger_keyword: null }
          : item,
      ),
    );

    setNotice(`"${bot.name}" के keywords हटा दिए गए।`);
    setSavingBotId("");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <Settings2 size={18} />
              WhatsApp Automation
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Bot Automation Settings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Automatic Start, Default Bot और Keyword Routing manage करें।
            </p>
          </div>

          <Link href="/admin/whatsapp/bots" className={secondary}>
            <ArrowLeft size={17} />
            Back to Bot Manager
          </Link>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {notice}
          </div>
        )}

        <section className={`${card} space-y-5 p-5`}>
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <Settings2 size={22} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                General Automation
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                नए ग्राहक के मैसेज पर Automatic Bot Start नियंत्रित करें।
              </p>
            </div>
          </div>

          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
            <div>
              <p className="font-semibold text-slate-800">
                Automatic Bot Start
              </p>
              <p className="mt-1 text-sm text-slate-500">
                बंद करने पर webhook की automatic routing को भी बंद होना चाहिए।
              </p>
            </div>

            <input
              type="checkbox"
              checked={automationEnabled}
              disabled={loading || savingSettings}
              onChange={(event) =>
                setAutomationEnabled(event.target.checked)
              }
              className="h-5 w-5 accent-emerald-600"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              Default Bot
            </span>

            <select
              className={field}
              value={defaultBotId}
              disabled={loading || savingSettings}
              onChange={(event) => setDefaultBotId(event.target.value)}
            >
              <option value="">कोई Default Bot नहीं</option>

              {eligibleBots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name}
                </option>
              ))}
            </select>

            <span className="block text-xs text-slate-500">
              Keyword match न मिलने पर Default Bot fallback के रूप में इस्तेमाल हो सकता है।
            </span>
          </label>

          <button
            type="button"
            className={primary}
            disabled={loading || savingSettings}
            onClick={() => void saveSettings()}
          >
            {savingSettings ? (
              <LoaderCircle className="animate-spin" size={17} />
            ) : (
              <Save size={17} />
            )}
            {savingSettings ? "Saving..." : "Save Automation Settings"}
          </button>
        </section>

        <section className={`${card} overflow-hidden`}>
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-900">
                Keyword to Bot Mapping
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                हर Bot के लिए कई keywords comma, semicolon या नई line से अलग करके लिखें।
              </p>
            </div>

            <button
              type="button"
              className={secondary}
              disabled={loading || savingBotId !== ""}
              onClick={() => void loadData()}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
              <LoaderCircle className="animate-spin" size={20} />
              Loading bot settings...
            </div>
          ) : bots.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              अभी कोई Bot नहीं है। पहले Bot Manager में Bot बनाएँ।
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bots.map((bot) => {
                const eligible =
                  bot.status === "active" &&
                  (bot.start_mode === "automatic" ||
                    bot.start_mode === "both");

                return (
                  <div key={bot.id} className="space-y-3 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Bot size={19} className="text-emerald-700" />
                        <h3 className="font-semibold text-slate-900">
                          {bot.name}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                          {bot.status}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                          {bot.start_mode}
                        </span>
                        {bot.id === defaultBotId && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
                            Default Bot
                          </span>
                        )}
                      </div>
                    </div>

                    {!eligible && (
                      <p className="text-xs text-amber-700">
                        Keyword trigger चलाने के लिए Bot को Active करें और Start Mode Automatic या Both चुनें।
                      </p>
                    )}

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">
                        Trigger Keywords
                      </span>

                      <textarea
                        className={field}
                        rows={2}
                        value={keywords[bot.id] ?? ""}
                        onChange={(event) =>
                          setKeywords((current) => ({
                            ...current,
                            [bot.id]: event.target.value,
                          }))
                        }
                        placeholder="उदाहरण: ADMISSION, FEES, COURSE"
                        disabled={savingBotId !== ""}
                      />
                    </label>

                    <p className="text-xs text-slate-500">
                      उदाहरण: ADMISSION, FEES, COURSE
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={primary}
                        disabled={savingBotId !== ""}
                        onClick={() => void saveKeywords(bot)}
                      >
                        {savingBotId === bot.id ? (
                          <LoaderCircle
                            className="animate-spin"
                            size={16}
                          />
                        ) : (
                          <Check size={16} />
                        )}
                        Save Keywords
                      </button>

                      <button
                        type="button"
                        className={secondary}
                        disabled={
                          savingBotId !== "" ||
                          !(keywords[bot.id] ?? "").trim()
                        }
                        onClick={() => void deleteKeywords(bot)}
                      >
                        <Trash2 size={16} />
                        Delete Keywords
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
