import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { LayoutDashboard, MapPin, Scissors, User, Calendar, Users, Plus, Edit2, Trash2, X, Clock, Phone, TrendingUp } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "units", label: "Unidades", icon: MapPin },
  { id: "services", label: "Serviços", icon: Scissors },
  { id: "barbers", label: "Barbeiros", icon: User },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "clients", label: "Clientes", icon: Users },
];

export default function AdminPanel({ onBack }) {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState({ units: [], services: [], barbers: [], appointments: [] });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [u, s, b, a] = await Promise.all([
      supabase.from("units").select("*"),
      supabase.from("services").select("*"),
      supabase.from("barbers").select("*"),
      supabase.from("appointments").select("*").order("date", {ascending: false}),
    ]);
    setData({ units: u.data||[], services: s.data||[], barbers: b.data||[], appointments: a.data||[] });
  }

  const ActiveTab = tab === "dashboard" ? Dashboard : tab === "units" ? UnitsTab : tab === "services" ? ServicesTab : tab === "barbers" ? BarbersTab : tab === "agenda" ? AgendaTab : ClientsTab;

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col max-w-md mx-auto">
      <div className="bg-stone-900 border-b border-stone-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-lg">Painel Admin</h1>
          <p className="text-amber-400 text-[10px] tracking-widest uppercase">Barbearia O Vieira</p>
        </div>
        <button onClick={onBack} className="text-stone-400 hover:text-white p-2"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
        <ActiveTab data={data} reload={loadAll} />
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-stone-900 border-t border-stone-800 z-30">
        <div className="flex">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${tab === t.id ? "text-amber-400" : "text-stone-500"}`}>
                <Icon size={18} />
                <span className="text-[9px] leading-none">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ data }) {
  const today = new Date().toISOString().split("T")[0];
  const todayAppts = data.appointments.filter(a => a.date === today);
  const thisMonth = data.appointments.filter(a => a.date?.startsWith(new Date().toISOString().slice(0,7)));
  const stats = [
    { label: "Hoje", value: todayAppts.length, icon: Calendar, color: "text-amber-400" },
    { label: "Este mês", value: thisMonth.length, icon: TrendingUp, color: "text-green-400" },
    { label: "Barbeiros", value: data.barbers.length, icon: User, color: "text-blue-400" },
    { label: "Serviços", value: data.services.length, icon: Scissors, color: "text-purple-400" },
  ];
  return (
    <div className="p-4">
      <h2 className="text-white text-xl font-black mb-4">Visão Geral</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map(s => { const Icon = s.icon; return (
          <div key={s.label} className="bg-stone-900 rounded-2xl border border-stone-800 p-4">
            <Icon size={20} className={s.color + " mb-2"} />
            <p className="text-white text-3xl font-black">{s.value}</p>
            <p className="text-stone-400 text-sm">{s.label}</p>
          </div>
        ); })}
      </div>
      <h3 className="text-white font-bold mb-3">Agendamentos de Hoje</h3>
      {todayAppts.length === 0 ? (
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 text-center"><p className="text-stone-500">Nenhum agendamento hoje</p></div>
      ) : (
        <div className="flex flex-col gap-2">
          {todayAppts.map(a => (
            <div key={a.id} className="bg-stone-900 rounded-xl border border-stone-800 p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center flex-shrink-0"><Clock size={16} className="text-amber-400" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{a.client_name}</p>
                <p className="text-stone-400 text-xs">{a.time} • {data.barbers.find(b=>b.id===a.barber_id)?.name || "Barbeiro"}</p>
              </div>
              <span className="text-amber-400 font-bold text-sm">{a.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Modal({ title, onClose, onSave, children }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-stone-900 rounded-t-3xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-black text-xl">{title}</h3>
          <button onClick={onClose} className="text-stone-400"><X size={20} /></button>
        </div>
        {children}
        <button onClick={onSave} className="w-full bg-amber-400 text-stone-950 font-black py-4 rounded-2xl text-lg mt-4">Salvar</button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div className="mb-4"><label className="text-stone-400 text-xs uppercase tracking-widest mb-2 block">{label}</label>{children}</div>;
}

function Input({ ...props }) {
  return <input {...props} className="w-full bg-stone-800 border-2 border-stone-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white outline-none transition-colors placeholder:text-stone-600" />;
}

function CrudTable({ title, items, onAdd, onEdit, onDelete, renderItem }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-black">{title}</h2>
        <button onClick={onAdd} className="flex items-center gap-2 bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-xl text-sm"><Plus size={16} /> Novo</button>
      </div>
      {items.length === 0 ? (
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-8 text-center"><p className="text-stone-500">Nenhum item cadastrado</p></div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(item => (
            <div key={item.id} className="bg-stone-900 rounded-2xl border border-stone-800 p-4">
              {renderItem(item)}
              <div className="flex gap-2 mt-3">
                <button onClick={() => onEdit(item)} className="flex-1 flex items-center justify-center gap-2 border border-stone-700 text-stone-300 py-2 rounded-xl text-sm hover:border-amber-400 hover:text-amber-400 transition-colors"><Edit2 size={14} /> Editar</button>
                <button onClick={() => onDelete(item.id)} className="flex-1 flex items-center justify-center gap-2 border border-stone-700 text-stone-300 py-2 rounded-xl text-sm hover:border-red-500 hover:text-red-400 transition-colors"><Trash2 size={14} /> Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UnitsTab({ data, reload }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  async function save() {
    if (modal === "add") await supabase.from("units").insert([form]);
    else await supabase.from("units").update(form).eq("id", form.id);
    setModal(null); reload();
  }
  async function del(id) {
    if (!confirm("Excluir esta unidade?")) return;
    await supabase.from("units").delete().eq("id", id); reload();
  }
  return (
    <>
      <CrudTable title="Unidades" items={data.units} onAdd={() => { setForm({}); setModal("add"); }} onEdit={u => { setForm({...u}); setModal("edit"); }} onDelete={del}
        renderItem={u => <div><p className="text-white font-bold">{u.name}</p>{u.address && <p className="text-stone-400 text-sm mt-1">{u.address}</p>}{u.hours && <p className="text-amber-400 text-sm">{u.hours}</p>}</div>} />
      {modal && <Modal title={modal === "add" ? "Nova Unidade" : "Editar Unidade"} onClose={() => setModal(null)} onSave={save}>
        <Field label="Nome"><Input value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nome da unidade" /></Field>
        <Field label="Endereço"><Input value={form.address||""} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Endereço" /></Field>
        <Field label="Horário"><Input value={form.hours||""} onChange={e=>setForm({...form,hours:e.target.value})} placeholder="Seg-Sáb 9h-19h" /></Field>
        <Field label="URL da Foto"><Input value={form.photo_url||""} onChange={e=>setForm({...form,photo_url:e.target.value})} placeholder="https://..." /></Field>
      </Modal>}
    </>
  );
}

function ServicesTab({ data, reload }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  async function save() {
    if (modal === "add") await supabase.from("services").insert([form]);
    else await supabase.from("services").update(form).eq("id", form.id);
    setModal(null); reload();
  }
  async function del(id) {
    if (!confirm("Excluir este serviço?")) return;
    await supabase.from("services").delete().eq("id", id); reload();
  }
  return (
    <>
      <CrudTable title="Serviços" items={data.services} onAdd={() => { setForm({}); setModal("add"); }} onEdit={s => { setForm({...s}); setModal("edit"); }} onDelete={del}
        renderItem={s => <div className="flex items-center justify-between"><div><p className="text-white font-bold">{s.name}</p>{s.duration && <p className="text-stone-400 text-sm">{s.duration} min</p>}</div>{s.price && <p className="text-amber-400 font-black text-lg">R$ {Number(s.price).toFixed(2).replace(".",",")}</p>}</div>} />
      {modal && <Modal title={modal === "add" ? "Novo Serviço" : "Editar Serviço"} onClose={() => setModal(null)} onSave={save}>
        <Field label="Nome"><Input value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nome do serviço" /></Field>
        <Field label="Preço (R$)"><Input type="number" value={form.price||""} onChange={e=>setForm({...form,price:e.target.value})} placeholder="0.00" /></Field>
        <Field label="Duração (min)"><Input type="number" value={form.duration||""} onChange={e=>setForm({...form,duration:e.target.value})} placeholder="30" /></Field>
      </Modal>}
    </>
  );
}

function BarbersTab({ data, reload }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  function toggleDay(day) {
    const days = (form.work_days || "1,2,3,4,5,6").split(",").map(Number);
    const newDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day].sort();
    setForm({...form, work_days: newDays.join(",")});
  }

  async function save() {
    if (modal === "add") await supabase.from("barbers").insert([form]);
    else await supabase.from("barbers").update(form).eq("id", form.id);
    setModal(null); reload();
  }
  async function del(id) {
    if (!confirm("Excluir este barbeiro?")) return;
    await supabase.from("barbers").delete().eq("id", id); reload();
  }

  const activeDays = (form.work_days || "1,2,3,4,5,6").split(",").map(Number);

  return (
    <>
      <CrudTable title="Barbeiros" items={data.barbers} onAdd={() => { setForm({work_days:"1,2,3,4,5,6", work_start:"09:00", work_end:"19:00", lunch_start:"12:00", lunch_end:"14:00"}); setModal("add"); }} onEdit={b => { setForm({...b}); setModal("edit"); }} onDelete={del}
        renderItem={b => (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-800 flex-shrink-0">
              {b.photo_url ? <img src={b.photo_url} alt={b.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User size={20} className="text-stone-500"/></div>}
            </div>
            <div>
              <p className="text-white font-bold">{b.name}</p>
              {b.specialty && <p className="text-stone-400 text-sm">{b.specialty}</p>}
              {b.work_start && <p className="text-stone-500 text-xs mt-1">{b.work_start} - {b.work_end} {b.lunch_start ? `| Almoço: ${b.lunch_start}-${b.lunch_end}` : ""}</p>}
            </div>
          </div>
        )}
      />
      {modal && <Modal title={modal === "add" ? "Novo Barbeiro" : "Editar Barbeiro"} onClose={() => setModal(null)} onSave={save}>
        <Field label="Nome"><Input value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nome do barbeiro" /></Field>
        <Field label="Especialidade"><Input value={form.specialty||""} onChange={e=>setForm({...form,specialty:e.target.value})} placeholder="Ex: Corte + Barba" /></Field>
        <Field label="Telefone"><Input value={form.phone||""} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="(85) 99999-9999" /></Field>
        <Field label="URL da Foto"><Input value={form.photo_url||""} onChange={e=>setForm({...form,photo_url:e.target.value})} placeholder="https://..." /></Field>
        <Field label="Dias de Trabalho">
          <div className="flex gap-2 flex-wrap">
            {[1,2,3,4,5,6,0].map(d => (
              <button key={d} type="button" onClick={() => toggleDay(d)}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${activeDays.includes(d) ? "bg-amber-400 text-stone-950" : "bg-stone-800 text-stone-400"}`}>
                {["D","S","T","Q","Q","S","S"][d]}
              </button>
            ))}
          </div>
          <p className="text-stone-500 text-xs mt-1">S=Seg T=Ter Q=Qua Q=Qui S=Sex S=Sáb D=Dom</p>
        </Field>
        <Field label="Início do Expediente"><Input type="time" value={form.work_start||"09:00"} onChange={e=>setForm({...form,work_start:e.target.value})} /></Field>
        <Field label="Fim do Expediente"><Input type="time" value={form.work_end||"19:00"} onChange={e=>setForm({...form,work_end:e.target.value})} /></Field>
        <Field label="Início do Almoço"><Input type="time" value={form.lunch_start||"12:00"} onChange={e=>setForm({...form,lunch_start:e.target.value})} /></Field>
        <Field label="Fim do Almoço"><Input type="time" value={form.lunch_end||"14:00"} onChange={e=>setForm({...form,lunch_end:e.target.value})} /></Field>
        <Field label="Avaliação"><Input type="number" min="0" max="5" step="0.1" value={form.rating||""} onChange={e=>setForm({...form,rating:e.target.value})} placeholder="4.9" /></Field>
      </Modal>}
    </>
  );
}

