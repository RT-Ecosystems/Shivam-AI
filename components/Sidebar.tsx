import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, MODELS } from '../constants/Colors';
import { Chat } from '../constants/types';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.78;

interface SidebarProps {
  visible: boolean;
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onClose: () => void;
}

function formatDate(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const day = 86400000;
  if (diff < day) return 'Today';
  if (diff < 2 * day) return 'Yesterday';
  if (diff < 7 * day) return 'This Week';
  return new Date(ts).toLocaleDateString();
}

function groupChats(chats: Chat[]) {
  const groups: Record<string, Chat[]> = {};
  chats.forEach((c) => {
    const label = formatDate(c.updatedAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(c);
  });
  return groups;
}

export default function Sidebar({
  visible,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onClose,
}: SidebarProps) {
  const groups = groupChats(chats);

  const handleDelete = (chat: Chat) => {
    Alert.alert('Delete Chat', `Delete "${chat.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDeleteChat(chat.id),
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sidebar}>
          {/* Header */}
          <View style={styles.sidebarHeader}>
            <View style={styles.logoRow}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>S</Text>
              </View>
              <View>
                <Text style={styles.appName}>Shivam AI</Text>
                <Text style={styles.appSub}>Welcome to Shivam AI</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* New Chat Button */}
          <TouchableOpacity
            style={styles.newChatBtn}
            onPress={() => { onNewChat(); onClose(); }}
          >
            <Ionicons name="add-circle-outline" size={18} color={Colors.accent} />
            <Text style={styles.newChatText}>New Chat</Text>
          </TouchableOpacity>

          {/* Chat List */}
          <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
            {Object.entries(groups).map(([label, groupChats]) => (
              <View key={label}>
                <Text style={styles.groupLabel}>{label}</Text>
                {groupChats.map((chat) => {
                  const isActive = chat.id === activeChatId;
                  const model = MODELS[chat.model];
                  return (
                    <TouchableOpacity
                      key={chat.id}
                      style={[styles.chatItem, isActive && styles.chatItemActive]}
                      onPress={() => { onSelectChat(chat.id); onClose(); }}
                      onLongPress={() => handleDelete(chat)}
                    >
                      <View style={styles.chatItemContent}>
                        <Text style={styles.chatItemIcon}>{model.icon}</Text>
                        <Text
                          style={[styles.chatTitle, isActive && styles.chatTitleActive]}
                          numberOfLines={1}
                        >
                          {chat.title}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDelete(chat)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={14}
                          color={isActive ? Colors.textSecondary : Colors.textMuted}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            {chats.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={32} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No chats yet</Text>
                <Text style={styles.emptySubText}>Start a new conversation</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.sidebarFooter}>
            <Text style={styles.footerText}>Powered by Groq</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: Colors.bgSidebar,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 52,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  appSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.accentGlow,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  newChatText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 6,
    paddingLeft: 4,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 2,
  },
  chatItemActive: {
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  chatItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  chatItemIcon: {
    fontSize: 14,
  },
  chatTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  chatTitleActive: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
