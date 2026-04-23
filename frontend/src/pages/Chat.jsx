import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import InfoTooltip from '../components/InfoTooltip';
import ReactMarkdown from 'react-markdown';
import {
  Send, Sparkles, Key, Eye, EyeOff, Shield,
  TrendingDown, Scale, Target, AlertTriangle, Gauge, ShieldCheck,
  Play, RotateCcw, FileText,
} from 'lucide-react';
import { DEMO_CONVERSATIONS } from '../data/demoConversations';

// Map icon names used in demoConversations.js to lucide-react components.
// Keeping the data file free of JSX keeps it serialisation-friendly.
const ICONS = { TrendingDown, Scale, Target, AlertTriangle, Gauge, ShieldCheck };

// Generic, data-agnostic prompts — they work regardless of which dataset is loaded
// (demo, customer upload, or partial). The AI will ground each one in whatever
// context the backend sends at query time.
const SUGGESTED = [
  "What's our overall realisation rate, and which practice area is weakest?",
  "Which clients have the biggest wallet gaps?",
  "Compare fixed-fee vs hourly profitability",
  "Show me the matters most over budget",
  "Which partner has the highest write-offs and how do they compare?",
  "What are the biggest cross-sell opportunities right now?",
  "Where is revenue leaking — billing stage or collection stage?",
  "Give me an executive summary of the firm this period",
];

function detectProvider(key) {
  if (!key) return null;
  if (key.startsWith('sk-ant-')) return 'anthropic';
  if (key.startsWith('sk-')) return 'openai';
  return 'openai';
}

