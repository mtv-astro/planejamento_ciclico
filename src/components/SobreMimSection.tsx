import React, { useRef } from "react";
import { useSectionObserver } from "@/hooks/useSectionObserver";

const SobreMimSection = () => {
  const sectionRef = useRef(null);
  useSectionObserver("sobre_mim", "SobreMimSection", {
    timeToStayMs: 7000,
    trackScrollDepth: true,
    trackBounceOnExit: true,
  });
  return (
    <section ref={sectionRef} className="py-20 bg-offwhite-leve">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Imagem */}
            <div className="relative animate-fade-in">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/img/linda.jpg"
                  alt="Astróloga trabalhando com mapas astrológicos"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-azul-suave/20 to-transparent"></div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h2 className="font-atteron font-bold text-3xl md:text-4xl uppercase text-gray-800">
                Sobre a mentora por trás da Comunidade:
              </h2>
              <h3 className="font-atteron font-semibold text-2xl md:text-3xl text-gray-600 mt-2">
                Mariana Tevah
              </h3>

              <div className="space-y-6">
                <p className="font-garamond italic font-bold text-lg text-gray-700 leading-relaxed">
                  <span className="text-xl text-mostarda-quente">Mãe, astróloga, visionária e criadora do <br />Método Planejamento Cíclico</span>
                </p>

                <p className="font-montserrat text-lg text-gray-700 leading-relaxed">
                  Há anos acompanho mulheres na jornada de descobrir seu propósito autêntico, combinando os saberes ancestrais do feminino com as ferramentas da astrologia, criei uma estrutura prática de organização cíclica.
                </p>

                <p className="font-montserrat text-lg text-gray-700 leading-relaxed">
                  Acredito que cada uma de nós tem um servir único no mundo, e minha missão é ajudar você a encontrar e viver essa verdade com coragem e leveza.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SobreMimSection;
