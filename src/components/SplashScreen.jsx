export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #d97706 0, #d97706 1px, transparent 0, transparent 50%)`,
          backgroundSize: "20px 20px"
        }} />
      </div>
      
      <div className="text-center z-10 animate-fade-in">
        <div className="w-40 h-40 mx-auto mb-6 animate-pulse-slow">
          <img src="https://i.imgur.com/BnR11UJ.png" alt="Barbearia O Vieira" className="w-full h-full object-contain rounded-full" />
        </div>
        <p className="text-amber-400 text-sm tracking-[0.3em] uppercase">Agendamento Online</p>
        <div className="mt-8 flex gap-2 justify-center">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay:"0ms"}} />
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay:"150ms"}} />
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay:"300ms"}} />
        </div>
      </div>
    </div>
  );
}
