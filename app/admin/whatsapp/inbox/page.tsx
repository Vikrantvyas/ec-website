
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Send,
  RefreshCw,
  MessageCircle,
  UserRound,
  Phone,
  CheckCheck,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Contact = {
  id: string;
  name: string | null;
  phone_number: string;
};

type InboundMessage = {
  id: string;
  contact_id: string | null;
  phone_number: string;
  message_id: string;
  message_type: string | null;
  message_text: string | null;
  received_at: string;
};

type MessageLog = {
  id: string;
  contact_id: string | null;
  recipient_id: string | null;
  direction: string;
  message_id: string | null;
  message_type: string | null;
  message_text: string | null;
  status: string | null;
  error_message: string | null;
  event_at: string;
};

type Conversation = {
  phone: string;
  contactId: string | null;
  name: string;
  lastText: string;
  lastAt: string;
};

function formatTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export default function WhatsAppInboxPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [inbound, setInbound] = useState<InboundMessage[]>([]);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadInbox = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);

    try {
      const [contactsResult, inboundResult, logsResult] =
        await Promise.all([
          supabase
            .from("whatsapp_contacts")
            .select("id,name,phone_number")
            .order("updated_at", { ascending: false }),

          supabase
            .from("whatsapp_inbound_messages")
            .select(
              "id,contact_id,phone_number,message_id,message_type,message_text,received_at",
            )
            .order("received_at", { ascending: false })
            .limit(1000),

          supabase
            .from("whatsapp_message_logs")
            .select(
              "id,contact_id,recipient_id,direction,message_id,message_type,message_text,status,error_message,event_at",
            )
            .order("event_at", { ascending: false })
            .limit(2000),
        ]);

      if (contactsResult.error) throw contactsResult.error;
      if (inboundResult.error) throw inboundResult.error;
      if (logsResult.error) throw logsResult.error;

      const nextContacts = (contactsResult.data ?? []) as Contact[];
      const nextInbound = (inboundResult.data ?? []) as InboundMessage[];
      const nextLogs = (logsResult.data ?? []) as MessageLog[];

      setContacts(nextContacts);
      setInbound(nextInbound);
      setLogs(nextLogs);
      setError("");

      const knownPhones = new Set(
        nextContacts.map((contact) => normalizePhone(contact.phone_number)),
      );

      const availablePhones = [
        ...nextContacts.map((contact) => contact.phone_number),
        ...nextInbound.map((message) => message.phone_number),
      ];

      const uniquePhones = [...new Set(availablePhones)];

      // Preserve the currently selected conversation.
      setSelectedPhone((current) => {
        if (
          current &&
          uniquePhones.some(
            (phone) => normalizePhone(phone) === normalizePhone(current),
          )
        ) {
          return current;
        }

        const firstInbound = nextInbound[0]?.phone_number;
        return firstInbound ?? uniquePhones[0] ?? "";
      });

      // Keep known contacts available for the conversation list.
      void knownPhones;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Inbox load failed.",
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInbox(true);

    const interval = setInterval(() => {
      void loadInbox(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [loadInbox]);

  const conversations = useMemo(() => {
    const map = new Map<string, Conversation>();

    const contactByPhone = new Map(
      contacts.map((contact) => [
        normalizePhone(contact.phone_number),
        contact,
      ]),
    );

    const allMessages = [
      ...inbound.map((message) => ({
        phone: message.phone_number,
        contactId: message.contact_id,
        text: message.message_text ?? `[${message.message_type ?? "Message"}]`,
        at: message.received_at,
      })),
      ...logs.map((message) => {
        const contact = contacts.find(
          (item) => item.id === message.contact_id,
        );

        return {
          phone: contact?.phone_number ?? "",
          contactId: message.contact_id,
          text: message.message_text ?? "",
          at: message.event_at,
        };
      }),
    ]
      .filter((message) => message.phone)
      .sort(
        (a, b) =>
          new Date(b.at).getTime() - new Date(a.at).getTime(),
      );

    for (const message of allMessages) {
      const phoneKey = normalizePhone(message.phone);
      if (!phoneKey) continue;

      const contact = contactByPhone.get(phoneKey);

      if (!map.has(phoneKey)) {
        map.set(phoneKey, {
          phone: message.phone,
          contactId: message.contactId ?? contact?.id ?? null,
          name: contact?.name || message.phone,
          lastText: message.text,
          lastAt: message.at,
        });
      }
    }

    return [...map.values()].filter((conversation) => {
      const query = search.trim().toLowerCase();

      return (
        !query ||
        conversation.name.toLowerCase().includes(query) ||
        conversation.phone.includes(query)
      );
    });
  }, [contacts, inbound, logs, search]);

  const selectedContact = contacts.find(
    (contact) =>
      normalizePhone(contact.phone_number) ===
      normalizePhone(selectedPhone),
  );

  const chatMessages = useMemo(() => {
    const phone = normalizePhone(selectedPhone);
    if (!phone) return [];

    const inboundMessages = inbound
      .filter(
        (message) => normalizePhone(message.phone_number) === phone,
      )
      .map((message) => ({
        id: message.message_id,
        direction: "inbound",
        text:
          message.message_text ??
          `[${message.message_type ?? "Message"}]`,
        status: "received",
        at: message.received_at,
      }));

    const outboundMessages = logs
      .filter((message) => {
        if (message.direction !== "outbound") return false;

        if (
          message.contact_id &&
          selectedContact?.id === message.contact_id
        ) {
          return true;
        }

        return false;
      })
      .map((message) => ({
        id: message.message_id ?? message.id,
        direction: "outbound",
        text: message.message_text ?? "",
        status: message.status ?? "sent",
        at: message.event_at,
      }));

    return [...inboundMessages, ...outboundMessages].sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
    );
  }, [inbound, logs, selectedPhone, selectedContact]);

  async function sendReply() {
    const message = draft.trim();
    const phone = normalizePhone(selectedPhone);

    if (!phone || !message) return;

    if (message.length > 4096) {
      setError("Message 4096 characters se chhota hona chahiye.");
      return;
    }

    setSending(true);
    setError("");
    setNotice("");

    try {
      // Uses the existing WhatsApp Cloud API Edge Function.
      const { data, error: functionError } =
        await supabase.functions.invoke("whatsapp-send", {
          body: {
            to: phone,
            message,
          },
        });

      if (functionError) throw functionError;

      if (!data?.success || !data?.message_id) {
        throw new Error(data?.error || "WhatsApp message send failed.");
      }

      const contact =
        selectedContact ??
        contacts.find(
          (item) => normalizePhone(item.phone_number) === phone,
        );

      // Save the outgoing message for chat history.
      const { error: logError } = await supabase
        .from("whatsapp_message_logs")
        .insert({
          contact_id: contact?.id ?? null,
          direction: "outbound",
          message_id: data.message_id,
          message_type: "text",
          message_text: message,
          status: data.status ?? "sent",
          event_at: new Date().toISOString(),
        });

      setDraft("");

      if (logError) {
        setNotice(
          "WhatsApp ne message accept kiya, lekin chat log save nahi hua. Logs check karein.",
        );
      } else {
        setNotice("Message Meta API ne accept kar liya.");
      }

      await loadInbox(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Message send failed.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="flex h-[calc(100vh-110px)] min-h-[540px] flex-col gap-4 p-3 md:p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Inbox</h1>
          <p className="text-sm text-gray-500">
            Incoming messages aur customer replies
          </p>
        </div>

        <button
          onClick={() => void loadInbox(true)}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {notice}
        </div>
      )}

      <section className="grid min-h-0 flex-1 overflow-hidden rounded-xl border bg-white md:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b md:border-b-0 md:border-r">
          <div className="border-b p-3">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <MessageCircle size={18} />
              Conversations
              <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                {conversations.length}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-lg border px-3">
              <Search size={16} className="text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name ya mobile search karein"
                className="min-w-0 flex-1 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 p-6 text-sm text-gray-500">
                <LoaderCircle size={18} className="animate-spin" />
                Loading...
              </div>
            ) : conversations.length === 0 ? (
              <p className="p-5 text-sm text-gray-500">
                Abhi koi conversation nahi mili.
              </p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={normalizePhone(conversation.phone)}
                  onClick={() => {
                    setSelectedPhone(conversation.phone);
                    setNotice("");
                    setError("");
                  }}
                  className={`w-full border-b p-3 text-left hover:bg-gray-50 ${
                    normalizePhone(selectedPhone) ===
                    normalizePhone(conversation.phone)
                      ? "bg-green-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <UserRound size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {conversation.name}
                      </div>
                      <div className="truncate text-xs text-gray-500">
                        {conversation.phone}
                      </div>
                      <div className="mt-1 truncate text-sm text-gray-600">
                        {conversation.lastText || "Message"}
                      </div>
                      <div className="mt-1 text-[11px] text-gray-400">
                        {formatTime(conversation.lastAt)}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col">
          {selectedPhone ? (
            <>
              <header className="flex items-center gap-3 border-b p-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <UserRound size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">
                    {selectedContact?.name || selectedPhone}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone size={12} />
                    {selectedPhone}
                  </div>
                </div>
              </header>

              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-gray-50 p-4">
                {chatMessages.length === 0 ? (
                  <p className="m-auto text-sm text-gray-500">
                    Is customer ki message history nahi mili.
                  </p>
                ) : (
                  chatMessages.map((message, index) => (
                    <div
                      key={`${message.id}-${index}`}
                      className={`flex ${
                        message.direction === "outbound"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 shadow-sm ${
                          message.direction === "outbound"
                            ? "rounded-br-sm bg-green-100"
                            : "rounded-bl-sm border bg-white"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {message.text || "(Empty message)"}
                        </p>

                        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-gray-500">
                          {formatTime(message.at)}
                          {message.direction === "outbound" && (
                            <span title={message.status}>
                              <CheckCheck size={13} />
                              {message.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendReply();
                }}
                className="border-t bg-white p-3"
              >
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.shiftKey &&
                        !event.nativeEvent.isComposing
                      ) {
                        event.preventDefault();
                        void sendReply();
                      }
                    }}
                    maxLength={4096}
                    rows={2}
                    placeholder="Reply likhein... (Enter = Send, Shift+Enter = new line)"
                    className="max-h-36 min-h-12 flex-1 resize-y rounded-lg border px-3 py-2 text-sm outline-none focus:border-green-500"
                  />

                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Send size={17} />
                    )}
                    Send
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Customer ke last reply ke 24-hour window ke baad
                  WhatsApp template ki zaroorat ho sakti hai.
                </p>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-gray-500">
              <MessageCircle size={42} />
              <p className="font-medium">Conversation select karein</p>
              <p className="text-sm">
                Customer ki chat dekhne ke liye left side se number chunein.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
