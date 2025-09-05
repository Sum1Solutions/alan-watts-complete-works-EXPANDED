import React, { useMemo, useState } from 'react'
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

const BooksView = ({ q }) => {
  const list = useMemo(() => BOOKS.filter(b => {
    const s = (b.title + ' ' + b.notes + ' ' + b.year).toLowerCase()
    return !q || s.includes(q.toLowerCase())
  }), [q])
  return (
    <div className="cards">
      {list.map((b,i)=>(
        <article key={i} className="card">
          <div className="chip">Book • {b.year}</div>
          <h3 className="title">{b.title}</h3>
          <p className="notes">{b.notes}</p>
          <a className="linkbtn" href={b.link} target="_blank" rel="noreferrer">Open source ↗</a>
        </article>
      ))}
    </div>
  )
}

const KQEDView = ({ q }) => {
  const list = useMemo(() => KQED_EPISODES.filter(ep => {
    const s = (ep.title + ' ' + (ep.notes||'')).toLowerCase()
    return !q || s.includes(q.toLowerCase())
  }), [q])
  return (
    <div className="cards">
      {list.map((e)=>(
        <article key={e.no} className="card">
          <div className="chip">KQED Episode • {e.no}</div>
          <h3 className="title">{e.title}</h3>
          {e.notes && <p className="notes">{e.notes}</p>}
          <a className="linkbtn" href={e.link} target="_blank" rel="noreferrer">Open episode ↗</a>
        </article>
      ))}
    </div>
  )
}

const EssentialsView = ({ q }) => {
  const list = useMemo(() => ESSENTIAL_LECTURES.filter(ep => {
    const s = (ep.title + ' ' + (ep.notes||'')).toLowerCase()
    return !q || s.includes(q.toLowerCase())
  }), [q])
  return (
    <div className="cards">
      {list.map((e)=>(
        <article key={e.no} className="card">
          <div className="chip">Essential Lectures • {e.no}</div>
          <h3 className="title">{e.title}</h3>
          {e.notes && <p className="notes">{e.notes}</p>}
          <a className="linkbtn" href={e.link} target="_blank" rel="noreferrer">Open episode ↗</a>
        </article>
      ))}
    </div>
  )
}

