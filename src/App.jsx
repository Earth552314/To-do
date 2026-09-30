import { useEffect, useRef, useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'

const PRI = { low: 'ต่ำ', medium: 'กลาง', high: 'สูง' }
const ORDER = ['low', 'medium', 'high']
const TABS = [['all', 'ทั้งหมด'], ['active', 'ยังไม่เสร็จ'], ['done', 'เสร็จแล้ว']]
let nextId = 3

function Item({ t, onToggle, onDelete, onEdit, onCycle }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(t.text)
  const ref = useRef(null)

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus()
      ref.current.select()
    }
  }, [editing])

  const save = () => {
    const v = val.trim()
    if (v) onEdit(t.id, v)
    else setVal(t.text)
    setEditing(false)
  }

  return (
    <div className={'row' + (t.removing ? ' removing' : '')}>
      <button className={'chk' + (t.done ? ' on' : '')} onClick={() => onToggle(t.id)} aria-label="เสร็จสิ้น">
        {t.done && <Check size={14} strokeWidth={3} />}
      </button>

      {editing ? (
        <input
          ref={ref}
          className="inp flex-1"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') { setVal(t.text); setEditing(false) }
          }}
        />
      ) : (
        <span
          className="flex-1 min-w-0 break-words"
          style={{
            textDecoration: t.done ? 'line-through' : 'none',
            color: t.done ? 'var(--muted)' : 'inherit',
            cursor: 'text',
          }}
          onDoubleClick={() => { setVal(t.text); setEditing(true) }}
          title="ดับเบิลคลิกเพื่อแก้ไข"
        >
          {t.text}
        </span>
      )}

      <button className={'badge pri-' + t.pri} onClick={() => onCycle(t.id)} title="คลิกเพื่อเปลี่ยนความสำคัญ">
        {PRI[t.pri]}
      </button>
      <button className="icon-btn" onClick={() => onDelete(t.id)} aria-label="ลบ">
        <Trash2 size={18} />
      </button>
    </div>
  )
}

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'ส่งรายงานวิชาโปรแกรมมิ่ง', done: false, pri: 'high' },
    { id: 2, text: 'ซื้อของเข้าบ้าน', done: true, pri: 'low' },
  ])
  const [text, setText] = useState('')
  const [pri, setPri] = useState('medium')
  const [filter, setFilter] = useState('all')

  const add = () => {
    const v = text.trim()
    if (!v) return
    setTodos((p) => [...p, { id: nextId++, text: v, done: false, pri }])
    setText('')
  }
  const update = (id, fn) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, ...fn(t) } : t)))
  const remove = (id) => {
    update(id, () => ({ removing: true }))
    setTimeout(() => setTodos((p) => p.filter((t) => t.id !== id)), 250)
  }

  const active = todos.filter((t) => !t.done && !t.removing).length
  const doneCount = todos.filter((t) => t.done).length
  const shown = todos.filter((t) => filter === 'all' || (filter === 'active' ? !t.done : t.done))

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">รายการงานของฉัน</h1>
      <p className="muted mb-5 text-sm">จัดระเบียบสิ่งที่ต้องทำในแต่ละวัน</p>

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
            <Plus size={18} />
            <span className="hidden sm:inline">เพิ่ม</span>
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="muted text-sm">ความสำคัญ:</span>
          {ORDER.map((k) => (
            <button key={k} className={`seg ${k}` + (pri === k ? ' on' : '')} onClick={() => setPri(k)}>
              {PRI[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex gap-1 p-3 flex-wrap" style={{ borderBottom: '1px solid var(--line)' }}>
          {TABS.map(([k, l]) => (
            <button key={k} className={'tab' + (filter === k ? ' on' : '')} onClick={() => setFilter(k)}>
              {l}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="muted text-center py-10 text-sm">
            {filter === 'done' ? 'ยังไม่มีงานที่เสร็จ' : 'ไม่มีงานในรายการ 🎉'}
          </div>
        ) : (
          shown.map((t) => (
            <Item
              key={t.id}
              t={t}
              onToggle={(id) => update(id, (x) => ({ done: !x.done }))}
              onDelete={remove}
              onEdit={(id, v) => update(id, () => ({ text: v }))}
              onCycle={(id) => update(id, (x) => ({ pri: ORDER[(ORDER.indexOf(x.pri) + 1) % 3] }))}
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

      <p className="muted text-center text-xs mt-4">ดับเบิลคลิกที่ข้อความเพื่อแก้ไข • คลิกป้ายเพื่อเปลี่ยนความสำคัญ</p>
    </div>
  )
}
