import React, { useState } from 'react';
import { useTelegramStore } from './services/telegramStore';
import { LeftSidebar } from './components/Sidebar/LeftSidebar';
import { ChatDrawer } from './components/Sidebar/ChatDrawer';
import { ChatHeader } from './components/Chat/ChatHeader';
import { PinnedBanner } from './components/Chat/PinnedBanner';
import { MessageList } from './components/Chat/MessageList';
import { MessageComposer } from './components/Chat/MessageComposer';
import { SettingsModal } from './components/Modals/SettingsModal';
import { ChatInfoDrawer } from './components/Modals/ChatInfoDrawer';
import { CallOverlay } from './components/Modals/CallOverlay';
import { StickerPickerModal } from './components/Modals/StickerPickerModal';
import { NewChatModal } from './components/Modals/NewChatModal';
import { AuthModal } from './components/Modals/AuthModal';
import { UserDirectoryModal } from './components/Modals/UserDirectoryModal';
import { WelcomeAuthScreen } from './components/Auth/WelcomeAuthScreen';
import { AdminManagementModal } from './components/Modals/AdminManagementModal';
import { Search, X } from 'lucide-react';

export default function App() {
  const {
    connectionState,
    currentUser,
    registeredUsers,
    chats,
    activeChat,
    activeChatId,
    activeMessages,
    activeFolder,
    searchQuery,
    theme,
    isAuthModalOpen,
    isUserDirectoryOpen,
    isDrawerOpen,
    isSettingsOpen,
    isChatInfoOpen,
    isStickerPickerOpen,
    isNewChatModalOpen,
    replyMessage,
    callState,
    setSearchQuery,
    setActiveFolder,
    setTheme,
    setIsAuthModalOpen,
    setIsUserDirectoryOpen,
    setIsDrawerOpen,
    setIsSettingsOpen,
    setIsChatInfoOpen,
    setIsStickerPickerOpen,
    setIsNewChatModalOpen,
    setReplyMessage,
    selectChat,
    login,
    register,
    googleLogin,
    deleteUser,
    addUser,
    broadcastMessage,
    logout,
    startDirectChat,
    createGroupChat,
    sendMessage,
    sendVoiceNote,
    sendSticker,
    toggleReaction,
    pinMessage,
    unpinMessage,
    deleteMessage,
    toggleMute,
    startCall,
    endCall,
    updateProfile,
  } = useTelegramStore();

  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [inChatSearchOpen, setInChatSearchOpen] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  if (!currentUser) {
    return (
      <WelcomeAuthScreen 
        onGoogleSuccess={googleLogin} 
        onQuickLogin={async (u) => login(u, undefined)} 
      />
    );
  }

  const handleSelectChatMobile = (chatId: string) => {
    selectChat(chatId);
    setIsMobileChatOpen(true);
    setInChatSearchOpen(false);
    setInChatSearchQuery('');
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'midnight' ? 'default' : theme === 'default' ? 'emerald' : theme === 'emerald' ? 'cyber' : theme === 'cyber' ? 'light' : 'midnight';
    setTheme(nextTheme);
  };

  return (
    <div className="flex h-mobile-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* 1. Left Sidebar: visible on desktop, or mobile when chat is closed */}
      <div className={`h-full ${isMobileChatOpen ? 'hidden md:flex' : 'flex w-full md:w-auto'}`}>
        <LeftSidebar
          connectionState={connectionState}
          chats={chats}
          activeChatId={activeChatId}
          activeFolder={activeFolder}
          searchQuery={searchQuery}
          messages={activeMessages.length ? { [activeChatId]: activeMessages } : {}}
          onSelectChat={handleSelectChatMobile}
          onSelectFolder={setActiveFolder}
          onSearchChange={setSearchQuery}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenNewChat={() => setIsNewChatModalOpen(true)}
        />
      </div>

      {/* 2. Main Chat View: visible on desktop or mobile when chat is open */}
      <div className={`flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden ${
        isMobileChatOpen ? 'flex w-full' : 'hidden md:flex'
      }`}>
        {activeChat ? (
          <>
            {/* Chat Top App Bar */}
            <ChatHeader
              chat={activeChat}
              onBackMobile={() => setIsMobileChatOpen(false)}
              onOpenInfo={() => setIsChatInfoOpen(true)}
              onStartCall={() => startCall(activeChat)}
              onToggleSearch={() => setInChatSearchOpen(!inChatSearchOpen)}
              onToggleMute={() => toggleMute(activeChat.id)}
            />

            {/* In-Chat Search Bar */}
            {inChatSearchOpen && (
              <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2 flex items-center gap-2 z-15 shadow-xs animate-in slide-in-from-top duration-150">
                <Search className="w-4 h-4 text-sky-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={inChatSearchQuery}
                  onChange={(e) => setInChatSearchQuery(e.target.value)}
                  placeholder={`Search in ${activeChat.title}...`}
                  className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
                />
                {inChatSearchQuery && (
                  <button
                    onClick={() => setInChatSearchQuery('')}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setInChatSearchOpen(false);
                    setInChatSearchQuery('');
                  }}
                  className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded-lg hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            )}

            {/* Pinned Message Banner */}
            <PinnedBanner
              pinnedMessage={activeChat.pinnedMessage}
              onUnpin={unpinMessage}
              onClick={() => {}}
            />

            {/* Message Stream */}
            <MessageList
              messages={activeMessages}
              isGroup={activeChat.type === 'group'}
              searchFilter={inChatSearchQuery}
              onReply={(msg) => setReplyMessage(msg)}
              onPin={(msg) => pinMessage(msg)}
              onDelete={(id) => deleteMessage(id)}
              onReaction={(id, emoji) => toggleReaction(id, emoji)}
            />

            {/* Message Composer */}
            <MessageComposer
              chatId={activeChat.id}
              isBot={activeChat.type === 'bot'}
              replyMessage={replyMessage}
              onCancelReply={() => setReplyMessage(null)}
              onSendMessage={sendMessage}
              onSendVoice={sendVoiceNote}
              onToggleStickerPicker={() => setIsStickerPickerOpen(!isStickerPickerOpen)}
            />

            {/* Sticker / Emoji Floating Picker */}
            <StickerPickerModal
              isOpen={isStickerPickerOpen}
              onClose={() => setIsStickerPickerOpen(false)}
              onSelectSticker={sendSticker}
              onSelectEmoji={(emoji) => sendMessage(emoji)}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm select-none">
            <p className="font-semibold text-slate-300">Select a chat to start messaging</p>
          </div>
        )}
      </div>

      {/* 3. Slide-out Left Navigation Drawer */}
      <ChatDrawer
        isOpen={isDrawerOpen}
        currentUser={currentUser}
        theme={theme}
        onClose={() => setIsDrawerOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUserDirectory={() => setIsUserDirectoryOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSelectSavedMessages={() => {
          selectChat('saved-messages');
          setIsMobileChatOpen(true);
        }}
        onSelectSupport={() => {
          startDirectChat('shervini');
          setIsMobileChatOpen(true);
        }}
        onToggleTheme={handleToggleTheme}
        onLogout={logout}
        onOpenAdminPanel={() => setIsAdminModalOpen(true)}
      />

      {/* 4. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        currentUser={currentUser}
        currentTheme={theme}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateProfile={updateProfile}
        onSetTheme={setTheme}
      />

      {/* 5. Chat Info Right Drawer */}
      {activeChat && (
        <ChatInfoDrawer
          isOpen={isChatInfoOpen}
          chat={activeChat}
          messages={activeMessages}
          onClose={() => setIsChatInfoOpen(false)}
          onToggleMute={() => toggleMute(activeChat.id)}
          onStartCall={() => startCall(activeChat)}
        />
      )}

      {/* 6. Active Call Overlay */}
      <CallOverlay
        callState={callState}
        onEndCall={endCall}
        onToggleMute={() => {}}
        onToggleVideo={() => {}}
        onToggleSpeaker={() => {}}
      />

      {/* 7. New Chat / Group / Channel Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        availableUsers={registeredUsers}
        currentUserId={currentUser.id}
        onClose={() => setIsNewChatModalOpen(false)}
        onCreateChat={(title, type, memberIds, bio) => {
          createGroupChat(title, type, memberIds, bio);
          setIsMobileChatOpen(true);
        }}
      />

      {/* 8. Active Users Directory Modal */}
      <UserDirectoryModal
        isOpen={isUserDirectoryOpen}
        users={registeredUsers}
        currentUserId={currentUser.id}
        onClose={() => setIsUserDirectoryOpen(false)}
        onStartDirectChat={(targetUsername) => {
          startDirectChat(targetUsername);
          setIsMobileChatOpen(true);
        }}
      />

      {/* 9. Auth & Switch Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        currentUser={currentUser}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={login}
      />

      {/* 10. Owner & Admin Management Panel */}
      <AdminManagementModal
        isOpen={isAdminModalOpen}
        currentUser={currentUser}
        users={registeredUsers}
        onClose={() => setIsAdminModalOpen(false)}
        onDeleteUser={deleteUser}
        onAddUser={addUser}
        onBroadcastMessage={broadcastMessage}
        onDirectChat={(targetUsername) => {
          startDirectChat(targetUsername);
          setIsMobileChatOpen(true);
        }}
      />
    </div>
  );
}
