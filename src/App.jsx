import React, { useMemo, useState, useEffect } from 'react'
import { BOOKS } from './data.books.js'
import { KQED_EPISODES } from './data.kqed.js'
import { ESSENTIAL_LECTURES } from './data.essential.js'
import { THE_WORKS } from './data.theworks.js'
import ChatBot from './ChatBot.jsx'

const Search = ({ value, onChange }) => (
  <input className="input" placeholder="Search titles, notes…" value={value} onChange={e=>onChange(e.target.value)} />
)

const Section = ({ title, children }) => (
  <section className="section">
    <div style={{display:'flex', justifyContent:'space-between', margin:'8px 0'}}>
      <h2>{title}</h2>
    </div>
    {children}
  </section>
)

const BooksView = () => (
  <div className="cards">
    {BOOKS.map((b,i)=>(
      <article key={i} className="card">
        <div className="chip">Book • {b.year}</div>
        <h3 className="title">{b.title}</h3>
        <p className="notes">{b.notes}</p>
        <a className="linkbtn" href={b.link} target="_blank" rel="noreferrer">Open source ↗</a>
      </article>
    ))}
  </div>
)

const KQEDView = () => (
  <div className="cards">
    {KQED_EPISODES.map((e)=>(
      <article key={e.no} className="card">
        <div className="chip">KQED Episode • {e.no}</div>
        <h3 className="title">{e.title}</h3>
        {e.notes && <p className="notes">{e.notes}</p>}
        <a className="linkbtn" href={e.link} target="_blank" rel="noreferrer">Open episode ↗</a>
      </article>
    ))}
  </div>
)

const EssentialsView = () => (
  <div className="cards">
    {ESSENTIAL_LECTURES.map((e)=>(
      <article key={e.no} className="card">
        <div className="chip">Essential Lectures • {e.no}</div>
        <h3 className="title">{e.title}</h3>
        {e.notes && <p className="notes">{e.notes}</p>}
        <a className="linkbtn" href={e.link} target="_blank" rel="noreferrer">Open episode ↗</a>
      </article>
    ))}
  </div>
)

