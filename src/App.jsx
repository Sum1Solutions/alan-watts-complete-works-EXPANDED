import React, { useMemo, useState } from 'react'
import { BOOKS } from './data.books.js'
import { KQED_EPISODES } from './data.kqed.js'
import { ESSENTIAL_LECTURES } from './data.essential.js'
import { THE_WORKS } from './data.theworks.js'

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
      .map(a => ({ ...a, recordings: a.recordings.filter(r => !q || r.toLowerCase().includes(q.toLowerCase())) }))
      .filter(a => a.recordings.length > 0 || (!q || a.title.toLowerCase().includes(q.toLowerCase())))
  })).filter(col => col.albums.length), [q])
  return (
    <div className="section">
      {groups.map((col, i) => (
        <div key={i} className="group">
          <h3>{col.collection}</h3>
          <div className="body">
            {col.albums.map((a, j)=>(
              <div key={j} style={{marginBottom:'12px'}}>
                <div style={{fontSize:'13px', color:'#6b7280'}}><b>{a.title}</b> • <a href={a.source} target="_blank" rel="noreferrer">Official listing ↗</a></div>
                <ul className="list">
                  {a.recordings.map((r,k)=>(<li key={k}>{r}</li>))}
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

  return (
    <div>
      <header>
        <div className="container">
          <div className="toolbar" style={{justifyContent:'space-between'}}>
            <div>
              <h1>Alan Watts – Complete Works (Reference)</h1>
              <div className="muted">Curated reference with links to primary sources</div>
              <div className="tabs">
                {tabs.map(t => (
                  <button key={t.id} className={"tab"+(t.id===tab?" active":"")} onClick={()=>setTab(t.id)}>{t.label}</button>
                ))}
              </div>
            </div>
            <div className="toolbar">
              <input className="input" placeholder="Search across notes & titles…" value={q} onChange={e=>setQ(e.target.value)} />
            </div>
          </div>
        </div>
      </header>

      <main className="container" style={{paddingTop:'12px'}}>
        {tab === 'books' && <Section title="Books"><BooksView q={q} /></Section>}
        {tab === 'kqed' && <Section title="KQED — Eastern Wisdom & Modern Life (1959–60)"><KQEDView q={q} /></Section>}
        {tab === 'essentials' && <Section title="The Essential Lectures (1972) — filmed"><EssentialsView q={q} /></Section>}
        {tab === 'works' && <Section title="The Works — Complete Audio Series Index"><WorksView q={q} /></Section>}
        <div className="footer">Notes compiled from official listings and public archives. Always cross‑check against the Alan Watts Electronic University for canonical metadata.</div>
      </main>
    </div>
  )
}
