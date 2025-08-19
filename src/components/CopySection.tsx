import React from "react";
import { Sparkles, Star, Moon } from "lucide-react";

export default function CopySection() {
  const handleCtaClick = () => {
    window.open(
      "https://chk.eduzz.com/6W4VQX2O0Z",
      "_blank"
    );

    if (typeof window !== "undefined" && "gtag" in window) {
      (window as any).gtag("event", "click", {
        event_category: "CTA",
        event_label: "Comunidade - Quero entrar no grupo",
      });
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-azul-suave/10 to-lilas-mistico/10 py-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Ícones decorativos */}
        <div className="flex justify-center gap-6 mb-8 text-lilas-mistico">
          <Sparkles size={32} />
          <Moon size={32} />
          <Star size={32} />
        </div>

        {/* Bloco 1 */}
        <h2 className="font-garamond text-2xl md:text-3xl font-bold text-black leading-relaxed mb-6">
          Quando percebi que o mapa astral não era misticismo, mas uma
          ferramenta prática e poderosa, e que estava me guiando como uma bússola
          ancestral, ele me mostrou como alinhar meus planos com meus momentos
          mais favoráveis e a transformação foi profunda.
        </h2>

        {/* Bloco 2 */}
        <p className="font-garamond italic text-xl md:text-2xl text-black leading-relaxed mb-10">
          Abandonei o pensamento linear que me deixava exausta e me entreguei ao
          processo.<br /> O resultado?<br /> Fazem 10 anos que vivo plantando e colhendo
          projetos com maior conexão, satisfação e resultados muito mais alinhados
          com quem eu realmente sou.
        </p>

        {/* Bloco 3 */}
        <h2 className="font-garamond text-2xl md:text-3xl font-bold text-black leading-relaxed mb-6">
          Pensando em mulheres como eu e você, que buscam equilíbrio e propósito
          sem sacrificar a sua essência, nasceu o <br />{" "}
          <span className="text-lilas-mistico font-semibold">
            Planejamento Cíclico.
          </span>
          <br />Um método que une astrologia prática e estratégia cíclica para que
          mulheres realizem seus objetivos enquanto.
        </h2>

        {/* Bloco 4 */}
        <p className="font-garamond italic text-xl md:text-2xl text-black leading-relaxed mb-10">
          Você irá se desenvolver pessoalmente, acompanhando o ritmo natural do
          ano astrológico e construindo um servir autêntico que te realiza por
          completo.
        </p>

        {/* CTA - sem card de fundo */}
        <div className="mt-10 text-center">
          <button
            onClick={handleCtaClick}
            aria-label="Entrar na comunidade pelo WhatsApp"
            className="
              inline-flex items-center justify-center
              w-fit mx-auto
              px-8 py-3 rounded-full
              bg-gradient-to-r from-lilas-mistico to-azul-suave
              hover:from-verde-lavanda hover:to-mostarda-quente
              text-white font-montserrat font-semibold
              shadow-lg hover:shadow-xl
              transition-colors duration-200
              motion-safe:animate-button-breath
              transform-gpu [will-change:transform]
              whitespace-normal sm:whitespace-nowrap
            "
          >
            QUERO ENTRAR NA RODA!
          </button>
        </div>
      </div>
    </section>
  );
}
