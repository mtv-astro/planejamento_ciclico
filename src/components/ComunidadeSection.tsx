import React from "react";
import { useSectionObserver } from "@/hooks/useSectionObserver";

const ComunidadeSection = () => {
  // ✅ Monitoramento da seção
  useSectionObserver("comunidade", "ComunidadeSection", {
    timeToStayMs: 7000,
    trackScrollDepth: true,
    trackBounceOnExit: true,
  });

  const handleCtaClick = () => {
    window.open("https://chk.eduzz.com/6W4VQX2O0Z", "_blank");
    if (typeof window !== "undefined" && "gtag" in window) {
      (window as any).gtag("event", "click", {
        event_category: "CTA",
        event_label: "Comunidade - Quero entrar no grupo",
      });
    }
  };

  const buttonClasses = `
    inline-flex items-center justify-center
    w-fit mx-auto
    px-8 py-3 rounded-full
    bg-verde-lavanda hover:bg-mostarda-quente/90
    text-white font-montserrat font-semibold
    shadow-lg hover:shadow-xl
    transition-colors duration-200
    motion-safe:animate-button-breath
    transform-gpu [will-change:transform]
    whitespace-normal sm:whitespace-nowrap
  `;

  return (
    <section id="comunidade" className="py-16 bg-offwhite-leve">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Card com h2 com imagem ao fundo */}
        <div
          className="rounded-3xl overflow-hidden shadow-lg mb-12 text-center flex items-center justify-center h-[160px] md:h-[200px] lg:h-[240px] relative"
          style={{
            backgroundImage: "url('/img/roda-cerimonial.png')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center 40%",
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <h2 className="relative z-10 font-atteron font-bold text-2xl md:text-3xl uppercase text-white leading-snug px-4">
            O que é a Comunidade de{" "}
            <span className="[letter-spacing:0.01em]">Planejamento</span>{" "}
            <span className="[letter-spacing:0.03em]">Cíclico?</span>
          </h2>
        </div>

        {/* Grid ajustado: texto primeiro no mobile, imagem depois */}
        <div className="flex flex-col md:grid md:grid-cols-2 items-center gap-6 animate-fade-in">
          {/* Texto */}
          <div className="order-1 md:order-none bg-gradient-to-br from-lilas-mistico/50 to-azul-suave/50 rounded-3xl p-6 md:p-12 shadow-lg">
            <p className="font-garamond italic text-xl md:text-2xl text-black leading-relaxed mb-6">
              Um espaço vivo de{" "}
              <strong>astrologia profunda e organização cíclica </strong>
              criado para mulheres autênticas.
            </p>
            <p className="font-montserrat text-base md:text-xl text-black leading-relaxed">
              Aqui você vai encontrar o{" "}
              <span className="font-bold">Método de Planejamento Cíclico</span>{" "}
              e aprender a viver sua vida com mais{" "}
              <strong> PROPÓSITO, LEVEZA E DIREÇÃO!</strong>
            </p>
          </div>

          {/* Imagem */}
          <div className="order-2 md:order-none flex justify-center">
            <img
              src="/img/roda.jpg"
              alt="Mulher em momento reflexivo"
              className="rounded-3xl shadow-lg w-full max-w-sm md:max-w-md h-auto object-cover"
            />
          </div>
        </div>

        {/* ---- CTA com comportamento responsivo ---- */}

        {/* Desktop/Tablet (md+): botão dentro do card de fundo */}
        <div className="hidden md:block mt-10 bg-mostarda-quente/20 rounded-3xl p-8 text-center shadow-sm">
          <button
            onClick={handleCtaClick}
            aria-label="Entrar na comunidade pelo WhatsApp"
            className={buttonClasses}
          >
            QUERO ENTRAR NA RODA!
          </button>
        </div>

        {/* Mobile: somente o botão, sem o card de fundo */}
        <div className="block md:hidden mt-10 text-center">
          <button
            onClick={handleCtaClick}
            aria-label="Entrar na comunidade pelo WhatsApp"
            className={buttonClasses}
          >
            QUERO ENTRAR NA RODA!
          </button>
        </div>
      </div>
    </section>
  );
};

export default ComunidadeSection;
