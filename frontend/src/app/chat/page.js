'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { addMessage, updateSeen, setActiveChat, fetchConversations, fetchMessages } from '@/store/slices/chatSlice';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Send, Image as ImageIcon, Search } from 'lucide-react';
import { format } from 'date-fns';

function ChatContent() {
  const dispatch = useDispatch();
  const socket = getSocket();
  const { user } = useSelector(state => state.auth);
  const { conversations, messages, activeChat, typingUsers } = useSelector(state => state.chat);
  
  const searchParams = useSearchParams();
  const queryUser = searchParams.get('user');
  
  const [msgInput, setMsgInput] = useState('');
  const [search, setSearch] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (queryUser) {
      dispatch(setActiveChat(queryUser));
    }
  }, [queryUser, dispatch]);

  useEffect(() => {
    dispatch(fetchConversations());
    
    // Socket listener setup
    if (socket) {
      const handleMessage = (msg) => {
        dispatch(addMessage({ 
          partnerId: msg.sender._id === user._id ? msg.receiver._id : msg.sender._id, 
          message: msg 
        }));
        if (msg.sender._id === activeChat && !msg.isRead) {
          socket.emit('messageSeen', { messageIds: [msg._id], senderId: msg.sender._id });
        }
      };
      const handleTyping = ({ senderId, isTyping }) => dispatch({ type: 'chat/setTyping', payload: { senderId, isTyping } });
      const handleSeen = ({ messageIds, seenBy }) => dispatch(updateSeen({ messageIds, partnerId: seenBy }));

      socket.on('receiveMessage', handleMessage);
      socket.on('typing', handleTyping);
      socket.on('messageSeen', handleSeen);

      return () => {
        socket.off('receiveMessage', handleMessage);
        socket.off('typing', handleTyping);
        socket.off('messageSeen', handleSeen);
      };
    }
  }, [socket, dispatch, activeChat, user?._id]);

  useEffect(() => {
    if (activeChat && !messages[activeChat]) {
      dispatch(fetchMessages({ userId: activeChat }));
    }
    // Auto scroll
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeChat, messages, dispatch]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeChat) return;
    
    // Optimistic UI update
    const optimisticMsg = {
      _id: `temp_${Date.now()}`,
      content: msgInput,
      sender: { _id: user._id, name: user.name },
      receiver: { _id: activeChat, name: activePartner?.name },
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    dispatch(addMessage({ partnerId: activeChat, message: optimisticMsg }));

    socket?.emit('sendMessage', {
      receiverId: activeChat,
      content: msgInput,
    });
    setMsgInput('');
    socket?.emit('typing', { receiverId: activeChat, isTyping: false });
  };

  const handleTyping = (e) => {
    setMsgInput(e.target.value);
    socket?.emit('typing', { receiverId: activeChat, isTyping: e.target.value.length > 0 });
  };

  const activePartner = conversations.find(c => c.partner._id === activeChat)?.partner;
  const filteredConvs = conversations.filter(c => c.partner.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-[calc(100vh-80px)] mt-20 px-4 max-w-7xl mx-auto flex gap-4 pb-4">
      {/* Sidebar */}
      <Card className="w-80 flex flex-col p-4 mr-2 hidden md:flex h-full" padding={false}>
        <div className="mb-4">
           <h2 className="text-xl font-bold mb-4">Messages</h2>
           <Input icon={Search} placeholder="Search chats..." value={search} onChange={e => setSearch(e.target.value)} className="bg-slate-900" />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin pr-2 -mr-2 space-y-2">
          {filteredConvs.map(({ partner, lastMessage, unreadCount }) => (
            <div 
              key={partner._id}
              onClick={() => dispatch(setActiveChat(partner._id))}
              className={`p-3 rounded-xl cursor-pointer transition-colors ${activeChat === partner._id ? 'bg-green-900/40 border border-green-500/30' : 'hover:bg-slate-700/50 border border-transparent'}`}
            >
              <div className="flex justify-between items-start mb-1">
                 <h4 className="font-medium text-slate-200 truncate pr-2">{partner.name}</h4>
                 {lastMessage && <span className="text-[10px] text-slate-500 whitespace-nowrap">{format(new Date(lastMessage.createdAt), 'HH:mm')}</span>}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400 truncate pr-4">
                   {typingUsers[partner._id] ? <span className="text-green-400 italic">typing...</span> : (lastMessage?.content || '')}
                </p>
                {unreadCount > 0 && <span className="bg-green-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col h-full" padding={false}>
        {activeChat ? (
           <>
             {/* Header */}
             <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur shrink-0 flex items-center justify-between">
                <div>
                   <h3 className="font-bold text-lg">{activePartner?.name}</h3>
                   <p className="text-xs text-green-400">{typingUsers[activeChat] ? 'Typing...' : 'Online'}</p>
                </div>
             </div>

             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin" ref={scrollRef}>
                {messages[activeChat]?.map((msg, idx) => {
                  const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
                  const isMe = String(senderId) === String(user._id);
                  return (
                    <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-green-600 text-white rounded-tr-sm' : 'bg-slate-700 text-slate-100 rounded-tl-sm'}`}>
                         <p className="text-sm leading-relaxed">{msg.content}</p>
                         <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-green-200' : 'text-slate-400'}`}>
                           {format(new Date(msg.createdAt), 'HH:mm')}
                           {isMe && <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>}
                         </p>
                      </div>
                    </div>
                  );
                })}
             </div>

             {/* Input */}
             <form onSubmit={handleSend} className="p-4 border-t border-slate-700 bg-slate-900 shrink-0 flex items-center gap-2">
                <button type="button" className="p-2 text-slate-400 hover:text-green-400 transition-colors"><ImageIcon size={20} /></button>
                <input 
                   type="text" 
                   value={msgInput} 
                   onChange={handleTyping}
                   placeholder="Type a message..." 
                   className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:border-green-500"
                />
                <button type="submit" disabled={!msgInput.trim()} className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-500 disabled:opacity-50 transition-colors">
                  <Send size={18} />
                </button>
             </form>
           </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4"><Send size={24} /></div>
             <p>Select a conversation to start chatting</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-green-500 rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>}>
      <ChatContent />
    </Suspense>
  );
}
