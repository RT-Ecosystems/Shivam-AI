import { useState, useCallback, useRef } from 'react';
import { Message, ModelKey } from '../constants/types';
import { MODELS } from '../constants/Colors';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

export function useGroq() {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [thinkingText, setThinkingText] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (
      messages: Message[],
      modelKey: ModelKey,
      onChunk: (text: string, thinking?: string) => void,
      onDone: (fullText: string, thinking?: string) => void,
      onError: (error: string) => void
    ) => {
      if (!API_KEY) {
        onError('API key not found. Please set GROQ_API_KEY in GitHub Secrets.');
        return;
      }

      setIsLoading(true);
      setStreamingText('');
      setThinkingText('');

      abortControllerRef.current = new AbortController();

      const model = MODELS[modelKey];
      const apiMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: model.id,
            messages: apiMessages,
            stream: true,
            temperature: modelKey === 'deepseek' ? 0.6 : 0.7,
            max_tokens: modelKey === 'deepseek' ? 8000 : 32000,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err?.error?.message || 'API error');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let fullThinking = '';

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

          for (const line of lines) {
            const data = line.replace('data: ', '').trim();
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;

              if (delta?.reasoning_content) {
                fullThinking += delta.reasoning_content;
                setThinkingText(fullThinking);
              }

              if (delta?.content) {
                fullText += delta.content;
                setStreamingText(fullText);
                onChunk(fullText, fullThinking || undefined);
              }
            } catch (_) {}
          }
        }

        setIsLoading(false);
        setStreamingText('');
        setThinkingText('');
        onDone(fullText, fullThinking || undefined);
      } catch (error: any) {
        setIsLoading(false);
        setStreamingText('');
        setThinkingText('');
        if (error.name !== 'AbortError') {
          onError(error.message || 'Something went wrong');
        }
      }
    },
    []
  );

  return {
    isLoading,
    streamingText,
    thinkingText,
    sendMessage,
    stopGeneration,
  };
        }
      
