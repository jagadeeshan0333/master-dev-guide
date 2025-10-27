import React, { useState, useEffect, useRef } from 'react';
import { TypingIndicator as TypingIndicatorEntity } from '@/api/entities';
import { motion, AnimatePresence } from 'framer-motion';

export default function TypingIndicator({ roomId, currentUserId }) {
  const [typingUsers, setTypingUsers] = useState([]);
  const pollIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (!roomId) return;

    // Load typing users initially with delay
    setTimeout(() => {
      if (isMountedRef.current) {
        loadTypingUsers();
      }
    }, 500);

    // Poll every 3 seconds (reduced frequency)
    pollIntervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        loadTypingUsers();
      }
    }, 3000);

    return () => {
      isMountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [roomId, currentUserId]);

  const loadTypingUsers = async () => {
    if (!isMountedRef.current) return;

    try {
      const allTypingUsers = await TypingIndicatorEntity.filter({
        chat_room_id: roomId,
        is_typing: true
      }, '-last_typed_at', 5);

      if (!isMountedRef.current) return;

      const now = new Date();
      const activeUsers = allTypingUsers.filter(t => {
        if (t.user_id === currentUserId) return false;
        
        const lastTyped = new Date(t.last_typed_at);
        const secondsAgo = (now - lastTyped) / 1000;
        
        return secondsAgo < 10;
      });

      setTypingUsers(activeUsers);

      // Cleanup stale indicators (non-blocking)
      const staleUsers = allTypingUsers.filter(t => {
        const lastTyped = new Date(t.last_typed_at);
        const secondsAgo = (now - lastTyped) / 1000;
        return secondsAgo >= 10;
      });

      staleUsers.forEach(staleUser => {
        TypingIndicatorEntity.delete(staleUser.id).catch(() => {});
      });
    } catch (error) {
      // Silently ignore
    }
  };

  if (typingUsers.length === 0) return null;

  const typingText = typingUsers.length === 1
    ? `${typingUsers[0].user_name} is typing`
    : typingUsers.length === 2
    ? `${typingUsers[0].user_name} and ${typingUsers[1].user_name} are typing`
    : `${typingUsers[0].user_name} and ${typingUsers.length - 1} others are typing`;

  return (
    <div className="px-4 py-2 border-t bg-slate-50">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-2 text-sm text-slate-600"
        >
          <div className="flex gap-1">
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
          </div>
          <span className="italic">{typingText}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}