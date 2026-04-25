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
      unit_id: booking.unit.id, service_id: booking.service.id,
      barber_id: booking.barber.id, date: booking.date, time: booking.time,
      client_name: booking.name, client_phone: booking.phone,
    }]);
    if (!error) {
      const msg = `Olá ${booking.name}! Seu horário foi confirmado na Barbearia O Vieira 🔥\n\n✂️ Serviço: ${booking.service.name}\n👤 Barbeiro: ${booking.barber.name}\n📅 Data: ${formatDate(booking.date)} às ${booking.time}\n📍 Unidade: ${booking.unit.name}`;
      const link = `https://wa.me/55${booking.phone.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`;
      window.open(link, "_blank");
      await loadAll();
      go("success");
    }
  }

  function formatDate(d) {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  }

  const stepIdx = STEPS.indexOf(step);
  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center"><div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col max-w-md mx-auto">
      <div className="sticky top-0 z-20 bg-stone-950/95 backdrop-blur-sm border-b border-stone-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {stepIdx > 0 && step !== "success" && (
              <button onClick={back} className="w-8 h-8 flex items-center justify-center text-stone-400">
                <ChevronLeft size={22} />
              </button>
            )}
            <div>
              <h1 className="text-white font-black text-lg leading-none">O VIEIRA</h1>
              <p className="text-amber-400 text-[10px] tracking-widest uppercase">Barbearia</p>
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
              <div className="text-right">
                <p className="text-amber-400 font-black text-lg">{s.price ? `R$ ${Number(s.price).toFixed(2).replace(".", ",")}` : "—"}</p>
              </div>
            </div>
          </button>
        ))}
      </div
