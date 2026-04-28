"use client";

import { useMemo, useState } from "react";
import {
  getInboxMessages,
  saveInboxMessages,
  type InboxMessage,
  type MessageCategory,
} from "@/lib/api/account";

const filters = ["All", "Unread", "Sales", "Support", "Promotions"] as const;

type MessageFilter = (typeof filters)[number];

function formatTimestamp(value: string) {
  const now = new Date();
  const date = new Date(value);
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = now.getTime() - date.getTime();

  if (diff < oneDay) return "Today";
  if (diff < oneDay * 2) return "Yesterday";
  return date.toLocaleDateString();
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<InboxMessage[]>(() => getInboxMessages());
  const [selectedId, setSelectedId] = useState(messages[0]?.id ?? "");
  const [filter, setFilter] = useState<MessageFilter>("All");
  const [reply, setReply] = useState("");

  const unreadCount = messages.filter((msg) => !msg.read && !msg.archived).length;

  const visibleMessages = useMemo(() => {
    return messages.filter((msg) => {
      if (msg.archived) return false;
      if (filter === "All") return true;
      if (filter === "Unread") return !msg.read;
      return msg.category === filter;
    });
  }, [messages, filter]);

  const selectedMessage = visibleMessages.find((msg) => msg.id === selectedId) ?? visibleMessages[0] ?? null;

  const persistMessages = (nextMessages: InboxMessage[]) => {
    setMessages(nextMessages);
    saveInboxMessages(nextMessages);
  };

  const updateMessage = (id: string, updater: (msg: InboxMessage) => InboxMessage) => {
    persistMessages(messages.map((msg) => (msg.id === id ? updater(msg) : msg)));
  };

  const deleteMessage = (id: string) => {
    persistMessages(messages.filter((msg) => msg.id !== id));
    if (selectedId === id) setSelectedId("");
  };

  const archiveMessage = (id: string) => {
    updateMessage(id, (msg) => ({ ...msg, archived: true }));
    if (selectedId === id) setSelectedId("");
  };

  const sendReply = () => {
    if (!selectedMessage || reply.trim().length === 0) return;

    const nextMessages = messages.map((msg) => {
      if (msg.id !== selectedMessage.id) return msg;
      return {
        ...msg,
        read: true,
        replies: [
          ...(msg.replies ?? []),
          { body: reply.trim(), timestamp: new Date().toISOString() },
        ],
      };
    });

    persistMessages(nextMessages);
    setReply("");
    window.alert(`Reply sent to ${selectedMessage.sender}`);
  };

  return (
    <section className="page-stack gap-4">
      <header className="rounded-2xl border border-amber-100 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
            Unread
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs text-white">{unreadCount}</span>
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600">Communicate with admin and support like an inbox.</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${filter === item ? "bg-orange-500 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Inbox</h2>
          <div className="space-y-2">
            {visibleMessages.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">No messages in this filter.</p>
            ) : (
              visibleMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelectedId(msg.id);
                    if (!msg.read) updateMessage(msg.id, (next) => ({ ...next, read: true }));
                  }}
                  className={`w-full rounded-xl border p-3 text-left ${selectedMessage?.id === msg.id ? "border-orange-300 bg-orange-50" : "border-slate-100 bg-white hover:bg-slate-50"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-sm ${msg.read ? "font-medium text-slate-700" : "font-bold text-slate-900"}`}>
                      {msg.sender}
                    </p>
                    <p className="text-xs text-slate-500">{formatTimestamp(msg.timestamp)}</p>
                  </div>
                  <p className={`mt-1 truncate text-sm ${msg.read ? "font-medium text-slate-700" : "font-bold text-slate-900"}`}>
                    {msg.subject}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">{msg.body}</p>
                  {!msg.read ? <span className="mt-2 inline-block h-2 w-2 rounded-full bg-orange-500" /> : null}
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          {!selectedMessage ? (
            <p className="text-sm text-slate-500">Select a message to view the thread.</p>
          ) : (
            <>
              <div className="border-b border-slate-100 pb-3">
                <p className="text-sm text-slate-500">From: {selectedMessage.sender}</p>
                <h3 className="text-lg font-bold text-slate-900">{selectedMessage.subject}</h3>
                <p className="text-xs text-slate-500">{new Date(selectedMessage.timestamp).toLocaleString()}</p>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                {selectedMessage.body}
              </div>

              {selectedMessage.replies?.length ? (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800">Thread replies</h4>
                  {selectedMessage.replies.map((item, index) => (
                    <div key={`${selectedMessage.id}-reply-${index}`} className="rounded-xl border border-slate-100 p-3 text-sm text-slate-700">
                      <p className="mb-1 text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                      {item.body}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-4">
                <label htmlFor="reply" className="mb-1 block text-sm font-semibold text-slate-800">Reply</label>
                <textarea
                  id="reply"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                  placeholder="Write your reply to admin/support"
                />
                <button onClick={sendReply} className="mt-2 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600">
                  Send
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                <button onClick={() => deleteMessage(selectedMessage.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                  Delete
                </button>
                <button onClick={() => archiveMessage(selectedMessage.id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Archive
                </button>
                <button
                  onClick={() => updateMessage(selectedMessage.id, (msg) => ({ ...msg, read: !msg.read }))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Mark as {selectedMessage.read ? "unread" : "read"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
