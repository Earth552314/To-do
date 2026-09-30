import { useEffect, useRef, useState } from 'react'
import { Check, Plus, Search, Trash2, X } from 'lucide-react'

const PRI = { low: 'ต่ำ', medium: 'กลาง', high: 'สูง' }
const ORDER = ['low', 'medium', 'high']
const CATS = { work: 'งาน', personal: 'ส่วนตัว', shopping: 'ช้อปปิ้ง', health: 'สุขภาพ' }
const CAT_KEYS = Object.keys(CATS)
const TABS = [['all', 'ทั้งหมด'], ['active', 'ยังไม่เสร็จ'], ['done', 'เสร็จแล้ว']]

const pad = (n) => String(n).padStart(2, '0')
const toStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const todayStr = () => toStr(new Date())
const offsetDay = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return toStr(d) }
const fmt = (s) => new Date(s + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })

let nextId = 5

function Item({ t, today, onToggle, onDelete, onSave, onCycle, onCat }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(t.text)
  const [due, setDue] = useState(t.due)
  const ref = useRef(null)

  useEffect(() => {
    if (editing && ref.current) { ref.current.focus(); ref.current.select() }
  }, [editing])

  const start = () => { setVal(t.text); setDue(t.due); setEditing(true) }
  const save = () => {
    const v = val.trim()
    if (v) onSave(t.id, { text: v, due })
    setEditing(false)
  }
  const cancel = () => setEditing(false)

  const dueCls = !t.due ? '' : t.done ? 'due-normal' : t.due < today ? 'due-over' : t.due === today ? 'due-today' : 'due-normal'
  const dueLabel = t.due && !t.done && t.due < today ? 'เกินกำหนด ' + fmt(t.due) : t.due && !t.done && t.due === today ? 'วันนี้' : t.due && fmt(t.due)

  return (
    <div className={'row' + (t.removing ? ' removing' : '')}>
      <button className={'chk' + (t.done ? ' on' : '')} onClick={() => onToggle(t.id)} aria-label="เสร็จสิ้น">
        {t.done && <Check size={14} strokeWidth={3} />}
      </button>

      {editing ? (
        <div className="flex-1 min-w-0 flex gap-2 flex-wrap">
          <input
            ref={ref}
            className="inp flex-1"
            style={{ minWidth: 140 }}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
          />
          <input type="date" className="inp" value={due} onChange={(e) => setDue(e.target.value)} />
          <button className="icon-btn" onClick={save} aria-label="บันทึก"><Check size={18} /></button>
          <button className="icon-btn" onClick={cancel} aria-label="ยกเลิก"><X size={18} /></button>
        </div>
      ) : (
        <div className="flex-1 min-w-0" onDoubleClick={start} title="ดับเบิลคลิกเพื่อแก้ไข">
          <div
            className="break-words"
            style={{ textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--muted)' : 'inherit', cursor: 'text' }}
          >
            {t.text}
          </div>
          <div className="flex gap-1.5 flex-wrap mt-1">
            <button className={'tag cat-' + t.cat} onClick={() => onCat(t.id)} title="คลิกเพื่อเปลี่ยนหมวดหมู่">{CATS[t.cat]}</button>
            {t.due && <span className={'due ' + dueCls}>{dueLabel}</span>}
          </div>
        </div>
      )}

      {!editing && (
        <button className={'badge pri-' + t.pri} onClick={() => onCycle(t.id)} title="คลิกเพื่อเปลี่ยนความสำคัญ">
          {PRI[t.pri]}
        </button>
      )}
      <button className="icon-btn" onClick={() => onDelete(t.id)} aria-label="ลบ"><Trash2 size={18} /></button>
    </div>
  )
}

function Donut({ segs, total, pct }) {
  let acc = 0
  return (
    <svg viewBox="0 0 42 42" width="96" height="96" role="img" aria-label="สัดส่วนสถานะงาน">
      <circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--line)" strokeWidth="6" />
      {total > 0 && segs.map((s) => {
        const p = (s.n / total) * 100
        const el = p > 0 && (
          <circle key={s.label} cx="21" cy="21" r="15.9155" fill="none" stroke={s.color} strokeWidth="6"
            strokeDasharray={`${p} ${100 - p}`} strokeDashoffset={25 - acc} />
        )
        acc += p
        return el
      })}
      <text x="21" y="23.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--text)">{pct}%</text>
    </svg>
  )
}