const WorksView = ({ q }) => {
  const groups = useMemo(() => THE_WORKS.map(col => ({
    ...col,
    albums: col.albums
      .map(a => ({ ...a, recordings: a.recordings.filter(r => !q || r.title.toLowerCase().includes(q.toLowerCase())) }))
      .filter(a => a.recordings.length > 0 || (!q || a.title.toLowerCase().includes(q.toLowerCase())))
  })).filter(col => col.albums.length), [q])
  return (
    <div className="section">
      {groups.map((col, i) => (
        <div key={i} className="group">
          <h3>{col.collection}</h3>
          <div className="body">
            {col.albums.map((a, j)=>(              <div key={j} style={{marginBottom:'12px'}}>
                <div style={{fontSize:'13px', color:'#6b7280'}}><b>{a.title}</b> • <a href={a.source} target="_blank" rel="noreferrer">Official listing ↗</a></div>
                <ul className="list">
                  {a.recordings.map((r,k)=>(<li key={k} className="list-item-link">
                    <span>{r.title}</span>
                    {r.link
                      ? <a href={r.link} target="_blank" rel="noreferrer" className="linkbtn-small">Open source ↗</a>
                      : <span className="chip-small">Missing link</span>
                    }
                  </li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('books')
  const [q, setQ] = useState('')

  const tabs = [
    { id: 'books', label: 'Books' },
    { id: 'kqed', label: 'KQED: Eastern Wisdom & Modern Life' },
    { id: 'essentials', label: 'Essential Lectures (Video)' },
    { id: 'works', label: 'The Works (Audio Series Index)' },
  ]

  // Check if any results exist for each section when searching
  const hasResults = useMemo(() => {
    if (!q) return { books: true, kqed: true, essentials: true, works: true }
    
    const booksHasResults = BOOKS.some(b => {
      const s = (b.title + ' ' + b.notes + ' ' + b.year).toLowerCase()
      return s.includes(q.toLowerCase())
    })
    
    const kqedHasResults = KQED_EPISODES.some(ep => {
      const s = (ep.title + ' ' + (ep.notes||'')).toLowerCase()
      return s.includes(q.toLowerCase())
    })
    
    const essentialsHasResults = ESSENTIAL_LECTURES.some(ep => {
      const s = (ep.title + ' ' + (ep.notes||'')).toLowerCase()
      return s.includes(q.toLowerCase())
    })
    
    const worksHasResults = THE_WORKS.some(col => 
      col.albums.some(a => 
        a.title.toLowerCase().includes(q.toLowerCase()) || 
        a.recordings.some(r => r.title.toLowerCase().includes(q.toLowerCase()))
      )
    )
    
    return { books: booksHasResults, kqed: kqedHasResults, essentials: essentialsHasResults, works: worksHasResults }
  }, [q])

  return (
    <div>
      <header>
        <div className="container">
          <div className="toolbar" style={{justifyContent:'space-between'}}>
            <div>
              <h1>Sum1namedAlan</h1>
              <div className="muted">An AI embodying Alan Watts' approach to life and philosophy + reference archive</div>
              <div className="tabs">
                {tabs.map(t => (
                  <button key={t.id} className={"tab"+(t.id===tab?" active":"")} onClick={()=>setTab(t.id)}>{t.label}</button>
                ))}
              </div>
            </div>
            <div className="toolbar">
              <input className="input" placeholder="Search across all content…" value={q} onChange={e=>setQ(e.target.value)} />
            </div>
          </div>
        </div>
      </header>

      <main className="container" style={{paddingTop:'12px'}}>
        {q ? (
          // When searching, show all sections with results
          <>
            {hasResults.books && <Section title="Books"><BooksView q={q} /></Section>}
            {hasResults.kqed && <Section title="KQED — Eastern Wisdom & Modern Life (1959–60)"><KQEDView q={q} /></Section>}
            {hasResults.essentials && <Section title="The Essential Lectures (1972) — filmed"><EssentialsView q={q} /></Section>}
            {hasResults.works && <Section title="The Works — Complete Audio Series Index"><WorksView q={q} /></Section>}
            {!hasResults.books && !hasResults.kqed && !hasResults.essentials && !hasResults.works && 
              <div style={{padding:'48px', textAlign:'center', color:'#6b7280'}}>No results found for "{q}"</div>
            }
          </>
        ) : (
          // When not searching, show only the selected tab
          <>
            {tab === 'books' && <Section title="Books"><BooksView q={q} /></Section>}
            {tab === 'kqed' && <Section title="KQED — Eastern Wisdom & Modern Life (1959–60)"><KQEDView q={q} /></Section>}
            {tab === 'essentials' && <Section title="The Essential Lectures (1972) — filmed"><EssentialsView q={q} /></Section>}
            {tab === 'works' && <Section title="The Works — Complete Audio Series Index"><WorksView q={q} /></Section>}
          </>
        )}
        <div className="footer">
          <div style={{marginBottom: '16px'}}>
            Notes compiled from official listings and public archives. Always cross‑check against the <a href="https://alanwatts.org" target="_blank" rel="noopener noreferrer">Alan Watts Organization</a> for canonical metadata.
          </div>
          <div style={{fontSize: '12px', lineHeight: '1.5', color: '#6b7280'}}>
            <div style={{marginBottom: '8px'}}>
              <strong>Disclaimer:</strong> All information provided here was obtained from open sources and is provided "as is". 
              The AI chat assistant is an automated tool that generates responses based on philosophical concepts - like using any tool, 
              use it with caution and don't necessarily believe everything it says.
            </div>
            <div>
              Created by <a href="https://sum1solutions.com" target="_blank" rel="noopener noreferrer">Sum1 Solutions</a>
            </div>
          </div>
        </div>
      </main>
      <ChatBot currentTab={tab} />
    </div>
  )
}
