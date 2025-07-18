import { Button } from "@/components/ui/button";
import React from "react";

const RecebeSection = () => {
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
        "Aberto nas Luas Nova e Cheia para trocas, dúvidas e ativações — sem excesso, com presença.",
    },
    {
      title: "Guia de Planejamento Cíclico no Notion",
      description:
        "Completo, editável e simbólico. Um mapa prático pra acompanhar seus ciclos e alinhar ação com intenção.",
    },
    {
      title: "Estratégias pra construir um servir autêntico",
      description:
        "Com coragem, direção e intuição — mesmo com a rotina de quem empreende, cuida e sente o mundo.",
    },
    {
      title: "Workshop Ciclo de Vênus (gravado)",
      description: "",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-offwhite-leve/25 to-offwhite-leve/25">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="[letter-spacing:0.03em] font-atteron font-bold text-2xl md:text-3xl uppercase text-gray-800 mb-4">
            Fazendo parte você recebe
          </h2>
          <div className="w-20 h-1 bg-mostarda-quente mx-auto rounded-full"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Flex wrap para centralizar sempre a última linha */}
          <div className="flex flex-wrap justify-center gap-6">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="w-[280px] bg-gradient-to-br from-lilas-mistico/30 to-azul-suave/30 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in text-center"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
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
          <Button
            size="lg"
            className="bg-gradient-to-r from-verde-lavanda to-azul-suave hover:from-mostarda-quente/90 hover:to-azul-suave/90 text-white font-montserrat font-bold px-10 py-5 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto max-w-md"
          >
            Quero viver meu tempo com presença
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecebeSection;
