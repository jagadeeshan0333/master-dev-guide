
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Message, User, TrustScoreLog, ModerationLog, Poll, PollVote, MessageReaction, TypingIndicator as TypingIndicatorEntity } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { MessageModerator } from "./MessageModerator";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Users, Settings, Send, Bot, MessageSquare, Paperclip, File, X, Loader2, ArrowDown, Plus, Reply, Pin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import LiveStockTicker from "./LiveStockTicker";
import MeetingControls from "./MeetingControls";
import TrustScoreBadge from "../ui/TrustScoreBadge";
import MessageContent from './MessageContent';
import CreatePollModal from '../polls/CreatePollModal';

import CommunitySentimentPoll from './CommunitySentimentPoll';
import TomorrowsPick from './TomorrowsPick';
import AdvisorRecommendedStocks from './AdvisorRecommendedStocks';

import AdDisplay from "@/components/dashboard/AdDisplay";

import TypingIndicator from './TypingIndicator';
import MessageSearchBar from './MessageSearchBar';
import PinnedMessagesSection from './PinnedMessagesSection';
import EditMessageModal from './EditMessageModal';
import DeleteMessageModal from './DeleteMessageModal';

import { Pencil, Trash2 } from 'lucide-react';

const sampleUsers = [
  { id: 'user1', display_name: 'TraderJoe', profile_color: '#3B82F6', email: 'joe@example.com', trust_score: 85 },
  { id: 'user2', display_name: 'CryptoKing', profile_color: '#8B5CF6', email: 'king@example.com', trust_score: 45 },
  { id: 'user3', display_name: 'StockSensei', profile_color: '#10B981', email: 'sensei@example.com', trust_score: 15 }
];

const sampleMessages = [
  { id: 'msg1', chat_room_id: '1', user_id: 'user1', created_by: 'joe@example.com', content: 'RELIANCE looks strong today!', created_date: new Date(Date.now() - 5 * 60 * 1000) },
  { id: 'msg2', chat_room_id: '1', user_id: 'user2', created_by: 'king@example.com', content: 'Agreed, volume is picking up.', created_date: new Date(Date.now() - 4 * 60 * 1000) },
  { id: 'msg3', chat_room_id: '1', is_bot: true, content: '🤖 RELIANCE is up 2.3% today with strong community sentiment at 65% Buy! Volume surge indicates institutional interest. 📈', created_date: new Date(Date.now() - 3 * 60 * 1000), message_type: 'bot_insight' },
  { id: 'msg4', chat_room_id: '1', user_id: 'user3', created_by: 'sensei@example.com', content: 'Thanks bot! What are the target levels?', created_date: new Date(Date.now() - 2 * 60 * 1000) }
];

const updateTrustScore = async (user, amount, reason, relatedEntityId = null) => {
  if (!user || !user.id) return;
  const currentScore = user.trust_score !== undefined ? user.trust_score : 50;
  const newScore = Math.max(0, Math.min(100, currentScore + amount));
  if (newScore === currentScore) return;

  try {
    await User.update(user.id, { trust_score: newScore });
    await TrustScoreLog.create({ user_id: user.id, change_amount: amount, reason, new_score: newScore, related_entity_id: relatedEntityId });
  } catch (error) {
    console.error("Failed to update trust score:", error);
  }
};

