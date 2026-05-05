import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, MODELS } from '../constants/Colors';
import { Message, ModelKey } from '../constants/types';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  streamingText?: string;
  thinkingText?: string;
  currentModel?: ModelKey;
}

// Simple markdown-like renderer
function renderContent(text: string, isUser: boolean) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Code block detection (simplified)
    if (line.startsWith('```')) {
      return null;
    }
    // Bold text **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Text key={i} style={isUser ? styles.userText : styles.aiText}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={j} style={styles.bold}>
                {part.slice(2, -2)}
              </Text>
            );
          }
          return part;
        })}
        {i < lines.length - 1 ? '\n' : ''}
      </Text>
    );
  });
}

export default function ChatMessage({
  message,
  isStreaming = false,
  streamingText,
  thinkingText,
  currentModel = 'deepseek',
}: ChatMessageProps) {
  const [showThinking, setShowThinking] = useState(false);
  const isUser = message.role === 'user';
  const content = isStreaming ? (streamingText ?? message.content) : message.content;
  const thinking = isStreaming ? thinkingText : message.thinking;
  const model = MODELS[currentModel];

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.aiRow}>
      {/* AI Avatar */}
      <View style={[styles.avatar, { backgroundColor: model.bgColor, borderColor: model.color + '40' }]}>
        <Text style={styles.avatarIcon}>{model.icon}</Text>
      </View>

      <View style={styles.aiContent}>
        {/* Model label */}
        <Text style={[styles.modelLabel, { color: model.color }]}>{model.name}</Text>

        {/* Thinking section (DeepSeek only) */}
        {thinking && (
          <TouchableOpacity
            style={[styles.thinkingToggle, { borderColor: model.color + '30' }]}
            onPress={() => setShowThinking(!showThinking)}
          >
            <Ionicons
              name={showThinking ? 'chevron-up' : 'chevron-down'}
              size={12}
              color={model.color}
            />
            <Text style={[styles.thinkingLabel, { color: model.color }]}>
              {isStreaming && !content ? 'Thinking...' : 'Reasoning'}
            </Text>
          </TouchableOpacity>
        )}

        {showThinking && thinking && (
          <View style={[styles.thinkingBox, { borderColor: model.color + '20' }]}>
            <Text style={styles.thinkingText}>{thinking}</Text>
          </View>
        )}

        {/* Main content */}
        {content ? (
          <View style={styles.aiBubble}>
            {renderContent(content, false)}
            {isStreaming && (
              <View style={styles.cursor} />
            )}
          </View>
        ) : isStreaming ? (
          <View style={styles.aiBubble}>
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: Colors.bgUserMessage,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(108,142,245,0.2)',
  },
  userText: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  aiRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 10,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 2,
  },
  avatarIcon: {
    fontSize: 16,
  },
  aiContent: {
    flex: 1,
  },
  modelLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  thinkingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  thinkingLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  thinkingBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: Colors.bgCard,
  },
  thinkingText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  aiBubble: {
    backgroundColor: Colors.bgMessage,
    borderRadius: 4,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aiText: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 24,
  },
  bold: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cursor: {
    width: 2,
    height: 16,
    backgroundColor: Colors.accent,
    marginTop: 2,
    borderRadius: 1,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
  },
  dot1: { opacity: 1 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.3 },
});
