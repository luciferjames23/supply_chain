import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, ChevronDown, ArrowRight, CornerDownLeft, RefreshCw, RotateCcw, Copy, Check } from 'lucide-react';
import { sendChatMessage } from '../apiService';

const INITIAL_WELCOME = [
  {
    id: 'welcome',
    sender: 'bot',
    text: '### 👋 Welcome to your Supply Chain AI Copilot!\n\nI am continuously monitoring your live supply chain operations. Ask me about shipment delivery tracking, weather and traffic delay risks, warehouse inventory stockouts, or supplier lead times.',
    actionChips: [
      { label: 'High Risk Shipments', action_type: 'NAVIGATE', target: 'delivery' },
      { label: 'Stockout Risks', action_type: 'NAVIGATE', target: 'inventory' },
      { label: 'Supplier Reliability', action_type: 'NAVIGATE', target: 'procurement' },
    ],
  },
];

export default function ChatWidget({ activeTab = 'overview', onSelectTab, onItemClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(INITIAL_WELCOME);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyAnswer = (msgId, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages(INITIAL_WELCOME);
    setInput('');
  };

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 50);
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
        source: res.source || 'Databricks Catalog RAG + Groq LLM',
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
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Detect Markdown Table Start (| Header 1 | Header 2 |)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        const dataLines = tableLines.filter((l) => !/^\|[\s\-:|]+\|$/.test(l));
        if (dataLines.length > 0) {
          const headerCells = dataLines[0]
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
          const bodyRows = dataLines.slice(1).map((rowLine) =>
            rowLine
              .split('|')
              .slice(1, -1)
              .map((c) => c.trim())
          );

          elements.push(
            <div key={`table-${i}`} className="chat-table-wrapper">
              <table className="chat-markdown-table">
                <thead>
                  <tr>
                    {headerCells.map((h, hIdx) => (
                      <th key={hIdx}>{parseMarkdownBold(h)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>{parseMarkdownBold(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={`h3-${i}`} className="chat-heading">
            {line.replace('### ', '')}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h3 key={`h2-${i}`} className="chat-sub-heading">
            {line.replace('## ', '')}
          </h3>
        );
      } else if (line.startsWith('• ') || line.startsWith('- ')) {
        const content = line.substring(2);
        elements.push(
          <div key={`bullet-${i}`} className="chat-bullet">
            <span className="bullet-dot">•</span>
            <span>{parseMarkdownBold(content)}</span>
          </div>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={`space-${i}`} style={{ height: '0.4rem' }} />);
      } else {
        elements.push(
          <p key={`p-${i}`} className="chat-line">
            {parseMarkdownBold(line)}
          </p>
        );
      }
      i++;
    }

    return elements;
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
                  Online • Live Supply Chain Intelligence
                </span>
              </div>
            </div>
            <div className="header-action-group">
              <button className="chat-clear-btn" onClick={handleClearChat} title="Clear Chat History">
                <RotateCcw size={15} />
              </button>
              <button className="chat-close-btn" onClick={() => setIsOpen(false)} title="Close Chat">
                <ChevronDown size={18} />
              </button>
            </div>
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

                  {/* ChatGPT-Style Copy Answer Button */}
                  {m.sender === 'bot' && (
                    <div className="chat-msg-footer">
                      <button
                        className={`chat-copy-btn ${copiedId === m.id ? 'copied' : ''}`}
                        onClick={() => handleCopyAnswer(m.id, m.text)}
                        title={copiedId === m.id ? 'Copied to clipboard!' : 'Copy answer'}
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check size={12} />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
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
              ref={inputRef}
              type="text"
              placeholder="Ask about delays, weather risks, stockouts..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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