function AgendaTab({ data, reload }) {
  const [filter, setFilter] = useState(new Date().toISOString().split("T")[0]);
  const filtered = data.appointments.filter(a => !filter || a.date === filter).sort((a, b) => (a.time||"").localeCompare(b.time||""));
  async function cancel(id) {
    if (!confirm("Cancelar este agendamento?")) return;
    await supabase.from("appointments").delete().eq("id", id); reload();
  }
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-black">Agenda</h2>
        <input type="date" value={filter} onChange={e => setFilter(e.target.value)} className="bg-stone-900 border border-stone-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400" />
      </div>
      {filtered.length === 0 ? (
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-8 text-center"><p className="text-stone-500">Sem agendamentos nesta data</p></div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(a => (
            <div key={a.id} className="bg-stone-900 rounded-2xl border border-stone-800 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-amber-400 font-black text-xl">{a.time}</span>
                  <p className="text-white font-bold mt-1">{a.client_name}</p>
                </div>
                <button onClick={() => cancel(a.id)} className="text-stone-600 hover:text-red-400 p-1"><X size={16} /></button>
              </div>
              <p className="text-stone-400 text-sm">{data.services.find(s=>s.id===a.service_id)?.name} • {data.barbers.find(b=>b.id===a.barber_id)?.name}</p>
              {a.client_phone && <a href={`https://wa.me/55${a.client_phone}`} target="_blank" className="flex items-center gap-1 text-green-400 text-sm mt-2"><Phone size={12} />{a.client_phone}</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientsTab({ data }) {
  const clients = [...new Map(data.appointments.map(a => [a.client_phone, { name: a.client_name, phone: a.client_phone, visits: data.appointments.filter(x => x.client_phone === a.client_phone).length }])).values()].sort((a, b) => b.visits - a.visits);
  return (
    <div className="p-4">
      <h2 className="text-white text-xl font-black mb-4">Clientes <span className="text-stone-500 font-normal text-base">({clients.length})</span></h2>
      {clients.length === 0 ? (
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-8 text-center"><p className="text-stone-500">Nenhum cliente ainda</p></div>
      ) : (
        <div className="flex flex-col gap-2">
          {clients.map(c => (
            <div key={c.phone} className="bg-stone-900 rounded-2xl border border-stone-800 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400/10 rounded-full flex items-center justify-center flex-shrink-0"><User size={18} className="text-amber-400" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{c.name}</p>
                <p className="text-stone-400 text-xs">{c.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-amber-400 font-black">{c.visits}</p>
                <p className="text-stone-500 text-xs">visitas</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
