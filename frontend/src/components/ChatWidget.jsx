import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, ChevronDown, ArrowRight, CornerDownLeft, RefreshCw } from 'lucide-react';
import { sendChatMessage } from '../apiService';

export default function ChatWidget({ activeTab = 'overview', onSelectTab, onItemClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: '### 👋 Welcome to Supply Chain AI Copilot!\n\nI am connected to your **Databricks Gold Schema** ML data. Ask me about shipment delays, weather/traffic risks, warehouse stockouts, or supplier lead times.',
      actionChips: [
        { label: 'High Risk Shipments', action_type: 'NAVIGATE', target: 'delivery' },
        { label: 'Stockout Risks', action_type: 'NAVIGATE', target: 'inventory' },
        { label: 'Supplier Reliability', action_type: 'NAVIGATE', target: 'procurement' },
      ],
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(query, activeTab);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.reply || 'Analysis complete.',
        actionChips: res.action_chips || [],
        itemDetails: res.item_details || null,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: '⚠️ Network timeout reaching AI Assistant. Please ensure FastAPI backend is running.',
          actionChips: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (chip, itemDetails) => {
    if (chip.action_type === 'NAVIGATE' && chip.target) {
      if (onSelectTab) onSelectTab(chip.target);
    } else if (chip.action_type === 'INSPECT' && itemDetails && onItemClick) {
      onItemClick(itemDetails, 'AI Copilot Inspection');
    } else if (chip.action_type === 'FILTER') {
      if (onSelectTab) onSelectTab('delivery');
    }
  };

  const renderFormattedText = (txt) => {
    if (!txt) return null;
    const lines = txt.split('\n');
    return lines.map((line, idx) => {
      let l = line;
      if (l.startsWith('### ')) {
        return <h4 key={idx} className="chat-heading">{l.replace('### ', '')}</h4>;
      }
      if (l.startsWith('• ') || l.startsWith('- ')) {
        const content = l.substring(2);
        return (
          <div key={idx} className="chat-bullet">
            <span className="bullet-dot">•</span>
            <span>{parseMarkdownBold(content)}</span>
          </div>
        );
      }
      if (l.trim() === '') {
        return <div key={idx} style={{ height: '0.4rem' }} />;
      }
      return <p key={idx} className="chat-line">{parseMarkdownBold(l)}</p>;
    });
  };

  const parseMarkdownBold = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|\`.*?\`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="chat-code">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="chat-widget-container">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button className="chat-fab-button" onClick={() => setIsOpen(true)}>
          <div className="fab-icon-wrapper">
            <Bot size={22} />
            <span className="fab-pulse-dot" />
          </div>
          <span className="fab-text">AI Copilot</span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="chat-drawer-panel">
          {/* Header */}
          <div className="chat-drawer-header">
            <div className="header-title-group">
              <div className="chat-avatar">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="chat-header-title">Supply Chain Copilot</h3>
                <span className="chat-status-sub">
                  Connected to Databricks Gold ML ({activeTab.toUpperCase()})
                </span>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="chat-messages-area">
            {messages.map((m) => (
              <div key={m.id} className={`chat-message-row ${m.sender}`}>
                {m.sender === 'bot' && (
                  <div className="chat-msg-avatar">
                    <Bot size={16} />
                  </div>
                )}
                <div className={`chat-bubble ${m.sender}`}>
                  {renderFormattedText(m.text)}

                  {/* Action Chips */}
                  {m.actionChips && m.actionChips.length > 0 && (
                    <div className="chat-action-chips">
                      {m.actionChips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          className="chat-action-chip"
                          onClick={() => handleActionClick(chip, m.itemDetails)}
                        >
                          <span>{chip.label}</span>
                          <ArrowRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message-row bot">
                <div className="chat-msg-avatar">
                  <Bot size={16} />
                </div>
                <div className="chat-bubble bot typing">
                  <RefreshCw size={14} className="spinner" />
                  <span>Analyzing Databricks Gold schema features...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="chat-quick-prompts">
            <button onClick={() => handleSend('Which shipments are high risk?')}>
              🚀 High Risk Deliveries
            </button>
            <button onClick={() => handleSend('Show stockout forecasts')}>
              📦 Stockouts
            </button>
            <button onClick={() => handleSend('Supplier reliability overview')}>
              🏭 Suppliers
            </button>
          </div>

          {/* Input Footer */}
          <div className="chat-input-bar">
            <input
              type="text"
              placeholder="Ask about delays, weather risks, stockouts..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
