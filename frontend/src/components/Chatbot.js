import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../utils/axiosConfig';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Send, 
  Loader, 
  Sparkles, 
  Home, 
  History, 
  Settings, 
  Plus, 
  Copy, 
  RefreshCw,
  MoreVertical,
  X,
  Bot,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Palette,
  Zap,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Menu,
  Maximize2,
  Minimize2,
  Keyboard,
  HelpCircle,
  Bell,
  BellOff,
  TrendingUp,
  Star,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  Download,
  Upload,
  Trash2,
  Edit,
  Check,
  XCircle,
  AlertCircle,
  Info,
  Lightbulb,
  Target,
  Rocket,
  Globe,
  Lock,
  Unlock,
  Shield,
  Award,
  Gift,
  Crown,
  Flame,
  MapPin,
  Sparkle
} from 'lucide-react';
import PropertyCard from './PropertyCard';

// iPhone 17 Pro Style Advanced Glass Morphism Component
const GlassCard = ({ children, className = '', intensity = 'medium', hover = true, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 400, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 400, damping: 25 });
  const scale = useSpring(useTransform(y, [-0.5, 0.5], [1, 1.03]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e) => {
    if (!hover || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const relativeX = (e.clientX - centerX) / (rect.width / 2);
    const relativeY = (e.clientY - centerY) / (rect.height / 2);
    x.set(relativeX);
    y.set(relativeY);
    setMousePosition({ x: relativeX, y: relativeY });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const intensityClasses = {
    light: 'bg-gradient-to-br from-white/8 via-white/5 to-white/3 backdrop-blur-xl border border-white/20 shadow-xl',
    medium: 'bg-gradient-to-br from-white/12 via-white/8 to-white/5 backdrop-blur-2xl border border-white/30 shadow-2xl',
    strong: 'bg-gradient-to-br from-white/18 via-white/12 to-white/8 backdrop-blur-3xl border border-white/40 shadow-2xl',
  };

  // Calculate light reflection position (normalize to 0-100%)
  const lightX = mousePosition.x !== 0 ? ((mousePosition.x + 1) * 50) : 50;
  const lightY = mousePosition.y !== 0 ? ((mousePosition.y + 1) * 50) : 50;

  return (
    <motion.div
      ref={cardRef}
      className={`${intensityClasses[intensity]} ${className} rounded-3xl relative overflow-hidden transition-all duration-700`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={hover ? {
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      } : {}}
      whileHover={hover ? {
        boxShadow: '0 25px 80px rgba(139, 92, 246, 0.4), 0 0 40px rgba(167, 139, 250, 0.2)',
      } : {}}
      {...props}
    >
      {/* iPhone 17 Pro Style Light Reflection */}
      {hover && isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)`,
            mixBlendMode: 'overlay',
          }}
        />
      )}
      
      {/* Animated Border Glow */}
      {hover && isHovered && (
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: `linear-gradient(${45 + mousePosition.x * 20}deg, 
              rgba(139, 92, 246, 0.3) 0%, 
              rgba(167, 139, 250, 0.2) 50%, 
              rgba(139, 92, 246, 0.3) 100%)`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
        />
      )}

      {/* Content with 3D Transform */}
      <div 
        className="relative z-10"
        style={{ 
          transform: hover && isHovered ? 'translateZ(60px)' : 'translateZ(0)',
          transition: 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

// Typing Indicator with Advanced Animation
const AdvancedTypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-4 py-3"
    >
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400"
            animate={{
              y: [0, -12, 0],
              scale: [1, 1.2, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <motion.span
        className="text-sm text-white/60 ml-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        AI is thinking...
      </motion.span>
    </motion.div>
  );
};

// Message Reaction Component
// Enhanced Message Reactions with iPhone 17 Pro Style
const MessageReactions = ({ messageId, onReaction, currentReactions = [] }) => {
  const [selectedReactions, setSelectedReactions] = useState(new Set(currentReactions));
  const [hoveredReaction, setHoveredReaction] = useState(null);

  const reactions = [
    { icon: ThumbsUp, label: 'Like', color: 'text-blue-400', bgColor: 'bg-blue-500/20', emoji: '👍' },
    { icon: Heart, label: 'Love', color: 'text-red-400', bgColor: 'bg-red-500/20', emoji: '❤️' },
    { icon: Sparkle, label: 'Insightful', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', emoji: '✨' },
    { icon: Zap, label: 'Helpful', color: 'text-purple-400', bgColor: 'bg-purple-500/20', emoji: '⚡' },
    { icon: Star, label: 'Great', color: 'text-amber-400', bgColor: 'bg-amber-500/20', emoji: '⭐' },
    { icon: Flame, label: 'Hot', color: 'text-orange-400', bgColor: 'bg-orange-500/20', emoji: '🔥' },
  ];

  const handleReactionClick = (reaction) => {
    const newSelected = new Set(selectedReactions);
    if (newSelected.has(reaction.label)) {
      newSelected.delete(reaction.label);
    } else {
      newSelected.add(reaction.label);
    }
    setSelectedReactions(newSelected);
    onReaction(messageId, reaction.label);
  };

  const isSelected = (label) => selectedReactions.has(label);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center gap-2 mt-2 p-2 rounded-xl bg-white/5 backdrop-blur-sm"
    >
      {reactions.map((reaction, idx) => (
        <motion.button
          key={idx}
          onClick={() => handleReactionClick(reaction)}
          onMouseEnter={() => setHoveredReaction(idx)}
          onMouseLeave={() => setHoveredReaction(null)}
          className={`
            relative p-2 rounded-xl border transition-all duration-300
            ${isSelected(reaction.label) 
              ? `${reaction.bgColor} border-white/40 ${reaction.color} shadow-lg shadow-purple-500/30` 
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }
            ${reaction.color}
          `}
          whileHover={{ 
            scale: 1.15, 
            rotate: [0, -5, 5, -5, 0],
            y: -2,
          }}
          whileTap={{ scale: 0.85 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 17 
          }}
          aria-label={reaction.label}
        >
          {/* Ripple Effect */}
          {hoveredReaction === idx && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                background: `radial-gradient(circle, ${reaction.color} 0%, transparent 70%)`,
              }}
            />
          )}
          
          {/* Icon with Animation */}
          <motion.div
            animate={isSelected(reaction.label) ? {
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            } : {}}
            transition={{ duration: 0.4 }}
          >
            <reaction.icon size={16} />
          </motion.div>

          {/* Tooltip */}
          {hoveredReaction === idx && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-slate-800/95 backdrop-blur-xl text-white text-xs whitespace-nowrap border border-white/20 shadow-xl z-50"
            >
              {reaction.label}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800/95"></div>
            </motion.div>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
};

// Voice Input Component
const VoiceInput = ({ onTranscript, isListening, setIsListening }) => {
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        onTranscript(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onTranscript, setIsListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <motion.button
      onClick={toggleListening}
      className={`p-3 rounded-full ${
        isListening 
          ? 'bg-red-500/20 border-2 border-red-500 text-red-400' 
          : 'bg-white/10 border border-white/20 text-white/80 hover:text-white'
      } transition-all`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={isListening ? {
        scale: [1, 1.1, 1],
        boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.4)', '0 0 0 10px rgba(239, 68, 68, 0)', '0 0 0 0 rgba(239, 68, 68, 0)'],
      } : {}}
      transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </motion.button>
  );
};

// Enhanced Quick Action Buttons with iPhone 17 Pro Style
const QuickActions = ({ onAction }) => {
  const [hoveredAction, setHoveredAction] = useState(null);
  
  const actions = [
    { icon: Home, label: 'Find Home', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/20', action: 'find-home' },
    { icon: TrendingUp, label: 'Price Trends', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/20', action: 'price-trends' },
    { icon: MapPin, label: 'Location', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500/20', action: 'location' },
    { icon: Target, label: 'Budget', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-500/20', action: 'budget' },
    { icon: Sparkle, label: 'AI Suggestions', color: 'from-indigo-500 to-purple-500', bgColor: 'bg-indigo-500/20', action: 'ai-suggestions' },
    { icon: Rocket, label: 'Quick Search', color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-500/20', action: 'quick-search' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {actions.map((action, idx) => (
        <motion.button
          key={idx}
          onClick={() => onAction(action.action)}
          onMouseEnter={() => setHoveredAction(idx)}
          onMouseLeave={() => setHoveredAction(null)}
          className={`
            relative p-4 rounded-2xl overflow-hidden
            bg-gradient-to-br ${action.color} 
            backdrop-blur-xl border border-white/20
            text-white font-medium text-sm 
            shadow-lg hover:shadow-2xl transition-all
          `}
          whileHover={{ 
            scale: 1.08, 
            y: -4,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0, y: 20, rotateX: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ 
            delay: idx * 0.1,
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
          aria-label={action.label}
        >
          {/* Animated Background Glow */}
          {hoveredAction === idx && (
            <motion.div
              className={`absolute inset-0 ${action.bgColor} opacity-50`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
            />
          )}
          
          {/* Shine Effect */}
          {hoveredAction === idx && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          )}

          {/* Icon with Animation */}
          <motion.div
            animate={hoveredAction === idx ? {
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1],
            } : {}}
            transition={{ duration: 0.5 }}
            className="mb-1 flex justify-center"
          >
            <action.icon size={20} />
          </motion.div>
          
          <span className="block">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};


const Chatbot = ({ onPropertiesFound, onPropertySave, onAddToComparison, sidebarOpen, setSidebarOpen }) => {
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      type: 'bot',
      text: "Hi! I'm your real estate assistant. I can help you find properties based on your preferences. Try asking me things like:\n• 'Show me 3 bedroom apartments in New York under $500,000'\n• 'I need a house with a pool in Miami'\n• 'Find properties with 2+ bathrooms in Los Angeles'",
      timestamp: new Date(),
      reactions: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeMessageMenu, setActiveMessageMenu] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [savedMessages, setSavedMessages] = useState([]);
  const [messageReactions, setMessageReactions] = useState({});
  const [showResultsPanel, setShowResultsPanel] = useState(true);
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const [resultsPanelHeight, setResultsPanelHeight] = useState(320);
  const [isResizingResults, setIsResizingResults] = useState(false);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(320);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const messageIdCounter = useRef(1);

  // Auto-scroll with smooth easing
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, searchResults, scrollToBottom]);

  // Drag-to-resize for results panel
  useEffect(() => {
    if (!isResizingResults) return;

    const handleMove = (e) => {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const delta = clientY - resizeStartY.current;
      const minHeight = 220;
      const maxHeight = Math.max(minHeight, window.innerHeight * 0.7);
      const next = Math.min(Math.max(resizeStartHeight.current - delta, minHeight), maxHeight);
      setResultsPanelHeight(next);
      setResultsExpanded(next > window.innerHeight * 0.45);
    };

    const handleUp = () => setIsResizingResults(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isResizingResults]);

  // Voice transcript effect
  useEffect(() => {
    if (voiceTranscript) {
      setInput(voiceTranscript);
    }
  }, [voiceTranscript]);

  // Command palette (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setActiveMessageMenu(null);
      }
      // Focus input with /
      if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const userMsg = { 
      id: messageIdCounter.current++,
      type: 'user', 
      text: userMessage,
      timestamp: new Date(),
      reactions: [],
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Get recent conversation history for context
      const recentMessages = messages.slice(-10).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await apiClient.post('/api/properties/search', {
        message: userMessage,
        predict: true,
        conversationHistory: recentMessages,
      });

      const { data, count, filters, isConversation, message: chatMessage } = response.data;
      const hasResults = Array.isArray(data) && data.length > 0;

      // Always show results when they exist, even if a conversational message is returned
      if (hasResults) {
        setSearchResults(data);
        onPropertiesFound(data);
        setShowResultsPanel(true);
        setResultsExpanded(false);
        setResultsPanelHeight(320);

        const botMessage = chatMessage
          ? chatMessage
          : `I found ${count} propert${count === 1 ? 'y' : 'ies'} matching your criteria! Here are the results:`;

        setMessages((prev) => [
          ...prev,
          {
            id: messageIdCounter.current++,
            type: 'bot',
            text: botMessage,
            filters: filters,
            timestamp: new Date(),
            reactions: [],
            isRecommendation: response.data.isRecommendation || false,
          },
        ]);

        if (notifications && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Properties Found!', {
            body: `Found ${count} properties matching your search`,
            icon: '/favicon.ico',
          });
        }
        return;
      }

      // Handle conversational-only responses or empty results
      setSearchResults([]);
      setShowResultsPanel(false);
      if (isConversation && chatMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: messageIdCounter.current++,
            type: 'bot',
            text: chatMessage,
            timestamp: new Date(),
            reactions: [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: messageIdCounter.current++,
            type: 'bot',
            text: "I couldn't find any properties matching your criteria. Try adjusting your search parameters, such as:\n• Location (e.g., New York, Miami, Los Angeles)\n• Budget (e.g., under $500,000)\n• Number of bedrooms or bathrooms\n• Amenities (e.g., pool, gym, parking)",
            timestamp: new Date(),
            reactions: [],
          },
        ]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: messageIdCounter.current++,
          type: 'bot',
          text: "Sorry, I encountered an error while searching. Please try again or rephrase your request.",
          timestamp: new Date(),
          reactions: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFilter = async (filterType, value) => {
    const filterMessages = {
      location: `Show me properties in ${value}`,
      budget: `Show me properties under $${value}`,
      bedrooms: `Show me ${value} bedroom properties`,
    };

    setInput(filterMessages[filterType]);
    setTimeout(() => {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      inputRef.current?.form?.dispatchEvent(event);
    }, 100);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: messageIdCounter.current++,
        type: 'bot',
        text: "Hi! I'm your real estate assistant. I can help you find properties based on your preferences. Try asking me things like:\n• 'Show me 3 bedroom apartments in New York under $500,000'\n• 'I need a house with a pool in Miami'\n• 'Find properties with 2+ bathrooms in Los Angeles'",
        timestamp: new Date(),
        reactions: [],
      },
    ]);
    setSearchResults([]);
    setInput('');
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setActiveMessageMenu(null);
    // Show toast notification
    if (notifications) {
      // Could add toast component here
    }
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.type === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.text);
      setTimeout(() => {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        inputRef.current?.form?.dispatchEvent(event);
      }, 100);
    }
    setActiveMessageMenu(null);
  };

  const handleSaveMessage = (messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (message && !savedMessages.includes(messageId)) {
      setSavedMessages([...savedMessages, messageId]);
    }
    setActiveMessageMenu(null);
  };

  const handleReaction = (messageId, reaction) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), reaction],
    }));
  };

  const handleQuickAction = (action) => {
    const actionMessages = {
      'find-home': 'Show me available homes',
      'price-trends': 'What are the current price trends?',
      'location': 'What are the best locations?',
      'budget': 'Help me with budget planning',
      'ai-suggestions': 'Give me AI-powered property suggestions',
      'quick-search': 'Show me popular properties',
    };
    setInput(actionMessages[action] || '');
    inputRef.current?.focus();
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Group messages by time
  const groupMessages = (messages) => {
    const grouped = [];
    let currentGroup = null;

    messages.forEach((msg, idx) => {
      if (!currentGroup) {
        currentGroup = { messages: [msg], startIdx: idx };
      } else {
        const timeDiff = msg.timestamp - currentGroup.messages[0].timestamp;
        if (timeDiff < 120000 && msg.type === currentGroup.messages[0].type) {
          currentGroup.messages.push(msg);
        } else {
          grouped.push(currentGroup);
          currentGroup = { messages: [msg], startIdx: idx };
        }
      }
    });

    if (currentGroup) {
      grouped.push(currentGroup);
    }

    return grouped;
  };

  const messageGroups = groupMessages(messages);

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden min-h-0">
      {/* Main Chat Area - Full Width */}
      <div className="flex-1 flex flex-col min-w-0 h-full min-h-0">
        {/* Chat Header */}
        <GlassCard intensity="medium" hover={false} className="m-4 mb-0 p-4 mx-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Bot size={24} className="text-purple-400" />
                </motion.div>
                <h2 className="text-xl font-bold text-white">Real Estate Assistant</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setNotifications(!notifications)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={notifications ? 'Disable notifications' : 'Enable notifications'}
              >
                {notifications ? <Bell size={20} /> : <BellOff size={20} />}
              </motion.button>
              <motion.button
                onClick={() => setShowCommandPalette(true)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium border border-white/10 hover:border-purple-500/50 flex items-center gap-2 transition-all group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open command palette"
              >
                <Keyboard size={14} />
                <span>Ctrl+K</span>
              </motion.button>
            </div>
          </div>
        </GlassCard>

        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent min-h-0"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          <AnimatePresence mode="popLayout">
            {messageGroups.map((group, groupIdx) => (
              <motion.div
                key={groupIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex ${group.messages[0].type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start gap-3 max-w-[75%] md:max-w-[65%]">
                  {/* Avatar */}
                  {group.messages[0].type === 'bot' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-purple-400/50"
                    >
                      <Bot size={18} className="text-white" />
                    </motion.div>
                  )}

                  {/* Messages */}
                  <div className="flex flex-col gap-2">
                    {group.messages.map((msg, msgIdx) => (
                      <GlassCard
                        key={msg.id}
                        intensity="medium"
                        hover={true}
                        className={`relative group ${
                          msg.type === 'user' 
                            ? 'ml-auto bg-gradient-to-r from-purple-600/80 to-indigo-600/80' 
                            : 'bg-slate-700/80'
                        }`}
                      >
                        <div className="px-4 py-3">
                          <p className="text-sm md:text-base whitespace-pre-line leading-relaxed text-white">
                            {msg.text}
                          </p>
                          
                          {/* Timestamp */}
                          <p className={`text-xs mt-2 ${msg.type === 'user' ? 'text-white/70' : 'text-white/50'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>

                          {/* Filters Applied */}
                          {msg.filters && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-3 pt-3 border-t border-white/10"
                            >
                              <strong className="text-xs font-semibold uppercase tracking-wide text-white/60">Filters applied:</strong>
                              <ul className="mt-2 space-y-1 text-xs">
                                {msg.filters.location && (
                                  <li className="flex items-center gap-2 text-white/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                    Location: {msg.filters.location}
                                  </li>
                                )}
                                {msg.filters.maxBudget && (
                                  <li className="flex items-center gap-2 text-white/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                    Max Budget: ${msg.filters.maxBudget.toLocaleString()}
                                  </li>
                                )}
                                {msg.filters.bedrooms && (
                                  <li className="flex items-center gap-2 text-white/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                    Bedrooms: {msg.filters.bedrooms}+
                                  </li>
                                )}
                                {msg.filters.bathrooms && (
                                  <li className="flex items-center gap-2 text-white/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                    Bathrooms: {msg.filters.bathrooms}+
                                  </li>
                                )}
                              </ul>
                            </motion.div>
                          )}

                          {/* Message Reactions */}
                          {messageReactions[msg.id] && messageReactions[msg.id].length > 0 && (
                            <div className="mt-2 flex items-center gap-1 flex-wrap">
                              {messageReactions[msg.id].map((reaction, idx) => (
                                <span key={idx} className="px-2 py-1 rounded-full bg-white/10 text-xs text-white/80">
                                  {reaction}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Message Actions */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className={`absolute ${msg.type === 'user' ? 'left-0 -translate-x-full mr-2' : 'right-0 translate-x-full ml-2'} top-0 flex items-center gap-1 transition-opacity`}
                        >
                          <motion.button
                            onClick={() => setActiveMessageMenu(activeMessageMenu === `${groupIdx}-${msgIdx}` ? null : `${groupIdx}-${msgIdx}`)}
                            className="p-1.5 rounded-lg bg-slate-700/90 backdrop-blur-sm text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Message options"
                          >
                            <MoreVertical size={14} />
                          </motion.button>
                        </motion.div>

                        {/* Message Menu Dropdown */}
                        {activeMessageMenu === `${groupIdx}-${msgIdx}` && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`absolute ${msg.type === 'user' ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-0 mt-8 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl p-1 min-w-[160px] z-50`}
                          >
                            <button
                              onClick={() => handleCopyMessage(msg.text)}
                              className="w-full px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-2 text-sm transition-colors"
                              aria-label="Copy message"
                            >
                              <Copy size={14} />
                              <span>Copy</span>
                            </button>
                            {msg.type === 'bot' && (
                              <>
                                <button
                                  onClick={handleRegenerate}
                                  className="w-full px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-2 text-sm transition-colors"
                                  aria-label="Regenerate response"
                                >
                                  <RefreshCw size={14} />
                                  <span>Regenerate</span>
                                </button>
                                <button
                                  onClick={() => handleSaveMessage(msg.id)}
                                  className="w-full px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-2 text-sm transition-colors"
                                  aria-label="Save message"
                                >
                                  <Bookmark size={14} />
                                  <span>Save</span>
                                </button>
                              </>
                            )}
                            <div className="border-t border-white/10 my-1"></div>
                            <MessageReactions 
                              messageId={msg.id} 
                              onReaction={handleReaction}
                              currentReactions={messageReactions[msg.id] || []}
                            />
                          </motion.div>
                        )}
                      </GlassCard>
                    ))}
                  </div>

                  {/* User Avatar */}
                  {group.messages[0].type === 'user' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-indigo-400/50"
                    >
                      <User size={18} className="text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start items-start gap-3"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-purple-400/50">
                <Bot size={18} className="text-white" />
              </div>
              <GlassCard intensity="medium" className="px-4 py-3">
                <AdvancedTypingIndicator />
              </GlassCard>
            </motion.div>
          )}

          {/* Empty State */}
          {messages.length === 1 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center px-4"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="mb-6"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl ring-4 ring-purple-400/30">
                  <Sparkles size={48} className="text-white" />
                </div>
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-2">Start a conversation</h3>
              <p className="text-white/60 max-w-md mb-6">
                Ask me about properties, locations, budgets, or any real estate questions you have.
              </p>
              <QuickActions onAction={handleQuickAction} />
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && showResultsPanel && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
              className="px-6 py-4 backdrop-blur-xl bg-slate-800/50 border-t border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              style={{
                height: `${resultsPanelHeight}px`,
              }}
            >
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3 text-white/70 text-xs">
                  <div
                    className="h-1.5 w-16 rounded-full bg-white/25 cursor-row-resize"
                    role="slider"
                    aria-valuemin={220}
                    aria-valuemax={Math.max(220, Math.floor(window.innerHeight * 0.7))}
                    aria-valuenow={Math.floor(resultsPanelHeight)}
                    aria-label="Resize search results"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      resizeStartY.current = e.clientY;
                      resizeStartHeight.current = resultsPanelHeight;
                      setIsResizingResults(true);
                    }}
                    onTouchStart={(e) => {
                      const touch = e.touches?.[0];
                      if (!touch) return;
                      resizeStartY.current = touch.clientY;
                      resizeStartHeight.current = resultsPanelHeight;
                      setIsResizingResults(true);
                    }}
                  />
                  <span className="hidden sm:inline">Drag to resize</span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => {
                      const expandedHeight = Math.min(window.innerHeight * 0.6, window.innerHeight * 0.7);
                      setResultsPanelHeight(expandedHeight);
                      setResultsExpanded(true);
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Expand results"
                  >
                    <Maximize2 size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setResultsPanelHeight(280);
                      setResultsExpanded(false);
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Collapse results"
                  >
                    <Minimize2 size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setSearchResults([]);
                      setShowResultsPanel(false);
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Close search results"
                  >
                    <X size={16} />
                  </motion.button>
                </div>
              </div>
              <div className="overflow-auto h-full scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg font-bold text-white mb-3 flex items-center gap-2"
                >
                  <Sparkles size={20} className="text-yellow-300" />
                  Search Results ({searchResults.length})
                </motion.h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
                  {searchResults.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PropertyCard
                        property={property}
                        onSave={onPropertySave}
                        onAddToComparison={onAddToComparison}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area - Sticky Bottom */}
        <GlassCard intensity="strong" hover={false} className="m-4 mt-0 p-4 mx-4">
          {/* Quick Filters */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex flex-wrap items-center gap-2"
            >
              <span className="text-white/60 text-xs font-medium">Quick filters:</span>
              {[
                { type: 'location', value: 'New York', label: 'New York' },
                { type: 'budget', value: '500000', label: 'Under $500k' },
                { type: 'bedrooms', value: '3', label: '3+ Bedrooms' },
              ].map((filter) => (
                <motion.button
                  key={filter.type}
                  type="button"
                  onClick={() => handleQuickFilter(filter.type, filter.value)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium border border-white/10 hover:border-purple-400/40 transition-all backdrop-blur-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={filter.label}
                >
                  {filter.label}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSend} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here... (Press / to focus)"
                className="w-full px-5 py-4 text-base rounded-2xl bg-slate-700/50 backdrop-blur-xl text-white placeholder-white/40 border-2 border-white/10 focus:border-purple-500/60 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 shadow-lg"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                aria-label="Message input"
                aria-describedby="input-help"
              />
              <span id="input-help" className="sr-only">Press Enter to send, Shift+Enter for new line</span>
            </div>
            <VoiceInput
              onTranscript={setVoiceTranscript}
              isListening={isListening}
              setIsListening={setIsListening}
            />
            <motion.button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="relative px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-semibold shadow-xl shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px] overflow-hidden group"
              whileHover={isLoading || !input.trim() ? {} : { 
                scale: 1.08, 
                boxShadow: '0 25px 50px rgba(139, 92, 246, 0.5)',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 1) 0%, rgba(99, 102, 241, 1) 50%, rgba(139, 92, 246, 1) 100%)',
              }}
              whileTap={{ scale: 0.92 }}
              animate={!isLoading && input.trim() ? {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              } : {}}
              transition={{ 
                backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" },
                type: "spring",
                stiffness: 400,
                damping: 17
              }}
              style={{ backgroundSize: '200% 200%' }}
              aria-label="Send message"
            >
              {/* Animated Shine Effect */}
              {!isLoading && input.trim() && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeInOut"
                  }}
                />
              )}
              
              {/* Sparkle Particles on Hover */}
              {!isLoading && input.trim() && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      initial={{
                        x: '50%',
                        y: '50%',
                        scale: 0,
                      }}
                      animate={{
                        x: `${50 + (Math.random() - 0.5) * 100}%`,
                        y: `${50 + (Math.random() - 0.5) * 100}%`,
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </motion.div>
              )}

              <motion.div
                animate={!isLoading && input.trim() ? {
                  rotate: [0, 5, -5, 0],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isLoading ? (
                  <Loader className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
              </motion.div>
            </motion.button>
          </form>
        </GlassCard>
      </div>

      {/* Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowCommandPalette(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-slate-800/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl z-50 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Command Palette</h3>
                <button
                  onClick={() => setShowCommandPalette(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  aria-label="Close command palette"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={handleNewChat}
                  className="w-full px-4 py-3 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-3 text-left transition-colors"
                  aria-label="New chat"
                >
                  <Plus size={18} />
                  <span>New Chat</span>
                </button>
                <button 
                  className="w-full px-4 py-3 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-3 text-left transition-colors"
                  aria-label="Chat history"
                >
                  <History size={18} />
                  <span>Chat History</span>
                </button>
                <button 
                  className="w-full px-4 py-3 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-3 text-left transition-colors"
                  aria-label="Help"
                >
                  <HelpCircle size={18} />
                  <span>Help & Support</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Chatbot;
