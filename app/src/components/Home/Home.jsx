import auctionImg from "../../assets/auction-hero.png";

export function Home() {
  return (
    <div className="relative w-full h-screen flex items-center justify-center text-center overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: auctionImg ? `url(${auctionImg})` : "none",
          backgroundColor: "#1e1e2e",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.5)",
        }}
      />

      <div className="px-4 max-w-2xl text-white">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
          Subastas en Línea
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-6 drop-shadow">
          Descubre objetos únicos y haz tus pujas en tiempo real.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/object" className="px-6 py-3 bg-primary text-white rounded-lg font-semibold shadow-lg hover:bg-primary/90 transition">
            Ver Objetos
          </a>
          <a href="/user/login" className="px-6 py-3 bg-secondary text-white rounded-lg font-semibold shadow-lg hover:bg-secondary/90 transition">
            Iniciar Sesión
          </a>
          <a href="/user/register" className="px-6 py-3 bg-white/20 text-white border border-white/40 rounded-lg font-semibold shadow-lg hover:bg-white/30 transition">
            Registrarse
          </a>
        </div>
      </div>
    </div>
  );
}