export default function App() {
  const today = todayStr()
  const [todos, setTodos] = useState([
    { id: 1, text: 'ส่งรายงานวิชาโปรแกรมมิ่ง', done: false, pri: 'high', cat: 'work', due: offsetDay(-1) },
    { id: 2, text: 'ประชุมกลุ่มโปรเจกต์', done: false, pri: 'medium', cat: 'work', due: today },
    { id: 3, text: 'ซื้อของเข้าบ้าน', done: true, pri: 'low', cat: 'shopping', due: '' },
    { id: 4, text: 'ไปวิ่งสวนสาธารณะ', done: false, pri: 'low', cat: 'health', due: offsetDay(2) },
  ])
  const [text, setText] = useState('')
  const [pri, setPri] = useState('medium')
  const [cat, setCat] = useState('personal')
  const [due, setDue] = useState('')
  const [filter, setFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [query, setQuery] = useState('')

  const add = () => {
    const v = text.trim()
    if (!v) return
    setTodos((p) => [...p, { id: nextId++, text: v, done: false, pri, cat, due }])
    setText(''); setDue('')
  }
  const update = (id, fn) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, ...fn(t) } : t)))
  const remove = (id) => {
    update(id, () => ({ removing: true }))
    setTimeout(() => setTodos((p) => p.filter((t) => t.id !== id)), 250)
  }

  const live = todos.filter((t) => !t.removing)
  const active = live.filter((t) => !t.done).length
  const doneCount = live.filter((t) => t.done).length
  const overdue = live.filter((t) => !t.done && t.due && t.due < today).length
  const total = live.length
  const pct = total ? Math.round((doneCount / total) * 100) : 0
  const segs = [
    { label: 'เสร็จแล้ว', n: doneCount, color: '#22c55e' },
    { label: 'ค้างอยู่', n: active - overdue, color: '#eab308' },
    { label: 'เกินกำหนด', n: overdue, color: '#ef4444' },
  ]

  const q = query.trim().toLowerCase()
  const shown = todos.filter((t) =>
    (filter === 'all' || (filter === 'active' ? !t.done : t.done)) &&
    (catFilter === 'all' || t.cat === catFilter) &&
    (!q || t.text.toLowerCase().includes(q)))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">รายการงานของฉัน</h1>
      <p className="muted mb-5 text-sm">จัดระเบียบสิ่งที่ต้องทำในแต่ละวัน</p>

      <div className="grid gap-4 md:grid-cols-[220px_1fr] items-start">
        <aside className="flex flex-col gap-4">
          <div className="card p-2">
            <div className="muted text-xs font-semibold px-3 pt-2 pb-1">หมวดหมู่</div>
            <div className="flex md:flex-col flex-wrap">
              <button className={'side' + (catFilter === 'all' ? ' on' : '')} onClick={() => setCatFilter('all')}>
                <span>ทั้งหมด</span><span className="n">{total}</span>
              </button>
              {CAT_KEYS.map((k) => (
                <button key={k} className={`side cat-${k}` + (catFilter === k ? ' on' : '')} onClick={() => setCatFilter(k)}>
                  <span><i className="dot" />{CATS[k]}</span>
                  <span className="n">{live.filter((t) => t.cat === k).length}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="muted text-xs font-semibold mb-3">สถิติ</div>
            <div className="flex items-center gap-4">
              <Donut segs={segs} total={total} pct={pct} />
              <div className="text-sm">
                <div>งานทั้งหมด <b>{total}</b></div>
                <div>สำเร็จ <b>{pct}%</b></div>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-1 text-xs">
              {segs.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span><i className="dot" style={{ background: s.color }} />{s.label}</span>
                  <b>{s.n}</b>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="card p-4 mb-4">
            <div className="flex gap-2">
              <input
                className="inp flex-1"
                placeholder="เพิ่มงานใหม่..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
              />
              <button className="add" onClick={add} disabled={!text.trim()}>
                <Plus size={18} /><span className="hidden sm:inline">เพิ่ม</span>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="muted text-sm">ความสำคัญ:</span>
              {ORDER.map((k) => (
                <button key={k} className={`seg ${k}` + (pri === k ? ' on' : '')} onClick={() => setPri(k)}>{PRI[k]}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <select className="inp" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="หมวดหมู่">
                {CAT_KEYS.map((k) => <option key={k} value={k}>{CATS[k]}</option>)}
              </select>
              <label className="muted text-sm flex items-center gap-2">
                กำหนดส่ง
                <input type="date" className="inp" value={due} onChange={(e) => setDue(e.target.value)} />
              </label>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--line)' }}>
              <Search size={18} className="muted" />
              <input
                className="inp flex-1"
                style={{ border: 0, padding: '6px 4px' }}
                placeholder="ค้นหางาน..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && <button className="icon-btn" onClick={() => setQuery('')} aria-label="ล้างการค้นหา"><X size={16} /></button>}
            </div>

            <div className="flex gap-1 p-3 flex-wrap" style={{ borderBottom: '1px solid var(--line)' }}>
              {TABS.map(([k, l]) => (
                <button key={k} className={'tab' + (filter === k ? ' on' : '')} onClick={() => setFilter(k)}>{l}</button>
              ))}
            </div>

            {shown.length === 0 ? (
              <div className="muted text-center py-10 text-sm">
                {q ? 'ไม่พบงานที่ค้นหา' : filter === 'done' ? 'ยังไม่มีงานที่เสร็จ' : 'ไม่มีงานในรายการ 🎉'}
              </div>
            ) : (
              shown.map((t) => (
                <Item
                  key={t.id}
                  t={t}
                  today={today}
                  onToggle={(id) => update(id, (x) => ({ done: !x.done }))}
                  onDelete={remove}
                  onSave={(id, patch) => update(id, () => patch)}
                  onCycle={(id) => update(id, (x) => ({ pri: ORDER[(ORDER.indexOf(x.pri) + 1) % 3] }))}
                  onCat={(id) => update(id, (x) => ({ cat: CAT_KEYS[(CAT_KEYS.indexOf(x.cat) + 1) % CAT_KEYS.length] }))}
                />
              ))
            )}

            <div className="flex items-center justify-between p-4 text-sm">
              <span className="muted">เหลืออีก {active} งาน</span>
              <button
                className="tab"
                style={{ padding: '4px 10px', opacity: doneCount ? 1 : 0.4 }}
                disabled={!doneCount}
                onClick={() => setTodos((p) => p.filter((t) => !t.done))}
              >
                ล้างที่เสร็จแล้ว{doneCount ? ` (${doneCount})` : ''}
              </button>
            </div>
          </div>

          <p className="muted text-center text-xs mt-4">ดับเบิลคลิกที่งานเพื่อแก้ไข • คลิกป้ายเพื่อเปลี่ยนความสำคัญ/หมวดหมู่</p>
        </main>
      </div>
    </div>
  )
}
