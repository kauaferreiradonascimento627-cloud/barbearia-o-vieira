import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { MapPin, Clock, ChevronRight, ChevronLeft, User, Phone, CheckCircle, Scissors, Calendar, Star } from "lucide-react";

const STEPS = ["unit", "service", "barber", "time", "info", "confirm", "success"];

export default function ClientFlow({ onAdminClick }) {
  const [step, setStep] = useState("unit");
  const [booking, setBooking] = useState({
    unit: null, service: null, barber: null,
    date: null, time: null, name: "", phone: ""
  });
  const [data, setData] = useState({ units: [], services: [], barbers: [], appointments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [u, s, b, a] = await Promise.all([
      supabase.from("units").select("*").order("name"),
      supabase.from("services").select("*").order("name"),
      supabase.from("barbers").select("*").order("name"),
      supabase.from("appointments").select("*"),
    ]);
    setData({ units: u.data || [], services: s.data || [], barbers: b.data || [], appointments: a.data || [] });
    setLoading(false);
  }

  function go(nextStep) { setStep(nextStep); }
  function back() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  async function confirmBooking() {
    const { error } = await supabase.from("appointments").insert([{
      unit_id: booking.unit.id,
      service_id: booking.service.id,
      barber_id: booking.barber.id,
      date: booking.date,
      time: booking.time,
      client_name: booking.name,
      client_phone: booking.phone,
    }]);
    if (error) { alert("Erro: " + error.message); return; }
    const msg = `Olá ${booking.name}! Seu horário foi confirmado na Barbearia O Vieira 🔥\n\n✂️ Serviço: ${booking.service.name}\n👤 Barbeiro: ${booking.barber.name}\n📅 Data: ${formatDate(booking.date)} às ${booking.time}\n📍 Unidade: ${booking.unit.name}`;
    const link = `https://wa.me/55${booking.phone.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`;
    window.open(link, "_blank");
    await loadAll();
    go("success");
  }

  function formatDate(d) {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  }

  const stepIdx = STEPS.indexOf(step);
  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-stone-950/95 backdrop-blur-sm border-b border-stone-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {stepIdx > 0 && step !== "success" && (
              <button onClick={back} className="w-8 h-8 flex items-center justify-center text-stone-400">
                <ChevronLeft size={22} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <img src="https://i.imgur.com/BnR11UJ.png" alt="Logo" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h1 className="text-white font-black text-base leading-none">BARBEARIA O VIEIRA</h1>
                <p className="text-amber-400 text-[10px] tracking-widest uppercase">Seg-Sáb 9h-19h</p>
              </div>
            </div>
          </div>
          <button onClick={onAdminClick} className="text-stone-600 text-xs px-2 py-1">Admin</button>
        </div>
        {step !== "success" && (
          <div className="mt-3 flex gap-1">
            {["unit","service","barber","time","info","confirm"].map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${STEPS.indexOf(step) > i ? "bg-amber-400" : STEPS.indexOf(step) === i ? "bg-amber-400/60" : "bg-stone-800"}`} />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {step === "unit" && <StepUnit units={data.units} booking={booking} onSelect={u => { setBooking({...booking, unit: u}); go("service"); }} />}
        {step === "service" && <StepService services={data.services} booking={booking} onSelect={s => { setBooking({...booking, service: s}); go("barber"); }} />}
        {step === "barber" && <StepBarber barbers={data.barbers} booking={booking} onSelect={b => { setBooking({...booking, barber: b}); go("time"); }} />}
        {step === "time" && <StepTime booking={booking} appointments={data.appointments} onSelect={(d, t) => { setBooking({...booking, date: d, time: t}); go("info"); }} />}
        {step === "info" && <StepInfo booking={booking} onChange={v => setBooking({...booking, ...v})} onNext={() => go("confirm")} />}
        {step === "confirm" && <StepConfirm booking={booking} formatDate={formatDate} onConfirm={confirmBooking} />}
        {step === "success" && <StepSuccess booking={booking} formatDate={formatDate} onNew={() => { setBooking({unit:null,service:null,barber:null,date:null,time:null,name:"",phone:""}); go("unit"); }} />}
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="px-4 pt-6 pb-4">
      <h2 className="text-white text-2xl font-black">{title}</h2>
      {subtitle && <p className="text-stone-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

function StepUnit({ units, booking, onSelect }) {
  return (
    <div>
      <SectionTitle title="Escolha a Unidade" subtitle="Selecione a unidade mais próxima" />
      <div className="px-4 flex flex-col gap-3">
        {units.length === 0 && <p className="text-stone-500 text-center py-8">Nenhuma unidade cadastrada</p>}
        {units.map(u => (
          <button key={u.id} onClick={() => onSelect(u)} className={`w-full text-left rounded-2xl overflow-hidden border-2 transition-all bg-stone-900 ${booking.unit?.id === u.id ? "border-amber-400" : "border-stone-800"}`}>
            {u.photo_url ? <img src={u.photo_url} alt={u.name} className="w-full h-36 object-cover" /> : <div className="w-full h-36 bg-stone-800 flex items-center justify-center"><MapPin size={40} className="text-stone-600" /></div>}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">{u.name}</h3>
                  {u.address && <p className="text-stone-400 text-sm mt-1 flex items-center gap-1"><MapPin size={12} />{u.address}</p>}
                  {u.hours && <p className="text-amber-400 text-sm mt-1 flex items-center gap-1"><Clock size={12} />{u.hours}</p>}
                </div>
                <ChevronRight size={20} className="text-stone-500 mt-1" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepService({ services, booking, onSelect }) {
  return (
    <div>
      <SectionTitle title="Escolha o Serviço" subtitle={`Unidade: ${booking.unit?.name}`} />
      <div className="px-4 flex flex-col gap-3">
        {services.length === 0 && <p className="text-stone-500 text-center py-8">Nenhum serviço cadastrado</p>}
        {services.map(s => (
          <button key={s.id} onClick={() => onSelect(s)} className={`w-full text-left rounded-2xl p-4 border-2 transition-all bg-stone-900 ${booking.service?.id === s.id ? "border-amber-400" : "border-stone-800"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center"><Scissors size={20} className="text-amber-400" /></div>
                <div>
                  <h3 className="text-white font-bold">{s.name}</h3>
                  {s.duration && <p className="text-stone-400 text-sm flex items-center gap-1"><Clock size={12} />{s.duration} min</p>}
                </div>
              </div>
              <p className="text-amber-400 font-black text-lg">{s.price ? `R$ ${Number(s.price).toFixed(2).replace(".", ",")}` : "—"}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepBarber({ barbers, booking, onSelect }) {
  return (
    <div>
      <SectionTitle title="Escolha o Barbeiro" subtitle="Quem vai te atender?" />
      <div className="px-4 flex flex-col gap-3">
        {barbers.length === 0 && <p className="text-stone-500 text-center py-8">Nenhum barbeiro cadastrado</p>}
        {barbers.map(b => (
          <button key={b.id} onClick={() => onSelect(b)} className={`w-full text-left rounded-2xl p-4 border-2 transition-all bg-stone-900 ${booking.barber?.id === b.id ? "border-amber-400" : "border-stone-800"}`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-stone-800 flex-shrink-0">
                {b.photo_url ? <img src={b.photo_url} alt={b.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User size={28} className="text-stone-500" /></div>}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{b.name}</h3>
                {b.specialty && <p className="text-stone-400 text-sm">{b.specialty}</p>}
                {b.rating && <div className="flex items-center gap-1 mt-1"><Star size={12} className="text-amber-400 fill-amber-400" /><span className="text-amber-400 text-sm font-bold">{b.rating}</span></div>}
              </div>
              <ChevronRight size={20} className="text-stone-500" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepTime({ booking, appointments, onSelect }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const allTimes = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30"];
  
  const next14Days = Array.from({length: 14}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getUTCDay();
if (dayOfWeek === 0) return null; // fecha domingo
    return d.toISOString().split("T")[0];
  }).filter(Boolean);

  function selectDate(date) {
    setSelectedDate(date);
    const booked = appointments.filter(a => a.date === date && a.barber_id === booking.barber?.id).map(a => a.time);
    setAvailableTimes(allTimes.filter(t => !booked.includes(t)));
  }

  function formatDayLabel(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
    const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    return { day: days[d.getDay()], date: d.getDate(), month: months[d.getMonth()] };
  }

  return (
    <div>
      <SectionTitle title="Escolha o Horário" subtitle={`Barbeiro: ${booking.barber?.name}`} />
      <div className="px-4 mb-4">
        <p className="text-stone-400 text-xs uppercase tracking-widest mb-3">Data — Seg à Sáb 9h-19h</p>
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {next14Days.map(d => {
            const lbl = formatDayLabel(d);
            return (
              <button key={d} onClick={() => selectDate(d)} className={`flex-shrink-0 flex flex-col items-center p-3 rounded-2xl min-w-[60px] border-2 transition-all ${selectedDate === d ? "bg-amber-400 border-amber-400 text-stone-950" : "bg-stone-900 border-stone-800 text-white"}`}>
                <span className={`text-[10px] font-bold uppercase ${selectedDate === d ? "text-stone-800" : "text-stone-400"}`}>{lbl.day}</span>
                <span className="text-xl font-black mt-1">{lbl.date}</span>
                <span className={`text-[10px] ${selectedDate === d ? "text-stone-800" : "text-stone-500"}`}>{lbl.month}</span>
              </button>
            );
          })}
        </div>
      </div>
      {selectedDate && (
        <div className="px-4">
          <p className="text-stone-400 text-xs uppercase tracking-widest mb-3">Horários disponíveis</p>
          {availableTimes.length === 0 ? <p className="text-stone-500 text-center py-8">Sem horários disponíveis</p> : (
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map(t => (
                <button key={t} onClick={() => onSelect(selectedDate, t)} className="bg-stone-900 border-2 border-stone-800 hover:border-amber-400 text-white font-bold py-3 rounded-xl text-sm transition-all active:bg-amber-400 active:text-stone-950">{t}</button>
              ))}
            </div>
          )}
        </div>
      )}
      {!selectedDate && <div className="px-4 text-center py-8"><Calendar size={40} className="text-stone-700 mx-auto mb-3" /><p className="text-stone-500">Selecione uma data acima</p></div>}
    </div>
  );
}

function StepInfo({ booking, onChange, onNext }) {
  const [name, setName] = useState(booking.name || "");
  const [phone, setPhone] = useState(booking.phone || "");

  function formatPhone(v) {
    const d = v.replace(/\D/g,"").slice(0,11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  }

  function handleNext() {
    if (name.trim().length < 2 || phone.replace(/\D/g,"").length < 10) return;
    onChange({ name: name.trim(), phone: phone.replace(/\D/g,"") });
    onNext();
  }

  return (
    <div className="px-4">
      <SectionTitle title="Seus Dados" subtitle="Quase pronto!" />
      <div className="flex flex-col gap-4 mt-2">
        <div>
          <label className="text-stone-400 text-xs uppercase tracking-widest mb-2 block">Nome completo</label>
          <div className="flex items-center gap-3 bg-stone-900 border-2 border-stone-800 focus-within:border-amber-400 rounded-2xl px-4 py-3 transition-colors">
            <User size={18} className="text-stone-500" />
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-stone-600" />
          </div>
        </div>
        <div>
          <label className="text-stone-400 text-xs uppercase tracking-widest mb-2 block">WhatsApp</label>
          <div className="flex items-center gap-3 bg-stone-900 border-2 border-stone-800 focus-within:border-amber-400 rounded-2xl px-4 py-3 transition-colors">
            <Phone size={18} className="text-stone-500" />
            <input type="tel" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="(85) 99999-9999" className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-stone-600" />
          </div>
        </div>
        <button onClick={handleNext} disabled={name.trim().length < 2 || phone.replace(/\D/g,"").length < 10} className="w-full bg-amber-400 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-black py-4 rounded-2xl text-lg mt-4 active:scale-95 transition-all">Continuar</button>
      </div>
    </div>
  );
}

function StepConfirm({ booking, formatDate, onConfirm }) {
  const [loading, setLoading] = useState(false);
  async function handle() { setLoading(true); await onConfirm(); setLoading(false); }
  const rows = [
    { label: "Unidade", value: booking.unit?.name },
    { label: "Serviço", value: booking.service?.name },
    { label: "Barbeiro", value: booking.barber?.name },
    { label: "Data", value: formatDate(booking.date) },
    { label: "Horário", value: booking.time },
    { label: "Nome", value: booking.name },
    { label: "Valor", value: booking.service?.price ? `R$ ${Number(booking.service.price).toFixed(2).replace(".", ",")}` : "—" },
  ];
  return (
    <div className="px-4">
      <SectionTitle title="Confirmar" subtitle="Revise os dados" />
      <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden mb-6">
        {rows.map((r, i) => (
          <div key={r.label} className={`flex justify-between items-center px-4 py-3 ${i < rows.length - 1 ? "border-b border-stone-800" : ""}`}>
            <span className="text-stone-400 text-sm">{r.label}</span>
            <span className="text-white font-semibold text-sm text-right">{r.value || "—"}</span>
          </div>
        ))}
      </div>
      <button onClick={handle} disabled={loading} className="w-full bg-amber-400 text-stone-950 font-black py-5 rounded-2xl text-xl active:scale-95 transition-all disabled:opacity-70">
        {loading ? "Agendando..." : "✅ Confirmar Agendamento"}
      </button>
    </div>
  );
}

function StepSuccess({ booking, formatDate, onNew }) {
  return (
    <div className="px-4 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
        <CheckCircle size={48} className="text-green-400" />
      </div>
      <h2 className="text-white text-3xl font-black mb-2">Confirmado! 🔥</h2>
      <p className="text-stone-400 mb-6">Agendamento realizado com sucesso</p>
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 w-full mb-8 text-left">
        <p className="text-white font-bold text-lg">{booking.service?.name}</p>
        <p className="text-stone-300">{booking.barber?.name}</p>
        <p className="text-amber-400 font-semibold mt-2">{formatDate(booking.date)} às {booking.time}</p>
        <p className="text-stone-400 text-sm mt-1">{booking.unit?.name}</p>
      </div>
      <button onClick={onNew} className="w-full bg-amber-400 text-stone-950 font-black py-4 rounded-2xl text-lg active:scale-95 transition-all">Novo Agendamento</button>
    </div>
  );
}
