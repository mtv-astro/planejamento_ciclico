import React from 'react';
import { useSectionObserver } from "@/hooks/useSectionObserver"; // ✅ novo

const ComunidadeSection = () => {
  // ✅ Monitoramento da seção
  useSectionObserver("comunidade", "ComunidadeSection", {
    timeToStayMs: 7000,
    trackScrollDepth: true,
    trackBounceOnExit: true,
  });

  return (
    <section id="comunidade" className="py-16 bg-offwhite-leve">
      <div className="container mx-auto px-6 lg:px-8">

        {/* Card com h2 com imagem ao fundo */}
        <div
          className="rounded-3xl overflow-hidden shadow-lg mb-12 text-center flex items-center justify-center h-[160px] md:h-[200px] lg:h-[240px] relative"
          style={{
            backgroundImage: "url('/img/roda-cerimonial.png')",
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center 40%',
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <h2 className="relative z-10 font-atteron font-bold text-2xl md:text-3xl uppercase text-white leading-snug px-4">
            O que é a Comunidade de{' '}
            <span className="[letter-spacing:0.01em]">Planejamento</span>{' '}
            <span className="[letter-spacing:0.03em]">Cíclico?</span>
          </h2>
        </div>

        {/* Grid ajustado: texto primeiro no mobile, imagem depois */}
        <div className="flex flex-col md:grid md:grid-cols-2 items-center gap-6 animate-fade-in">
          {/* Texto */}
          <div className="order-1 md:order-none bg-gradient-to-br from-lilas-mistico/50 to-azul-suave/50 rounded-3xl p-6 md:p-12 shadow-lg">
            <p className="font-garamond italic font-bold text-xl md:text-2xl text-black leading-relaxed mb-6">
              Um <span className="font-bold">espaço vivo</span> de autoconhecimento, organização cíclica e astrologia prática criado para mulheres.
            </p>
            <p className="font-montserrat text-base md:text-xl text-black leading-relaxed">
              Aqui você vai encontrar o <span className="font-bold">Método de Planejamento Cíclico</span> e aprender a viver sua vida com mais
              <span className="font-bold"> direção</span>,
              <span className="font-bold"> leveza</span> e
              <span className="font-bold"> autenticidade</span>.
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

        {/* Banner de oferta especial */}
        <div className="mt-10 bg-mostarda-quente/20 rounded-3xl p-6 md:p-8 text-center">
          <button
            onClick={() => {
              window.open(
                "https://chat.whatsapp.com/K2pUcUW2EIb9w3Q8YiUbMP?mode=ac_t",
                "_blank"
              );

              if (typeof window !== "undefined" && "gtag" in window) {
                (window as any).gtag("event", "click", {
                  event_category: "CTA",
                  event_label: "Comunidade - Quero entrar no grupo",
                });
              }
            }}
            aria-label="Entrar na comunidade pelo WhatsApp"
            className="
      inline-flex items-center justify-center
      w-fit mx-auto                     /* largura colada ao texto */
      px-8 py-3 rounded-full
      bg-verde-lavanda hover:bg-mostarda-quente/90
      text-white font-montserrat font-semibold
      shadow-lg hover:shadow-xl
      transition-colors duration-200    /* só cores, não mexe no transform */
      motion-safe:animate-button-breath /* usa a animação única do config */
      transform-gpu [will-change:transform]
      whitespace-normal sm:whitespace-nowrap
    "
          >
            SE INSCREVA PARA A COMUNIDADE!
          </button>
        </div>


      </div>
    </section>
  );
};

export default ComunidadeSection;
