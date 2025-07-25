import React from "react";

const BeneficiosSection: React.FC = () => {
  const pontos = [
    "Clareza pra agir com propósito sem se desviar",
    "Constância e foco real nos projetos sem pressa",
    "Um jeito novo de se organizar: mais cíclico, mais consciente",
    "Satisfação de viver com presença — e não só com metas",
    "Confiança pra sustentar seu caminho mesmo em tempos complexos",
    "E o mais importante: tudo isso sem abandonar quem você é",
  ];

  return (
    <section className="py-14 bg-gradient-to-r from-lilas-mistico/10 to-verde-lavanda/10">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Título principal */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="font-atteron font-bold text-3xl md:text-4xl uppercase text-gray-700 mb-2">
            Quem vive o processo encontra
          </h2>
          <div className="w-20 h-1 bg-verde-lavanda mx-auto rounded-full" />
        </div>

        {/* Grid de cards mostarda */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {pontos.map((texto, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-6 bg-mostarda-quente/70 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <span className="text-white text-2xl flex-shrink-0">✓</span>
              <p className="font-montserrat text-gray-900 leading-relaxed">
                {texto}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeneficiosSection;