function providerLabel(p) {
  if (p === 'anthropic') return 'Anthropic (Claude)';
  if (p === 'openai') return 'OpenAI (GPT)';
  return 'Unknown';
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState(null);
  const [keyConfirmed, setKeyConfirmed] = useState(false);
  const [keyError, setKeyError] = useState('');
  // Demo mode — set when the user loads one of the pre-recorded demo conversations.
  // When active, a banner appears at the top of the chat and demo AI responses get a
  // "DEMO" badge. If the user has an API key connected, they can still send follow-ups
  // and the backend receives the demo Q&A as conversation history.
  const [demoActive, setDemoActive] = useState(false);
  const [demoId, setDemoId] = useState(null);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const detected = detectProvider(apiKey);
    setProvider(detected);
  }, [apiKey]);

  // Format check before sending a key to the backend. Not a full validation —
  // the real check is the first actual API call — but it catches the obvious
  // paste-the-wrong-thing mistakes.
  function confirmKey() {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    // Anthropic keys start with sk-ant-, OpenAI keys start with sk-
    if (!/^sk-(ant-)?[A-Za-z0-9_-]{20,}$/i.test(trimmed)) {
      setKeyError("That doesn't look like an Anthropic or OpenAI key. Anthropic keys start with sk-ant-, OpenAI keys start with sk-.");
      return;
    }
    setKeyError('');
    setKeyConfirmed(true);
  }

  function clearKey() {
    setApiKey('');
    setKeyConfirmed(false);
    setProvider(null);
    setKeyError('');
    setMessages([]);
    setDemoActive(false);
    setDemoId(null);
  }

  // Replay a pre-recorded demo conversation into the chat window. The Q&A
  // appears instantly — no API call, no streaming — and the response is
  // flagged with isDemo so we can show a "DEMO" badge on the bubble.
  function loadDemo(demo) {
    setMessages([
      { role: 'user', content: demo.question },
      { role: 'assistant', content: demo.response, isDemo: true },
    ]);
    setDemoActive(true);
    setDemoId(demo.id);
  }

  // Wipe messages and demo state — returns to the empty-state gallery.
  function resetChat() {
    setMessages([]);
    setDemoActive(false);
    setDemoId(null);
    setInput('');
  }

  async function send(text) {
    const userMsg = text || input;
    if (!userMsg.trim()) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const resp = await api.post('/chat', {
        message: userMsg,
        history: newMessages.slice(-10),
        apiKey: apiKey,
        provider: provider,
      });
      setMessages([...newMessages, { role: 'assistant', content: resp.data.response }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error processing your request. Please check your API key and try again.' }]);
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>AI Chat</h2>
          <p style={{display:'flex',alignItems:'center',gap:8}}>
            Ask questions about profitability, client wallets, budgets, or competitive intelligence.
            <InfoTooltip
              title="How the AI Chat Works"
              sections={[
                { label: 'Grounding', body: 'Every question triggers a fresh SQL snapshot of your firm data — overview, realisation by practice, wallet gaps, budget overruns, write-off leaders, fee-arrangement performance, cross-sell opportunities, and market signals. The AI only answers from this live context.' },
                { label: 'Answer structure', body: 'Every response follows Insight → Evidence (specific £ and %) → Recommendation. Top-N lists are labelled so the AI tells you when the full dataset is larger than what it can see.' },
                { label: 'What it will NOT do', body: 'It will not invent clients, partners, or numbers. If data isn\'t in the snapshot (for example, a specific timekeeper not in the top 10 write-off list), it will say so and point you to the page that shows the full data.' },
                { label: 'Providers', body: 'Bring-your-own API key for either Anthropic (Claude) or OpenAI (GPT). Key stays in your browser session and is sent directly to the provider — never stored server-side.' },
              ]}
            />
          </p>
        </div>
      </div>

      {/* API Key Configuration Bar */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '16px 20px',
        marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
        flexWrap: 'wrap',
      }}>
        <Key size={16} style={{color: keyConfirmed ? 'var(--accent-green)' : 'var(--text-muted)'}} />

        {!keyConfirmed ? (
          <>
            <div style={{flex:1,minWidth:250}}>
              <div style={{position:'relative'}}>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); if (keyError) setKeyError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') confirmKey(); }}
                  placeholder="Paste your Anthropic or OpenAI API key..."
                  style={{
                    width:'100%', padding:'8px 36px 8px 12px',
                    background:'var(--bg-secondary)', border:`1px solid ${keyError ? 'var(--accent-red)' : 'var(--border)'}`,
                    borderRadius:'var(--radius-sm)', color:'var(--text-primary)',
                    fontSize:'0.88rem', outline:'none', boxSizing:'border-box',
                  }}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {provider && (
              <span className={`badge ${provider === 'anthropic' ? 'badge-blue' : 'badge-green'}`}>
                {providerLabel(provider)}
              </span>
            )}
            <button className="btn btn-primary btn-sm" onClick={confirmKey} disabled={!apiKey.trim()}>
              Connect
            </button>
            <InfoTooltip text="Your API key is sent directly to the LLM provider with each request. It is never stored on any server — it lives only in your browser session. Supports Anthropic (sk-ant-...) and OpenAI (sk-...) keys." />
          </>
        ) : (
          <>
            <span style={{fontSize:'0.85rem',color:'var(--text-secondary)'}}>
              Connected to <strong style={{color:'var(--text-primary)'}}>{providerLabel(provider)}</strong>
            </span>
            <span className="badge badge-green">Active</span>
            <div style={{display:'flex',alignItems:'center',gap:4,color:'var(--text-muted)',fontSize:'0.75rem'}}>
              <Shield size={12} />
              Key stored in browser session only
            </div>
            <button className="btn btn-secondary btn-sm" onClick={clearKey} style={{marginLeft:'auto'}}>
              Disconnect
            </button>
          </>
        )}
      </div>
      {keyError && (
        <div style={{marginTop:-8,marginBottom:16,padding:'8px 14px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'var(--radius-sm)',color:'var(--accent-red)',fontSize:'0.82rem'}}>
          {keyError}
        </div>
      )}

      {/* Chat Container */}
      <div className="chat-container">
        {/* Demo-mode banner — always visible while a pre-recorded conversation is loaded */}
        {demoActive && (
          <div style={{
            display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',
            padding:'10px 16px',marginBottom:12,
            background:'linear-gradient(90deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))',
            border:'1px solid rgba(139,92,246,0.25)',
            borderRadius:'var(--radius-sm)',
            fontSize:'0.82rem',color:'var(--text-secondary)',
          }}>
            <Play size={14} style={{color:'var(--accent-purple)'}} />
            <span>
              <strong style={{color:'var(--text-primary)'}}>Demo conversation</strong> — pre-recorded from Whitfield &amp; Partners data.
              {keyConfirmed ? ' Send a message below to continue from here with live responses.' : ' Connect your API key above to ask your own follow-ups.'}
            </span>
            <button
              onClick={resetChat}
              style={{marginLeft:'auto',background:'transparent',border:'1px solid rgba(139,92,246,0.4)',color:'var(--accent-purple)',padding:'4px 10px',borderRadius:'var(--radius-sm)',fontSize:'0.75rem',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:5,fontFamily:'inherit',fontWeight:500}}
            >
              <RotateCcw size={11} /> Clear
            </button>
          </div>
        )}

        <div className="chat-messages">
          {messages.length === 0 && (
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:24,padding:'12px 0 24px'}}>
              <div style={{width:64,height:64,borderRadius:16,background:'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(139,92,246,0.15))',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Sparkles size={28} style={{color:'var(--accent-blue)'}} />
              </div>
              <div style={{textAlign:'center',maxWidth:500}}>
                <h3 style={{fontSize:'1.1rem',color:'var(--text-primary)',marginBottom:8}}>LegalPulse AI Assistant</h3>
                <p style={{color:'var(--text-muted)',fontSize:'0.88rem',lineHeight:1.6,marginBottom:12}}>
                  I have live access to the firm dataset — time entries, billing, budgets, client wallets, fee arrangement performance, cross-sell opportunities, and market signals. Ask me anything grounded in the data.
                </p>
                {!keyConfirmed && (
                  <div style={{
                    background:'var(--accent-amber-dim)',border:'1px solid rgba(245,158,11,0.3)',
                    borderRadius:'var(--radius-sm)',padding:'10px 16px',
                    fontSize:'0.82rem',color:'var(--accent-amber)',display:'inline-flex',alignItems:'center',gap:8,
                  }}>
                    <Key size={14} />
                    Enter your API key above to start chatting — or explore the demo conversations below
                  </div>
                )}
              </div>

              {keyConfirmed && (
                <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',maxWidth:600}}>
                  {SUGGESTED.map((q, i) => (
                    <button key={i} onClick={() => send(q)}
                      style={{
                        padding:'8px 14px',borderRadius:50,
                        background:'var(--bg-elevated)',border:'1px solid var(--border)',
                        color:'var(--text-secondary)',fontSize:'0.8rem',cursor:'pointer',
                        transition:'all 0.15s',
                      }}
                      onMouseEnter={e => { e.target.style.borderColor='var(--accent-blue)'; e.target.style.color='var(--accent-blue)'; }}
                      onMouseLeave={e => { e.target.style.borderColor='var(--border)'; e.target.style.color='var(--text-secondary)'; }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Demo gallery — always visible in empty state, key or no key */}
              <div style={{width:'100%',maxWidth:820,marginTop:8}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,padding:'0 4px'}}>
                  <FileText size={14} style={{color:'var(--accent-purple)'}} />
                  <div style={{fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.08em',color:'var(--text-muted)',textTransform:'uppercase'}}>
                    Example Conversations — click to replay
                  </div>
                  <div style={{flex:1,height:1,background:'var(--border)'}}></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',gap:12}}>
                  {DEMO_CONVERSATIONS.map(demo => {
                    const Icon = ICONS[demo.icon] || Sparkles;
                    return (
                      <button
                        key={demo.id}
                        onClick={() => loadDemo(demo)}
                        style={{
                          textAlign:'left',
                          background:'var(--bg-card)',border:'1px solid var(--border)',
                          borderRadius:'var(--radius-md)',padding:'14px 16px',
                          cursor:'pointer',transition:'all 0.15s',
                          display:'flex',flexDirection:'column',gap:8,
                          fontFamily:'inherit',color:'var(--text-primary)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent-blue)'; e.currentTarget.style.transform='translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}
                      >
                        <div style={{display:'flex',alignItems:'center',gap:10,justifyContent:'space-between'}}>
                          <div className={`feature-icon ${demo.color}`} style={{width:32,height:32,margin:0}}>
                            <Icon size={16} />
                          </div>
                          <span style={{fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.06em',color:'var(--text-muted)',textTransform:'uppercase'}}>
                            {demo.category}
                          </span>
                        </div>
                        <div style={{fontSize:'0.9rem',fontWeight:600,color:'var(--text-primary)',lineHeight:1.35}}>
                          {demo.title}
                        </div>
                        <div style={{fontSize:'0.75rem',color:'var(--text-muted)',lineHeight:1.5}}>
                          {demo.capability}
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:5,marginTop:2,fontSize:'0.72rem',color:'var(--accent-blue)',fontWeight:500}}>
                          <Play size={10} /> Replay demo
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`} style={msg.isDemo ? {position:'relative'} : undefined}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
              {msg.isDemo && (
                <span style={{
                  position:'absolute',top:10,right:12,
                  fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.08em',
                  color:'var(--accent-purple)',background:'rgba(139,92,246,0.15)',
                  padding:'2px 7px',borderRadius:4,textTransform:'uppercase',
                }}>
                  Demo
                </span>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-message assistant" style={{display:'flex',alignItems:'center',gap:10}}>
              <div className="loading-spinner"></div>
              <span style={{color:'var(--text-muted)'}}>Analysing firm data...</span>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        <div className="chat-input-area">
          <input
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={keyConfirmed ? "Ask about profitability, client wallets, budgets, competitors..." : "Connect your API key above to start chatting..."}
            disabled={loading || !keyConfirmed}
          />
          <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim() || !keyConfirmed}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
