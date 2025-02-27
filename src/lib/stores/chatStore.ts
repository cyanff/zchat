import { writable } from 'svelte/store';

export type ChatMessage = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

export type Chat = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
};

type ChatState = {
  chats: Chat[];
  activeChat: string | null;
};

const createChatStore = () => {
  // Initial chats
  const welcomeChat: Chat = {
    id: 'welcome',
    title: 'Welcome to T3 Chat',
    messages: [],
    createdAt: new Date(),
  };

  const faqChat: Chat = {
    id: 'faq',
    title: 'FAQ',
    messages: [],
    createdAt: new Date(),
  };

  const initialState: ChatState = {
    chats: [welcomeChat, faqChat],
    activeChat: 'welcome',
  };

  const { subscribe, update } = writable<ChatState>(initialState);

  return {
    subscribe,
    
    setActiveChat: (chatId: string) => {
      update((state) => ({
        ...state,
        activeChat: chatId,
      }));
    },
    
    addChat: (title: string) => {
      const id = crypto.randomUUID();
      const newChat: Chat = {
        id,
        title,
        messages: [],
        createdAt: new Date(),
      };
      
      update((state) => ({
        ...state,
        chats: [...state.chats, newChat],
        activeChat: id,
      }));
      
      return id;
    },
    
    deleteChat: (chatId: string) => {
      update((state) => {
        const newChats = state.chats.filter((chat) => chat.id !== chatId);
        const newActiveChat = state.activeChat === chatId 
          ? (newChats.length > 0 ? newChats[0].id : null) 
          : state.activeChat;
          
        return {
          ...state,
          chats: newChats,
          activeChat: newActiveChat,
        };
      });
    },
    
    addMessage: (chatId: string, content: string, role: 'user' | 'assistant') => {
      const messageId = crypto.randomUUID();
      
      update((state) => {
        const newChats = state.chats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: messageId,
                  content,
                  role,
                  timestamp: new Date(),
                },
              ],
            };
          }
          return chat;
        });
        
        return {
          ...state,
          chats: newChats,
        };
      });
      
      return messageId;
    },
  };
};

export const chatStore = createChatStore(); 