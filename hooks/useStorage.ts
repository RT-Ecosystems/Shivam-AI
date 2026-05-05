import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, Message, ModelKey } from '../constants/types';

const CHATS_KEY = 'shivam_ai_chats';
const ACTIVE_CHAT_KEY = 'shivam_ai_active_chat';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim().slice(0, 40);
  return cleaned.length < firstMessage.trim().length ? cleaned + '...' : cleaned;
}

export function useStorage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load all chats from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const [chatsRaw, activeId] = await Promise.all([
          AsyncStorage.getItem(CHATS_KEY),
          AsyncStorage.getItem(ACTIVE_CHAT_KEY),
        ]);

        if (chatsRaw) {
          const parsed: Chat[] = JSON.parse(chatsRaw);
          // Sort by updatedAt desc
          parsed.sort((a, b) => b.updatedAt - a.updatedAt);
          setChats(parsed);
          if (activeId && parsed.find((c) => c.id === activeId)) {
            setActiveChatId(activeId);
          } else if (parsed.length > 0) {
            setActiveChatId(parsed[0].id);
          }
        }
      } catch (_) {}
      setIsLoaded(true);
    })();
  }, []);

  const saveChats = useCallback(async (updatedChats: Chat[]) => {
    try {
      await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(updatedChats));
    } catch (_) {}
  }, []);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  const createNewChat = useCallback(
    async (model: ModelKey = 'deepseek') => {
      const newChat: Chat = {
        id: generateId(),
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model,
      };
      const updated = [newChat, ...chats];
      setChats(updated);
      setActiveChatId(newChat.id);
      await Promise.all([
        saveChats(updated),
        AsyncStorage.setItem(ACTIVE_CHAT_KEY, newChat.id),
      ]);
      return newChat.id;
    },
    [chats, saveChats]
  );

  const selectChat = useCallback(
    async (chatId: string) => {
      setActiveChatId(chatId);
      await AsyncStorage.setItem(ACTIVE_CHAT_KEY, chatId);
    },
    []
  );

  const addMessage = useCallback(
    async (chatId: string, message: Message) => {
      setChats((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== chatId) return c;
          const newMessages = [...c.messages, message];
          const title =
            c.messages.length === 0 && message.role === 'user'
              ? generateTitle(message.content)
              : c.title;
          return { ...c, messages: newMessages, title, updatedAt: Date.now() };
        });
        updated.sort((a, b) => b.updatedAt - a.updatedAt);
        saveChats(updated);
        return updated;
      });
    },
    [saveChats]
  );

  const updateLastMessage = useCallback(
    async (chatId: string, content: string, thinking?: string) => {
      setChats((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== chatId) return c;
          const messages = [...c.messages];
          if (messages.length > 0) {
            messages[messages.length - 1] = {
              ...messages[messages.length - 1],
              content,
              thinking,
            };
          }
          return { ...c, messages, updatedAt: Date.now() };
        });
        saveChats(updated);
        return updated;
      });
    },
    [saveChats]
  );

  const deleteChat = useCallback(
    async (chatId: string) => {
      const updated = chats.filter((c) => c.id !== chatId);
      setChats(updated);
      await saveChats(updated);
      if (activeChatId === chatId) {
        const newActive = updated.length > 0 ? updated[0].id : null;
        setActiveChatId(newActive);
        if (newActive) {
          await AsyncStorage.setItem(ACTIVE_CHAT_KEY, newActive);
        } else {
          await AsyncStorage.removeItem(ACTIVE_CHAT_KEY);
        }
      }
    },
    [chats, activeChatId, saveChats]
  );

  const updateChatModel = useCallback(
    async (chatId: string, model: ModelKey) => {
      setChats((prev) => {
        const updated = prev.map((c) =>
          c.id === chatId ? { ...c, model } : c
        );
        saveChats(updated);
        return updated;
      });
    },
    [saveChats]
  );

  return {
    chats,
    activeChat,
    activeChatId,
    isLoaded,
    createNewChat,
    selectChat,
    addMessage,
    updateLastMessage,
    deleteChat,
    updateChatModel,
  };
    }
          