export default function ChatInterface({ room, user, onBack, onUpdateRoom, subscription }) {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [users, setUsers] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [priceData, setPriceData] = useState(null);
  const [showNewMessageBar, setShowNewMessageBar] = useState(false);
  const messagesEndRef = useRef(null);
  const chatFeedRef = useRef(null);
  const isMountedRef = useRef(true);
  const chatInitializedRef = useRef(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [moderationWarning, setModerationWarning] = useState(null);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [pollRefreshTrigger, setPollRefreshTrigger] = useState(0);
  const [latestPollStockSymbol, setLatestPollStockSymbol] = useState(room?.stock_symbol || "");

  const [typingTimeoutRef, setTypingTimeoutRef] = useState(null);
  const [replyingToMessageId, setReplyingToMessageId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    userId: 'all',
    messageType: 'all',
    dateFrom: null,
    dateTo: null
  });

  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showPinnedExpanded, setShowPinnedExpanded] = useState(true);

  const [editingMessage, setEditingMessage] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(null);

  // Throttle typing updates to max once per 2 seconds
  const lastTypingUpdateRef = useRef(0);

  const isUserAtBottom = useCallback(() => {
    const feed = chatFeedRef.current;
    if (!feed) return true;
    return feed.scrollHeight - feed.scrollTop <= feed.clientHeight + 50;
  }, []);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
    setShowNewMessageBar(false);
  }, []);

  const loadInitialData = useCallback(async () => {
    if (!room?.id) return;
    
    // Add delay to prevent race conditions
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!isMountedRef.current) return;

    setIsLoading(true);

    try {
      const fetchedMessages = await Message.filter({ chat_room_id: room.id }, 'created_date').catch(() => []);
      if (!isMountedRef.current) return;
      
      const finalMessages = fetchedMessages.length > 0 ? fetchedMessages : sampleMessages.filter((m) => m.chat_room_id === room.id);
      setMessages(finalMessages);
      setFilteredMessages(finalMessages);

      // Load pinned messages
      const pinned = await Message.filter({ chat_room_id: room.id, is_pinned: true }, '-pinned_at').catch(() => []);
      if (!isMountedRef.current) return;
      setPinnedMessages(pinned);

      const userEmails = [...new Set(finalMessages.filter((m) => !m.is_bot && m.created_by).map((m) => m.created_by))];
      pinned.forEach(msg => {
        if (!msg.is_bot && msg.created_by && !userEmails.includes(msg.created_by)) {
          userEmails.push(msg.created_by);
        }
      });

      if (userEmails.length > 0) {
        const fetchedUsers = await User.list().catch(() => []);
        if (!isMountedRef.current) return;
        
        const usersMap = (fetchedUsers.length > 0 ? fetchedUsers : sampleUsers).reduce((acc, u) => {
          acc[u.email || u.id] = u;
          return acc;
        }, {});
        setUsers(usersMap);
      }

    } catch (error) {
      if (!isMountedRef.current) return;
      console.error("Error loading initial data:", error);
      setMessages(sampleMessages.filter((m) => m.chat_room_id === room.id));
      setFilteredMessages(sampleMessages.filter((m) => m.chat_room_id === room.id));
      setPinnedMessages([]);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [room?.id]);

  const postBotMessage = useCallback(async (content) => {
    if (!room?.id || !isMountedRef.current) return;

    const botMessage = {
      id: 'bot_' + Date.now(),
      chat_room_id: room.id,
      content,
      is_bot: true,
      message_type: 'bot_insight',
      created_date: new Date()
    };

    setMessages((prev) => [...prev, botMessage]);

    try {
      await Message.create({
        chat_room_id: room.id,
        content,
        is_bot: true,
        message_type: 'bot_insight'
      });
    } catch (error) {
      console.error("Failed to save bot message:", error);
    }
  }, [room?.id]);

  useEffect(() => {
    isMountedRef.current = true;
    loadInitialData();

    return () => {
      isMountedRef.current = false;
      if (typingTimeoutRef) {
        clearTimeout(typingTimeoutRef);
      }
    };
  }, [loadInitialData]);

  useEffect(() => {
    if (isLoading) return;

    const wasAtBottom = isUserAtBottom();

    setTimeout(() => {
      if (wasAtBottom) {
        scrollToBottom('auto');
      } else {
        if (messages.length > 0) {
          setShowNewMessageBar(true);
        }
      }
    }, 50);

  }, [messages, isLoading, isUserAtBottom, scrollToBottom]);

  useEffect(() => {
    if (!isLoading && !chatInitializedRef.current && room?.id) {
      chatInitializedRef.current = true;
      setTimeout(() => {
        postBotMessage("🤖 AI Assistant is online! Use /ping to test or /trend for market data. Type /help for all commands.");
      }, 1000);
    }
  }, [isLoading, room?.id, postBotMessage]);

  const handleScroll = () => {
    if (isUserAtBottom()) {
      setShowNewMessageBar(false);
    } else if (messages.length > 0) {
      setShowNewMessageBar(true);
    }
  };

  // Throttled typing indicator - max once per 2 seconds
  const handleTyping = useCallback(async () => {
    if (!user || !room?.id) return;

    const now = Date.now();
    if (now - lastTypingUpdateRef.current < 2000) {
      return; // Skip if less than 2 seconds since last update
    }
    lastTypingUpdateRef.current = now;

    try {
      if (typingTimeoutRef) {
        clearTimeout(typingTimeoutRef);
      }

      // Create new typing indicator (backend cleanup handles old ones)
      await TypingIndicatorEntity.create({
        chat_room_id: room.id,
        user_id: user.id,
        user_name: user.display_name || 'User',
        is_typing: true,
        last_typed_at: new Date().toISOString()
      });

      const timeoutId = setTimeout(() => {
        setTypingTimeoutRef(null);
      }, 3000);

      setTypingTimeoutRef(timeoutId);
    } catch (error) {
      // Silently ignore
    }
  }, [user, room?.id, typingTimeoutRef]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (typingTimeoutRef) {
      clearTimeout(typingTimeoutRef);
      setTypingTimeoutRef(null);
    }

    if ((!newMessage.trim() && !file) || !user || isSending) return;

    setIsSending(true);

    if (user.trust_score !== undefined && user.trust_score < 20) {
      alert("Your trust score is too low. You are currently muted and cannot send messages.");
      setIsSending(false);
      return;
    }

    const content = newMessage.trim();

    let replyMetadata = null;
    if (replyingToMessageId) {
      const originalMessage = messages.find(m => m.id === replyingToMessageId);
      if (originalMessage) {
        const originalMessageUser = getUserForMessage(originalMessage);
        replyMetadata = {
          reply_to_message_id: originalMessage.id,
          reply_to_user_name: originalMessageUser.display_name,
          reply_to_content: originalMessage.content?.substring(0, 100) || "Original message"
        };
      }
    }

    if (file) {
      setIsUploading(true);
      const tempMessageId = Date.now().toString();
      const optimisticMessage = {
        id: tempMessageId,
        chat_room_id: room.id,
        content: content || file.name,
        user_id: user.id,
        message_type: file.type.startsWith('image/') ? 'image' : 'file',
        file_name: file.name,
        file_url: URL.createObjectURL(file),
        created_by: user.email,
        created_date: new Date(),
        isOptimistic: true,
        ...(replyMetadata && replyMetadata)
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage("");
      setFile(null);
      setReplyingToMessageId(null);

      try {
        const { file_url } = await UploadFile({ file });

        const fileMessageData = {
          chat_room_id: room.id,
          content: content || file.name,
          user_id: user.id,
          message_type: file.type.startsWith('image/') ? 'image' : 'file',
          file_url,
          file_name: file.name,
          created_by: user.email,
          ...(replyMetadata && replyMetadata)
        };

        const createdMessage = await Message.create(fileMessageData);
        setMessages((prev) => prev.map((msg) => msg.id === tempMessageId ? createdMessage : msg));
        await updateTrustScore(user, 0.2, "Shared a file in chat", createdMessage.id);
      } catch (error) {
        console.error("File upload failed", error);
        alert("Failed to upload file. Please try again.");
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
      } finally {
        setIsUploading(false);
        setIsSending(false);
      }
      return;
    }

    const moderationResult = MessageModerator.moderateMessage(content);

    if (moderationResult.isViolation) {
      const violationMessage = MessageModerator.getViolationMessage(moderationResult.violations);
      setModerationWarning(violationMessage);

      try {
        await ModerationLog.create({
          user_id: user.id,
          chat_room_id: room.id,
          message_content: content,
          violation_type: moderationResult.violations[0].type,
          severity: moderationResult.violations[0].severity,
          action_taken: 'blocked'
        });

        const scoreDeduction = moderationResult.violations[0].severity === 'high' ? -10 : -5;
        await updateTrustScore(user, scoreDeduction, `Message blocked: ${moderationResult.violations[0].reason}`, null);
      } catch (error) {
        console.error("Failed to log moderation violation:", error);
      }

      setTimeout(() => setModerationWarning(null), 5000);
      setNewMessage("");
      setReplyingToMessageId(null);
      setIsSending(false);
      return;
    }

    if (content.startsWith('/')) {
      const [command] = content.split(' ');
      switch (command) {
        case '/ping':
          postBotMessage('🤖 Bot is online and ready! ✅');
          break;
        case '/trend':
          if (priceData) {
            const trendMessage = `📊 ${priceData.symbol} is ₹${priceData.current_price.toFixed(2)}, ${priceData.change_percent >= 0 ? '📈' : '📉'} ${Math.abs(priceData.change_percent)}% today.`;
            postBotMessage(trendMessage);
          } else {
            postBotMessage('❌ Unable to fetch stock trend data at the moment. Please try later.');
          }
          break;
        case '/help':
          postBotMessage('🤖 Available commands:\n/ping - Check bot status\n/trend - Get current stock trend\n/rules - View community guidelines');
          break;
        case '/rules':
          postBotMessage('📋 Community Guidelines:\n• Keep discussions respectful and professional\n• No personal contact sharing (WhatsApp/Telegram)\n• No scam links or fraudulent content\n• Focus on legitimate trading strategies\n• Maintain a positive trading environment');
          break;
        default:
          postBotMessage(`❓ Unknown command: ${command}. Try /help for available commands.`);
      }
      setNewMessage("");
      setReplyingToMessageId(null);
      setIsSending(false);
      return;
    }

    if (user.trust_score !== undefined && user.trust_score < 40) {
      setModerationWarning("⚠️ Your trust score is low. Messages may be reviewed by moderators.");
      setTimeout(() => setModerationWarning(null), 3000);
    }

    const tempId = Date.now().toString();
    const messageData = {
      id: tempId,
      chat_room_id: room.id,
      content: content,
      user_id: user.id,
      message_type: 'text',
      created_by: user.email,
      created_date: new Date(),
      ...(replyMetadata && replyMetadata)
    };

    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");
    setReplyingToMessageId(null);

    try {
      const createdMessage = await Message.create({
        chat_room_id: room.id,
        content: content,
        user_id: user.id,
        message_type: 'text',
        created_by: user.email,
        ...(replyMetadata && replyMetadata)
      });

      setMessages((prev) => prev.map((msg) => msg.id === tempId ? createdMessage : msg));
      await updateTrustScore(user, 0.1, "Sent a valid message in chat", createdMessage.id);
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert("Unsupported file type. Please upload a PNG, JPEG, or PDF.");
        e.target.value = null;
        setFile(null);
        return;
      }
      const maxSizeMB = 5;
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        alert(`File size exceeds ${maxSizeMB}MB limit.`);
        e.target.value = null;
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const getUserForMessage = (message) => {
    if (message.is_bot) {
      return { display_name: 'AI Assistant', profile_color: '#6B7280', isBot: true };
    }
    const msgUser = users[message.created_by] || { display_name: 'Unknown', profile_color: '#64748B' };
    return msgUser;
  };

  const handleCreatePoll = async (pollData) => {
    if (!user) {
      toast.error("Please log in to create a poll!");
      return;
    }

    try {
      const newPoll = await Poll.create({
        ...pollData,
        chatroom_id: room.id,
        creation_source: "chatroom",
        is_active: true,
        created_by_admin: user.app_role === 'admin' || user.app_role === 'super_admin',
        created_by_role: user.app_role
      });

      toast.success("Poll created successfully!");
      setShowCreatePollModal(false);

      setLatestPollStockSymbol(newPoll.stock_symbol);

      await postBotMessage(`📊 New poll created: "${newPoll.title}". Cast your vote in the sidebar!`);

      await new Promise(resolve => setTimeout(resolve, 500));

      setPollRefreshTrigger(prev => prev + 1);

      await loadInitialData();

      if (onUpdateRoom) {
        onUpdateRoom();
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error("Failed to create poll. Please try again.");
    }
  };

  const handleReply = (messageId) => {
    setReplyingToMessageId(messageId);
  };

  const handleCancelReply = () => {
    setReplyingToMessageId(null);
    setNewMessage("");
  };

  const handlePinMessage = async (messageId) => {
    if (!user || (user.app_role !== 'admin' && user.app_role !== 'super_admin')) {
      toast.error('Only admins can pin messages');
      return;
    }

    try {
      const messageToPin = messages.find(m => m.id === messageId);
      if (!messageToPin) {
        toast.error('Message not found.');
        return;
      }

      await Message.update(messageId, {
        is_pinned: true,
        pinned_by: user.id,
        pinned_at: new Date().toISOString()
      });

      const updatedPinnedMessage = { ...messageToPin, is_pinned: true, pinned_by: user.id, pinned_at: new Date().toISOString() };
      setPinnedMessages(prev => {
        const newPinned = [...prev.filter(m => m.id !== messageId), updatedPinnedMessage];
        return newPinned.sort((a, b) => new Date(b.pinned_at) - new Date(a.pinned_at));
      });

      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, is_pinned: true, pinned_by: user.id, pinned_at: new Date().toISOString() } : msg));
      setFilteredMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, is_pinned: true, pinned_by: user.id, pinned_at: new Date().toISOString() } : msg));

      toast.success('Message pinned successfully');
    } catch (error) {
      console.error('Error pinning message:', error);
      toast.error('Failed to pin message');
    }
  };

  const handleUnpinMessage = async (messageId) => {
    if (!user || (user.app_role !== 'admin' && user.app_role !== 'super_admin')) {
      toast.error('Only admins can unpin messages');
      return;
    }

    try {
      await Message.update(messageId, {
        is_pinned: false,
        pinned_by: null,
        pinned_at: null
      });

      setPinnedMessages(prev => prev.filter(m => m.id !== messageId));

      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, is_pinned: false, pinned_by: null, pinned_at: null } : msg));
      setFilteredMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, is_pinned: false, pinned_by: null, pinned_at: null } : msg));

      toast.success('Message unpinned successfully');
    } catch (error) {
      console.error('Error unpinning message:', error);
      toast.error('Failed to unpin message');
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      await Message.update(messageId, {
        content: newContent,
        is_edited: true,
        edited_at: new Date().toISOString()
      });

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, is_edited: true, edited_at: new Date().toISOString() }
          : msg
      ));

      setFilteredMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, is_edited: true, edited_at: new Date().toISOString() }
          : msg
      ));

      toast.success('Message updated successfully');
      setEditingMessage(null);
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
      throw error;
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await Message.update(messageId, {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: user.id
      });

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: user.id }
          : msg
      ));

      setFilteredMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: user.id }
          : msg
      ));

      toast.success('Message deleted');
      setDeletingMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
      throw error;
    }
  };

  const canEditMessage = (msg) => {
    if (!user || msg.is_bot || msg.is_deleted || msg.message_type === 'image' || msg.message_type === 'file') return false;
    return msg.created_by === user.email;
  };

  const canDeleteMessage = (msg) => {
    if (!user || msg.is_bot || msg.is_deleted) return false;
    return msg.created_by === user.email || 
           user.app_role === 'admin' || 
           user.app_role === 'super_admin';
  };

  useEffect(() => {
    let result = [...messages];

    if (searchTerm) {
      result = result.filter(msg =>
        msg.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeFilters.userId !== 'all') {
      result = result.filter(msg => msg.user_id === activeFilters.userId);
    }

    if (activeFilters.messageType !== 'all') {
      if (activeFilters.messageType === 'bot_insight') {
        result = result.filter(msg => msg.is_bot);
      } else {
        result = result.filter(msg => msg.message_type === activeFilters.messageType);
      }
    }

    if (activeFilters.dateFrom) {
      result = result.filter(msg => new Date(msg.created_date) >= activeFilters.dateFrom);
    }
    if (activeFilters.dateTo) {
      const dateTo = new Date(activeFilters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      result = result.filter(msg => new Date(msg.created_date) <= dateTo);
    }

    setFilteredMessages(result);
  }, [messages, searchTerm, activeFilters]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
        <div className="p-4 pb-2 flex-shrink-0 space-y-2">
          <LiveStockTicker stockSymbol={latestPollStockSymbol || room.stock_symbol} onPriceUpdate={setPriceData} />
          <MeetingControls
            chatRoomId={room.id}
            stockSymbol={latestPollStockSymbol || room.stock_symbol}
            onMeetingStart={(meeting) => postBotMessage(`Meeting started! Join here: ${meeting.meeting_url}`)}
            onMeetingEnd={() => postBotMessage('Meeting has ended.')}
          />
        </div>

        <div className="flex-1 flex gap-4 px-4 pb-4 min-h-0">
          <Card className="flex-1 flex flex-col shadow-lg border-0 bg-white">
            <CardHeader className="flex-shrink-0 flex flex-row items-center gap-4 border-b bg-white">
              <Button
                size="icon"
                onClick={onBack}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 h-10 w-10 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">{room.name}</h1>
                <p className="text-xs md:text-sm text-slate-600 truncate">{room.description}</p>
              </div>
              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  <Users className="w-3 h-3 mr-1" />
                  {room.participant_count || 0} members
                </Badge>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setShowCreatePollModal(true)}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-300"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <div className="px-4 py-3 border-b bg-slate-50">
              <MessageSearchBar
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                users={Object.values(users)}
              />
            </div>

            {moderationWarning && (
              <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {moderationWarning}
              </div>
            )}

            <PinnedMessagesSection
              pinnedMessages={pinnedMessages}
              users={users}
              onUnpin={handleUnpinMessage}
              currentUser={user}
              expanded={showPinnedExpanded}
              onToggleExpand={() => setShowPinnedExpanded(!showPinnedExpanded)}
            />

            <div className="relative flex-1 min-h-0">
              <CardContent
                ref={chatFeedRef}
                onScroll={handleScroll}
                className="overflow-y-auto p-4 md:p-6 space-y-4 h-full"
              >
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-2/3" />
                    ))}
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <MessageSquare className="w-12 h-12 mb-4" />
                    <h3 className="text-lg font-semibold">
                      {searchTerm || activeFilters.userId !== 'all' || activeFilters.messageType !== 'all' || activeFilters.dateFrom || activeFilters.dateTo
                        ? 'No messages found matching your criteria.'
                        : `Welcome to ${room.name}!`}
                    </h3>
                    <p className="text-center">
                      {searchTerm || activeFilters.userId !== 'all' || activeFilters.messageType !== 'all' || activeFilters.dateFrom || activeFilters.dateTo
                        ? 'Try adjusting your search or filters.'
                        : 'Start the discussion or use /trend to see market data.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {(searchTerm || activeFilters.userId !== 'all' || activeFilters.messageType !== 'all' || activeFilters.dateFrom || activeFilters.dateTo) && (
                      <div className="text-center py-2">
                        <Badge variant="secondary" className="text-xs">
                          {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} found
                        </Badge>
                      </div>
                    )}

                    {messages.length > 5 && messages.length % 10 === 0 && (
                      <div className="flex justify-center my-4">
                        <AdDisplay
                          placement="chatrooms"
                          userContext={{ stock_symbol: room.stock_symbol }}
                          className="max-w-sm"
                        />
                      </div>
                    )}

                    {filteredMessages.map((msg) => {
                      const msgUser = getUserForMessage(msg);
                      const isCurrentUser = msg.created_by === user?.email && !msg.is_bot;
                      const isBot = msg.is_bot;
                      const isReplying = replyingToMessageId === msg.id;

                      return (
                        <div key={msg.id}>
                          <div className={`flex items-start gap-2 group ${isCurrentUser ? 'justify-end' : ''}`}>
                            {!isCurrentUser && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                {isBot ? (
                                  <AvatarFallback className="bg-slate-600">
                                    <Bot className="w-4 h-4 text-white" />
                                  </AvatarFallback>
                                ) : (
                                  <AvatarFallback style={{ backgroundColor: msgUser.profile_color, color: 'white' }}>
                                    {msgUser.display_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            )}

                            <div className={`flex-1 max-w-xs md:max-w-md ${isCurrentUser ? 'flex flex-col items-end' : ''}`}>
                              {!isCurrentUser && !isBot && (
                                <div className="text-xs font-bold mb-1 flex items-center gap-1" style={{ color: msgUser.profile_color }}>
                                  <span>{msgUser.display_name}</span>
                                  <TrustScoreBadge score={msgUser.trust_score} showScore={false} size="xs" />
                                </div>
                              )}
                              {isBot && (
                                <div className="text-xs font-bold mb-1 text-blue-600 flex items-center gap-1">
                                  <span>AI Assistant</span>
                                </div>
                              )}

                              <div className={`
                                ${isCurrentUser ? 'bg-blue-600 text-white rounded-2xl rounded-br-none px-3 py-2 inline-block' :
                                  isBot ? 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-none border-l-4 border-blue-500 px-3 py-2 inline-block' :
                                    'inline-block'
                                }
                                ${msg.is_deleted ? 'opacity-60 italic text-slate-500' : ''}
                              `}>
                                {msg.is_deleted ? (
                                  <span>Message deleted.</span>
                                ) : (
                                  <MessageContent
                                    message={msg}
                                    user={user}
                                    onReply={() => handleReply(msg.id)}
                                  />
                                )}
                              </div>

                              <p className="text-xs mt-1 text-slate-400">
                                {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
                                {msg.is_edited && !msg.is_deleted && <span className="ml-1 text-xs text-slate-500">(edited)</span>}
                              </p>
                            </div>

                            {!isBot && msg.id && !msg.id.startsWith('bot_') && !msg.is_deleted && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center">
                                    <Plus className="w-4 h-4 text-slate-600" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2" align="start">
                                  {user && (
                                    <>
                                      <button
                                        onClick={() => handleReply(msg.id)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left text-sm"
                                      >
                                        <Reply className="w-4 h-4" />
                                        Reply
                                      </button>

                                      {canEditMessage(msg) && (
                                        <button
                                          onClick={() => setEditingMessage(msg)}
                                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-left text-sm text-blue-700"
                                        >
                                          <Pencil className="w-4 h-4" />
                                          Edit Message
                                        </button>
                                      )}

                                      {canDeleteMessage(msg) && (
                                        <button
                                          onClick={() => setDeletingMessage(msg)}
                                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left text-sm text-red-700"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          Delete Message
                                        </button>
                                      )}

                                      {(user.app_role === 'admin' || user.app_role === 'super_admin') && (
                                        <button
                                          onClick={() => msg.is_pinned ? handleUnpinMessage(msg.id) : handlePinMessage(msg.id)}
                                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-50 transition-colors text-left text-sm text-amber-700"
                                        >
                                          <Pin className="w-4 h-4" />
                                          {msg.is_pinned ? 'Unpin Message' : 'Pin Message'}
                                        </button>
                                      )}
                                    </>
                                  )}
                                </PopoverContent>
                              </Popover>
                            )}

                            {isCurrentUser && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback style={{ backgroundColor: msgUser.profile_color, color: 'white' }}>
                                  {msgUser.display_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>

                          {isReplying && user && (
                            <div className={`mt-2 ${isCurrentUser ? 'ml-auto' : 'ml-10'} bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500 max-w-xs md:max-w-md`}>
                              <div className="flex items-center gap-2 mb-2">
                                <Reply className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-semibold text-blue-800">
                                  Replying to {msgUser.display_name}
                                </span>
                                <button
                                  onClick={handleCancelReply}
                                  className="ml-auto text-slate-500 hover:text-slate-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm text-slate-600 mb-3 line-clamp-2">{msg.content}</p>

                              <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                  placeholder="Type your reply..."
                                  value={newMessage}
                                  onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    handleTyping();
                                  }}
                                  className="flex-1"
                                  autoFocus
                                  disabled={isSending}
                                />
                                <Button
                                  type="submit"
                                  size="sm"
                                  disabled={!newMessage.trim() || isSending}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </Button>
                              </form>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} className="h-1" />
                  </>
                )}
              </CardContent>

              {showNewMessageBar && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                  <Button
                    onClick={() => scrollToBottom('smooth')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg animate-bounce"
                  >
                    <ArrowDown className="w-4 h-4 mr-2" />
                    New messages
                  </Button>
                </div>
              )}
            </div>

            <TypingIndicator roomId={room.id} currentUserId={user?.id} />

            {!replyingToMessageId && (
              <CardFooter className="flex-shrink-0 border-t p-4 bg-white flex flex-col">
                {file && (
                  <div className="flex items-center gap-2 p-2 mb-2 bg-slate-100 border border-slate-200 rounded-lg w-full">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt="preview" className="h-8 w-8 object-cover rounded" />
                    ) : (
                      <File className="w-5 h-5 text-slate-500" />
                    )}
                    <span className="text-sm text-slate-700 truncate flex-1">{file.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0"
                    disabled={!user || (user.trust_score !== undefined && user.trust_score < 20) || isUploading || isSending}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/png, image/jpeg, application/pdf"
                  />

                  <Input
                    placeholder={
                      !user ? "Please log in to chat..." :
                        (user.trust_score !== undefined && user.trust_score < 20) ? "Account muted due to low trust score..." :
                          "Type your message or /command..."
                    }
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    className="flex-1"
                    disabled={!user || (user.trust_score !== undefined && user.trust_score < 20) || isUploading || isSending}
                  />

                  <Button
                    type="submit"
                    size="icon"
                    disabled={(!newMessage.trim() && !file) || !user || (user.trust_score !== undefined && user.trust_score < 20) || isUploading || isSending}
                    className="flex-shrink-0"
                  >
                    {isUploading || isSending ? <Loader2 className="h-4 h-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
                {user && user.trust_score < 20 && (
                  <p className="text-xs text-red-600 mt-1">
                    Your account is muted due to low trust score. Contact support to resolve.
                  </p>
                )}
              </CardFooter>
            )}
          </Card>

          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="h-full flex flex-col space-y-4 overflow-y-auto">
              <CommunitySentimentPoll
                stockSymbol={latestPollStockSymbol || room.stock_symbol}
                user={user}
                refreshTrigger={pollRefreshTrigger}
              />

              <TomorrowsPick />

              <AdvisorRecommendedStocks />
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="p-4">
            <CommunitySentimentPoll
              stockSymbol={latestPollStockSymbol || room.stock_symbol}
              user={user}
              refreshTrigger={pollRefreshTrigger}
            />
          </div>

          <div className="p-4">
            <TomorrowsPick />
          </div>

          <div className="p-4">
            <AdvisorRecommendedStocks />
          </div>
        </div>
      </div>

      <CreatePollModal
        open={showCreatePollModal}
        onClose={() => setShowCreatePollModal(false)}
        room={room}
        user={user}
        onCreatePoll={handleCreatePoll}
      />

      {editingMessage && (
        <EditMessageModal
          open={!!editingMessage}
          onClose={() => setEditingMessage(null)}
          message={editingMessage}
          onSave={(newContent) => handleEditMessage(editingMessage.id, newContent)}
        />
      )}

      {deletingMessage && (
        <DeleteMessageModal
          open={!!deletingMessage}
          onClose={() => setDeletingMessage(null)}
          onConfirm={() => handleDeleteMessage(deletingMessage.id)}
        />
      )}
    </div>
  );
}
