import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import LLMService from '../services/llm';
import StorageService from '../utils/storage';

export default function PracticeScreen() {
  const { userProfile, llmConnected } = useApp();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = async () => {
    const history = await StorageService.getConversationHistory();
    if (history && history.length > 0) {
      setMessages(history);
    } else {
      // Welcome message
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm your ${userProfile?.targetLanguage} tutor. Let's practice together! Feel free to write in ${userProfile?.targetLanguage}, and I'll respond naturally. I'll gently correct any mistakes and help you improve. 😊`
        }
      ]);
    }
  };

  const saveConversationHistory = async (newMessages) => {
    await StorageService.saveConversationHistory(newMessages);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    if (!llmConnected) {
      Alert.alert('LLM Not Connected', 'Please configure your LLM connection in Settings.');
      return;
    }

    const userMessage = {
      role: 'user',
      content: inputText.trim()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsSending(true);

    try {
      const result = await LLMService.chat(
        userMessage.content,
        updatedMessages,
        userProfile.targetLanguage
      );

      if (result.success) {
        const assistantMessage = {
          role: 'assistant',
          content: result.text
        };
        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        await saveConversationHistory(finalMessages);
      } else {
        Alert.alert('Error', result.error || 'Failed to get response');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearConversationHistory();
            setMessages([
              {
                role: 'assistant',
                content: `Hello! I'm your ${userProfile?.targetLanguage} tutor. Let's practice together! 😊`
              }
            ]);
          }
        }
      ]
    );
  };

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Conversation Practice 💬</Text>
          <Text style={styles.headerSubtitle}>
            Chat in {userProfile.targetLanguage}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearHistory}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        ref={(ref) => {
          this.scrollView = ref;
        }}
        onContentSizeChange={() => {
          this.scrollView?.scrollToEnd({ animated: true });
        }}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.role === 'user'
                ? styles.userBubble
                : styles.assistantBubble
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.role === 'user'
                  ? styles.userText
                  : styles.assistantText
              ]}
            >
              {message.content}
            </Text>
          </View>
        ))}

        {isSending && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`Type in ${userProfile.targetLanguage}...`}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}
        >
          <Text style={styles.sendButtonText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  clearButton: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F0F0F0'
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  messagesContainer: {
    flex: 1
  },
  messagesContent: {
    padding: 20,
    gap: 12
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22
  },
  userText: {
    color: '#FFF'
  },
  assistantText: {
    color: '#000'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
    gap: 8
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000'
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC'
  },
  sendButtonText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold'
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 50
  }
});
