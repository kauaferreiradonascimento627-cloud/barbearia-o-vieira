import { useState, useEffect } from "react";
import ClientFlow from "./components/ClientFlow";
import AdminPanel from "./components/AdminPanel";
import SplashScreen from "./components/SplashScreen";

export default function App() {
  const [view, setView] = useState("splash");
  const [adminAuth, setAdminAuth] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setView("client"), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (view === "splash") return <SplashScreen />;

  return (
    <div className="app-root">
      {view === "client" && (
        <ClientFlow onAdminClick={() => setView("adminLogin")} />
      )}
      {view === "adminLogin" && (
        <AdminLogin
          onLogin={() => { setAdminAuth(true); setView("admin"); }}
          onBack={() => setView("client")}
        />
      )}
      {view === "admin" && adminAuth && (
        <AdminPanel onBack={() => { setAdminAuth(false); setView("client"); }} />
      )}
    </div>
  );
}

function AdminLogin({ onLogin, onBack }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState(false);

  const handle = () => {
    if (pwd === "1052paulo") { setErr(false); onLogin(); }
    else setErr(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 p-6">
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="text-amber-400 mb-8 flex items-center gap-2 text-sm">
          ← Voltar
        </button>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✂️</span>
          </div>
          <h2 className="text-white text-2xl font-bold">Área Admin</h2>
          <p className="text-stone-400 text-sm mt-1">Barbearia O Vieira</p>
        </div>
        <input
          type="password"
          placeholder="Senha"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handle()}
          className={`w-full bg-stone-900 border ${err ? "border-red-500" : "border-stone-700"} rounded-2xl px-4 py-4 text-white text-lg outline-none focus:border-amber-400 transition-colors mb-4`}
        />
        {err && <p className="text-red-400 text-sm mb-4 text-center">Senha incorreta</p>}
        <button
          onClick={handle}
          className="w-full bg-amber-400 text-stone-950 font-bold py-4 rounded-2xl text-lg active:scale-95 transition-transform"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
