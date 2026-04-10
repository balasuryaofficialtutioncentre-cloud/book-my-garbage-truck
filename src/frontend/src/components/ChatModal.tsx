import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import type { Message } from "@/types";
import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatModalProps {
  peerId: string;
  peerName: string;
  open: boolean;
  onClose: () => void;
}

function MessageBubble({ msg, isMine }: { msg: Message; isMine: boolean }) {
  const time = new Date(Number(msg.sentAt) / 1_000_000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className={`flex mb-3 ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
          isMine
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        }`}
      >
        <p className="break-words">{msg.content}</p>
        <p
          className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}

export function ChatModal({ peerId, peerName, open, onClose }: ChatModalProps) {
  const [input, setInput] = useState("");
  const { thread, isLoading, isSending, sendMessage, markRead } =
    useMessages(peerId);
  const { principalId } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark thread as read when opened
  useEffect(() => {
    if (open && peerId) {
      markRead(peerId);
    }
  }, [open, peerId, markRead]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    try {
      await sendMessage({ receiverId: peerId, content: text });
    } catch {
      setInput(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden"
        data-ocid="chat-modal"
      >
        <DialogHeader className="bg-primary text-primary-foreground px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-5" />
              <DialogTitle className="text-base font-semibold text-primary-foreground">
                {peerName}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-white/20 size-8"
              aria-label="Close chat"
              data-ocid="chat-close"
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="h-72 overflow-y-auto px-4 py-3 bg-background"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">Loading messages…</p>
            </div>
          ) : thread.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <MessageCircle className="size-8 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">
                No messages yet. Say hello!
              </p>
            </div>
          ) : (
            thread.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMine={msg.senderId === principalId}
              />
            ))
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 px-4 py-3 border-t border-border bg-card">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 bg-background"
            disabled={isSending}
            data-ocid="chat-input"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            aria-label="Send message"
            data-ocid="chat-send"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ChatButtonProps {
  peerId: string;
  peerName: string;
  className?: string;
}

export function ChatButton({
  peerId,
  peerName,
  className = "",
}: ChatButtonProps) {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useMessages(peerId);

  return (
    <>
      <div className={`relative inline-flex ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-2"
          data-ocid="chat-open-btn"
        >
          <MessageCircle className="size-4" />
          Chat
        </Button>
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 size-4 p-0 flex items-center justify-center text-[9px] bg-accent border-0">
            {unreadCount}
          </Badge>
        )}
      </div>
      <ChatModal
        peerId={peerId}
        peerName={peerName}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
