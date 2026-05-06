import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, MODELS } from '../constants/Colors';
import { Message, ModelKey } from '../constants/types';
import { useGroq } from '../hooks/useGroq';
import { useStorage } from '../hooks/useStorage';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import ModelPicker from '../components/ModelPicker';

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [modelPickerVisible, setModelPickerVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelKey>('deepseek');
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const { isLoading, streamingText, thinkingText, sendMessage, stopGeneration } = useGroq();
  const {
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
  } = useStorage();

  // Sync model with active chat
  useEffect(() => {
    if (activeChat) {
      setCurrentModel(activeChat.model);
    }
  }, [activeChatId]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    if (streamingText || isLoading) scrollToBottom();
  }, [streamingText, isLoading]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');

    // Create new chat if none exists
    let chatId = activeChatId;
    if (!chatId) {
      chatId = await createNewChat(currentModel);
    }

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(36) + 'u',
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    await addMessage(chatId, userMsg);

    // Add placeholder AI message
    const aiMsgId = Date.now().toString(36) + 'a';
    const aiMsg: Message = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: currentModel,
    };
    await addMessage(chatId, aiMsg);
    setStreamingMsgId(aiMsgId);
    scrollToBottom();

    // Get all messages for context
    const historyMessages = [
      ...(activeChat?.messages || []),
      userMsg,
    ];

    await sendMessage(
      historyMessages,
      currentModel,
      (text, thinking) => {
        updateLastMessage(chatId!, text, thinking);
      },
      (fullText, thinking) => {
        updateLastMessage(chatId!, fullText, thinking);
        setStreamingMsgId(null);
        scrollToBottom();
      },
      (error) => {
        updateLastMessage(chatId!, `❌ Error: ${error}`);
        setStreamingMsgId(null);
      }
    );
  }, [
    inputText, isLoading, activeChatId, activeChat,
    currentModel, createNewChat, addMessage, sendMessage,
    updateLastMessage, scrollToBottom,
  ]);

  const handleNewChat = useCallback(async () => {
    await createNewChat(currentModel);
  }, [createNewChat, currentModel]);

  const handleModelSelect = useCallback(
    async (model: ModelKey) => {
      setCurrentModel(model);
      if (activeChatId) {
        await updateChatModel(activeChatId, model);
      }
    },
    [activeChatId, updateChatModel]
  );

  const messages = activeChat?.messages || [];

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isStreaming = item.id === streamingMsgId;
    return (
      <ChatMessage
        message={item}
        isStreaming={isStreaming}
        streamingText={isStreaming ? streamingText : undefined}
        thinkingText={isStreaming ? thinkingText : undefined}
        currentModel={currentModel}
      />
    );
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <Header
        onToggleSidebar={() => setSidebarVisible(true)}
        onNewChat={handleNewChat}
        currentModel={currentModel}
        onToggleModel={() => setModelPickerVisible(true)}
      />

      {/* Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={handleNewChat}
        onDeleteChat={deleteChat}
        onClose={() => setSidebarVisible(false)}
      />

      {/* Model Picker */}
      <ModelPicker
        visible={modelPickerVisible}
        currentModel={currentModel}
        onSelect={handleModelSelect}
        onClose={() => setModelPickerVisible(false)}
      />

      {/* Chat area */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeLogoWrap}>
              <View style={styles.welcomeLogo}>
                <Text style={styles.welcomeLogoText}>S</Text>
              </View>
              <View style={styles.welcomeGlow} />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to Shivam AI</Text>
            <Text style={styles.welcomeSub}>
              Powered by {MODELS[currentModel].name} · Ask me anything
            </Text>
            <View style={styles.suggestionsRow}>
              {[
                'Explain quantum computing',
                'Write a Python script',
                'What is React Native?',
              ].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.suggestion}
                  onPress={() => { setInputText(s); }}
                >
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={scrollToBottom}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input Bar */}
        <SafeAreaView edges={['bottom']} style={styles.inputSafeArea}>
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message Shivam AI..."
                placeholderTextColor={Colors.textMuted}
                multiline
                maxLength={4000}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                blurOnSubmit={false}
              />
              {isLoading ? (
                <TouchableOpacity style={[styles.sendBtn, styles.stopBtn]} onPress={stopGeneration}>
                  <Ionicons name="stop" size={16} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                  onPress={handleSend}
                  disabled={!inputText.trim()}
                >
                  <Ionicons name="arrow-up" size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.inputHint}>
              {MODELS[currentModel].icon} {MODELS[currentModel].name} · Long press chat to delete
            </Text>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: { flex: 1 },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Welcome screen
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  welcomeLogoWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  welcomeLogo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 36,
    backgroundColor: Colors.accentGlow,
  },
  welcomeLogoText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  suggestionsRow: {
    marginTop: 16,
    gap: 8,
    width: '100%',
  },
  suggestion: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },

  // Input
  inputSafeArea: {
    backgroundColor: Colors.bg,
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: Colors.bgInput,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    maxHeight: 120,
    paddingTop: 4,
    paddingBottom: 4,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.bgSurface,
  },
  stopBtn: {
    backgroundColor: Colors.error,
  },
  inputHint: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
      
