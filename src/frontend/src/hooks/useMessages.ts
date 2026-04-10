import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Message } from "../types";
import { useBackend } from "./useBackend";

interface RawMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: bigint;
  read: boolean;
}

export function useMessages(peerId?: string) {
  const { actor, isReady } = useBackend();
  const queryClient = useQueryClient();

  const { data: thread = [], isLoading } = useQuery<Message[]>({
    queryKey: ["messageThread", peerId],
    queryFn: async () => {
      if (!actor || !peerId) return [];
      try {
        const result = await (
          actor as unknown as {
            getMessageThread: (id: string) => Promise<RawMessage[]>;
          }
        ).getMessageThread(peerId);
        return result.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          receiverId: m.receiverId,
          content: m.content,
          sentAt: m.sentAt,
          read: m.read,
        }));
      } catch {
        return [];
      }
    },
    enabled: isReady && !!peerId,
    refetchInterval: 5000,
  });

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      if (!actor) return 0;
      try {
        const count = await (
          actor as unknown as { unreadMessageCount: () => Promise<bigint> }
        ).unreadMessageCount();
        return Number(count);
      } catch {
        return 0;
      }
    },
    enabled: isReady,
    refetchInterval: 10000,
  });

  const sendMessage = useMutation({
    mutationFn: async ({
      receiverId,
      content,
    }: { receiverId: string; content: string }) => {
      if (!actor) throw new Error("Actor not ready");
      await (
        actor as unknown as {
          sendMessage: (
            receiverId: string,
            content: string,
          ) => Promise<unknown>;
        }
      ).sendMessage(receiverId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messageThread", peerId] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  const markRead = useMutation({
    mutationFn: async (threadPeerId: string) => {
      if (!actor) return;
      await (
        actor as unknown as { markThreadRead: (id: string) => Promise<unknown> }
      ).markThreadRead(threadPeerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  return {
    thread,
    isLoading,
    unreadCount,
    sendMessage: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
    markRead: markRead.mutate,
  };
}