// AI Recommendations Display Component
const RecommendationsView = ({ recommendations }) => {
  if (!recommendations) return null;
  
  return (
    <div style={{
      background: 'var(--orange)',
      color: 'white',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '24px',
      boxShadow: '0 4px 12px rgba(243, 128, 32, 0.3)'
    }}>
      <h3 style={{margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600'}}>
        💡 Sum1namedAlan suggests:
      </h3>
      <p style={{margin: '0 0 12px 0', fontSize: '14px', opacity: 0.9}}>
        {recommendations.context}
      </p>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
        {recommendations.content.map((item, i) => (
          <span key={i} style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

const WorksView = () => {
  // Flatten all recordings into cards
  const allRecordings = [];
  THE_WORKS.forEach(collection => {
    collection.albums.forEach(album => {
      album.recordings.forEach(recording => {
        allRecordings.push({
          ...recording,
          albumTitle: album.title,
          collection: collection.collection,
          source: album.source
        });
      });
    });
  });

  return (
    <div className="cards">
      {allRecordings.map((r, i) => (
        <article key={i} className="card">
          <div className="chip">Audio Recording • {r.collection}</div>
          <h3 className="title">{r.title}</h3>
          <p className="notes">From: {r.albumTitle}</p>
          {r.link 
            ? <a className="linkbtn" href={r.link} target="_blank" rel="noreferrer">Open source ↗</a>
            : <div className="linkbtn" style={{opacity: 0.5, cursor: 'not-allowed'}}>Missing link</div>
          }
        </article>
      ))}
    </div>
  );
}

const AllView = () => (
  <div className="section" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start'}}>
    <div>
      <h2 style={{margin:'0 0 16px 0', fontSize:'20px', textAlign: 'center', color: 'var(--orange)', borderBottom: '2px solid var(--orange)', paddingBottom: '8px'}}>Books</h2>
      <BooksView />
    </div>
    <div>
      <h2 style={{margin:'0 0 16px 0', fontSize:'20px', textAlign: 'center', color: 'var(--orange)', borderBottom: '2px solid var(--orange)', paddingBottom: '8px'}}>KQED</h2>
      <KQEDView />
    </div>
    <div>
      <h2 style={{margin:'0 0 16px 0', fontSize:'20px', textAlign: 'center', color: 'var(--orange)', borderBottom: '2px solid var(--orange)', paddingBottom: '8px'}}>Essential Lectures</h2>
      <EssentialsView />
    </div>
    <div>
      <h2 style={{margin:'0 0 16px 0', fontSize:'20px', textAlign: 'center', color: 'var(--orange)', borderBottom: '2px solid var(--orange)', paddingBottom: '8px'}}>The Works</h2>
      <WorksView />
    </div>
  </div>
)

// Theme Toggle Component
const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    // Detect system preference on load
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) return savedTheme
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '6px 12px',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        background: 'var(--card)',
        color: 'var(--fg)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        minWidth: '44px',
        height: '32px'
      }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}

export default function App() {
  const [tab, setTab] = useState('books')
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024)
  const [chatWidth, setChatWidth] = useState(450)
  const [isDragging, setIsDragging] = useState(false)
  const [contentFilter, setContentFilter] = useState(null)
  const [aiRecommendations, setAiRecommendations] = useState(null)

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle mouse drag for resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return
      const newWidth = Math.max(300, Math.min(800, window.innerWidth - e.clientX))
      setChatWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // Handle content requests from chatbot
  const handleContentRequest = (request) => {
    if (request.type === 'recommendations') {
      setAiRecommendations({
        content: request.content,
        context: request.context,
        timestamp: Date.now()
      });
    }
  }

  const tabs = [
    { id: 'books', label: 'Books' },
    { id: 'kqed', label: 'KQED: Eastern Wisdom & Modern Life' },
    { id: 'essentials', label: 'Essential Lectures (Video)' },
    { id: 'works', label: 'The Works (Audio Series Index)' },
  ]


  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      {/* Desktop: Left Column Content Area */}
      {isDesktop ? (
        <div style={{
          flex: 1,
          height: '100vh',
          overflow: 'auto',
          background: 'var(--content-bg)'
        }}>
          {/* Integrated Header in Content */}
          <div style={{
            padding: '24px 32px',
            background: 'var(--bg)',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px'}}>
              <h1 style={{
                margin: '0', 
                fontSize: '32px',
                color: 'var(--orange)',
                fontWeight: '600'
              }}>
                Alan Watts AI + Reference Archive
              </h1>
            </div>
            
            {/* Orange divider line - aligned with chat header */}
            <div style={{
              height: '3px',
              background: 'var(--orange)',
              marginBottom: '16px'
            }} />
            
            {/* TL;DR positioned below divider */}
            <div style={{textAlign: 'center', marginBottom: '16px'}}>
              <a href="https://app.screencast.com/UkiROLrdG2fyI" target="_blank" rel="noopener noreferrer" style={{
                color: 'var(--orange)',
                textDecoration: 'underline',
                fontSize: '16px',
                fontWeight: '500'
              }}>TL;DR (Too long; didn't read)</a>
            </div>
            
            <div className="tabs">
              <button className={"tab"+(tab==='books'?" active":"")} onClick={()=>setTab('books')}>Books</button>
              <button className={"tab"+(tab==='kqed'?" active":"")} onClick={()=>setTab('kqed')}>KQED: Eastern Wisdom & Modern Life</button>
              <button className={"tab"+(tab==='essentials'?" active":"")} onClick={()=>setTab('essentials')}>Essential Lectures (Video)</button>
              <button className={"tab"+(tab==='works'?" active":"")} onClick={()=>setTab('works')}>The Works (Audio Series Index)</button>
              <button className={"tab"+(tab==='all'?" active":"")} onClick={()=>setTab('all')}>All</button>
            </div>
          </div>
          
          {/* Content Area */}
          <div style={{padding: '24px 32px'}}>
            {/* AI Recommendations */}
            <RecommendationsView recommendations={aiRecommendations} />
            {tab === 'all' && <AllView />}
            {tab === 'books' && <Section title="Books"><BooksView /></Section>}
            {tab === 'kqed' && <Section title="KQED — Eastern Wisdom & Modern Life (1959–60)"><KQEDView /></Section>}
            {tab === 'essentials' && <Section title="The Essential Lectures (1972) — filmed"><EssentialsView /></Section>}
            {tab === 'works' && <Section title="The Works — Complete Audio Series Index"><WorksView /></Section>}
          </div>
          
          {/* Persistent Footer */}
          <div style={{
            position: 'sticky',
            bottom: 0,
            background: 'var(--card)',
            borderTop: '1px solid var(--border)',
            padding: '12px 32px',
            fontSize: '11px',
            color: 'var(--muted)',
            zIndex: 5
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
              <div>
                Notes compiled from official listings and public archives. Always cross‑check against the <a href="https://alanwatts.org" target="_blank" rel="noopener noreferrer" style={{color: 'var(--orange)'}}>Alan Watts Organization</a> for canonical metadata.
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <span><strong>Disclaimer:</strong> Information provided "as is". AI responses are automated - use with caution.</span>
                <span>•</span>
                <span>Created by <a href="https://sum1solutions.com" target="_blank" rel="noopener noreferrer" style={{color: 'var(--orange)'}}>Sum1 Solutions</a></span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Desktop: Resizable Divider and Chat Column */}
      {isDesktop && (
        <>
          {/* Resizable Divider */}
          <div
            onMouseDown={() => setIsDragging(true)}
            style={{
              width: '4px',
              height: '100vh',
              background: 'var(--border)',
              cursor: 'col-resize',
              flexShrink: 0,
              transition: isDragging ? 'none' : 'background 0.2s',
              borderLeft: '1px solid var(--border)'
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--orange)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--border)'}
          />
          
          <div style={{
            width: `${chatWidth}px`,
            height: '100vh',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            <ChatBot 
              currentTab={tab} 
              isEmbedded={true} 
              showThemeToggle={true} 
              onContentRequest={handleContentRequest}
            />
          </div>
        </>
      )}

      {!isDesktop && (
        /* Mobile Layout */
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}>
          <header>
            <div className="container">
              <div className="toolbar" style={{justifyContent:'space-between'}}>
                <div>
                  <h1 style={{
                    color: 'var(--orange)', 
                    fontSize: '24px',
                    fontWeight: '600'
                  }}>
                    Alan Watts AI + Reference Archive
                  </h1>
                  <div className="tabs">
                    <button className={"tab"+(tab==='books'?" active":"")} onClick={()=>setTab('books')}>Books</button>
                    <button className={"tab"+(tab==='kqed'?" active":"")} onClick={()=>setTab('kqed')}>KQED: Eastern Wisdom & Modern Life</button>
                    <button className={"tab"+(tab==='essentials'?" active":"")} onClick={()=>setTab('essentials')}>Essential Lectures (Video)</button>
                    <button className={"tab"+(tab==='works'?" active":"")} onClick={()=>setTab('works')}>The Works (Audio Series Index)</button>
                    <button className={"tab"+(tab==='all'?" active":"")} onClick={()=>setTab('all')}>All</button>
                  </div>
                </div>
                <div className="toolbar">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </header>
          
          <main className="container" style={{flex: 1, paddingTop:'12px'}}>
            {/* AI Recommendations */}
            <RecommendationsView recommendations={aiRecommendations} />
            {tab === 'all' && <AllView />}
            {tab === 'books' && <Section title="Books"><BooksView /></Section>}
            {tab === 'kqed' && <Section title="KQED — Eastern Wisdom & Modern Life (1959–60)"><KQEDView /></Section>}
            {tab === 'essentials' && <Section title="The Essential Lectures (1972) — filmed"><EssentialsView /></Section>}
            {tab === 'works' && <Section title="The Works — Complete Audio Series Index"><WorksView /></Section>}
          </main>
          
          {/* Mobile: Chat at bottom */}
          <div style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 20,
            maxHeight: '50vh'
          }}>
            <ChatBot 
              currentTab={tab} 
              isEmbedded={true} 
              showThemeToggle={false} 
              onContentRequest={handleContentRequest}
            />
          </div>
        </div>
      )}
    </div>
  )
}
