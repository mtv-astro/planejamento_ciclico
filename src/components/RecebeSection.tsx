import React from "react";
import { useSectionObserver } from "@/hooks/useSectionObserver"; // ✅ novo

const RecebeSection = () => {
  // ✅ Tracking da seção Recebe
  useSectionObserver("recebe", "RecebeSection", {
    timeToStayMs: 6000,
    trackScrollDepth: true,
    trackBounceOnExit: true,
  });

  const gradients = [
    "from-lilas-mistico/20 to-azul-suave/20",
    "from-azul-suave/20 to-mostarda-quente/20",
    "from-mostarda-quente/20 to-lilas-mistico/20",
    "from-verde-lavanda/20 to-azul-suave/20",
    "from-azul-suave/20 to-offwhite-leve/40",
    "from-lilas-mistico/20 to-verde-lavanda/20",
  ];

  const icons = [
    <svg key="lua-crescente" viewBox="0 0 24 24" className="w-6 h-6 mx-auto mb-4 text-lilas-mistico fill-current">
      <path d="M12 2a10 10 0 1 0 0 20c-4-2-4-6-4-10s2-8 6-10z" />
    </svg>,
    <svg key="lua-nova" viewBox="0 0 24 24" className="w-6 h-6 mx-auto mb-4 text-verde-lavanda fill-current">
      <circle cx="12" cy="12" r="8" />
    </svg>,
    <svg key="lua-minguante" viewBox="0 0 24 24" className="w-6 h-6 mx-auto mb-4 text-lilas-mistico fill-current">
      <path d="M12 2a10 10 0 1 1 0 20c4-2 4-6 4-10s-2-8-6-10z" />
    </svg>,
    <svg key="sol" viewBox="0 0 24 24" className="w-6 h-6 mx-auto mb-4 text-mostarda-quente fill-current">
      <circle cx="12" cy="12" r="4" />
      <g stroke="currentColor" strokeWidth="1.5">
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="4.7" y1="4.7" x2="6.2" y2="6.2" />
        <line x1="17.8" y1="17.8" x2="19.3" y2="19.3" />
        <line x1="4.7" y1="19.3" x2="6.2" y2="17.8" />
        <line x1="17.8" y1="6.2" x2="19.3" y2="4.7" />
      </g>
    </svg>,
    <svg key="quadrantes" viewBox="0 0 24 24" className="w-6 h-6 mx-auto mb-4 text-lilas-mistico">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" />
    </svg>,
    <svg key="estrela-2" viewBox="0 0 24 24" className="w-6 h-6 mx-auto mb-4 text-lilas-mistico fill-current">
      <path d="M12 3l2.09 6.26H21l-5.45 3.96L17.91 21 12 17.27 6.09 21l1.36-7.78L2 9.26h6.91z" />
    </svg>,
  ];

  const items = [
    {
      title: "Aulas gravadas sobre o Método Planejamento Cíclico",
      description:
        "Você vai aprender a aplicar a sabedoria dos ciclos e as 12 casas astrológicas na organização da sua vida.",
    },
    {
      title: "Encontros ao vivo na Lua Nova",
      description:
        "Pra renovar intenções, definir foco e caminhar com consciência, mês após mês.",
    },
    {
      title: "Grupo de integração no WhatsApp",
      description:
        "Aberto nas Luas Nova e Cheia para trocas, dúvidas e ativações sem excesso, com presença.",
    },
    {
      title: "Guia de Planejamento Cíclico no Notion",
      description:
        "Completo, editável e simbólico. Um mapa prático pra acompanhar seus ciclos e alinhar ação com intenção.",
    },
    {
      title: "Estratégias pra construir um servir autêntico",
      description:
        "Com coragem, direção e intuição mesmo com a rotina de quem empreende, cuida e sente o mundo.",
    },
    {
      title: "Workshop Ciclo de Vênus",
      description:
        "Você vai aprender a despertar o amor próprio, integrando o arquétipo do feminino maduro que da valor a seu servir autêntico.",
    },
  ];

  return (
    <section id="recebe" className="py-16 bg-gradient-to-br from-offwhite-leve/25 to-offwhite-leve/25">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="[letter-spacing:0.03em] font-atteron font-bold text-2xl md:text-3xl uppercase text-gray-800 mb-4">
            Fazendo parte você recebe
          </h2>
          <div className="w-20 h-1 bg-mostarda-quente mx-auto rounded-full"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6">
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`w-[280px] bg-gradient-to-br ${gradients[idx % gradients.length]} backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in text-center`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {icons[idx]}
                <h3 className="font-garamond italic font-bold text-lg text-gray-800 mb-2">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="font-montserrat text-sm text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-16 text-center animate-fade-in"
          style={{ animationDelay: "0.7s" }}
        >
          <button
            onClick={() => {
              window.open("https://chat.whatsapp.com/K2pUcUW2EIb9w3Q8YiUbMP?mode=ac_t", "_blank");

              // ✅ Evento GA4 no clique
              if (typeof window !== "undefined" && "gtag" in window) {
                (window as any).gtag("event", "click", {
                  event_category: "CTA",
                  event_label: "Recebe - Quero viver meu tempo com presença",
                });
              }
            }}
            className="
              w-full sm:w-auto max-w-md
              px-10 py-2
              bg-gradient-to-r from-verde-lavanda to-azul-suave
              hover:from-mostarda-quente/90 hover:to-azul-suave/90
              text-white font-montserrat font-bold text-lg
              rounded-full shadow-xl hover:shadow-2xl
              animate-button-breath
            "
          >
            Quero viver meu tempo com presença!
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecebeSection;
