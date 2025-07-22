import React from "react";

const depoimentos = [
  {
    text: "Ganhei coragem de me colocar com verdade diante da vida. Hoje estou mais firme pra trilhar o meu caminho.",
    author: "Mariana Ferrão"
  },
  {
    text: "Presença e coragem de fazer no meu ritmo! Não me cobro tanto e tudo flui melhor.",
    author: "Larissa Sampaio"
  },
  {
    text: "Meu centramento, meu eixo. Clareza, confiança no processo e hábitos saudáveis em qualquer lugar.",
    author: "Paula"
  },
  {
    text: "A coragem para me colocar a servir de uma forma mais verdadeira. Com foco e passo a passo.",
    author: "Xiomara"
  },
  {
    text: "Auto confiança, foco, colheitas prósperas bem alinhadas. Estou mais conectada com meus ciclos.",
    author: "Maíra"
  },
  {
    text: "Amadurecimento. Sinto que estou saindo de uma mentalidade vitimista e encontrando minha coragem.",
    author: "Lohanna"
  },
  {
    text: "A escuta dos meus ciclos me deu suavidade e maturidade pra fazer escolhas com consciência.",
    author: "Maria Elisa"
  }
];

const DepoimentosSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-lilas-mistico/5 to-mostarda-quente/5">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-atteron font-bold text-3xl md:text-4xl uppercase text-gray-800 mb-6">
            O que elas dizem
          </h2>
          <div className="w-24 h-1 bg-lilas-mistico mx-auto rounded-full"></div>
        </div>

        <div className="overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex space-x-6 snap-x snap-mandatory">
            {Array(10).fill(depoimentos).flat().map((depoimento, index) => (
              <div
                key={index}
                className="snap-start bg-gradient-to-br from-azul-suave/30 to-lilas-mistico/30 border border-lilas-mistico/40 rounded-3xl p-4 sm:p-6 w-[85%] md:w-[400px] lg:max-w-sm shadow-md shadow-lilas-mistico/30 flex-shrink-0 whitespace-normal"
              >
                <p className="font-montserrat text-base md:text-lg text-gray-700 leading-relaxed mb-4 italic whitespace-normal break-words">
                  <span className="text-4xl text-lilas-mistico/50 align-top leading-none mr-1">&ldquo;</span>
                  {depoimento.text}
                  <span className="text-4xl text-lilas-mistico/50 align-bottom leading-none ml-1">&rdquo;</span>
                </p>
                <p className="font-garamond italic font-bold text-gray-800 text-right">
                  — {depoimento.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DepoimentosSection;
