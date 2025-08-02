import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSectionObserver } from "@/hooks/useSectionObserver";

const depoimentos = [
  {
    text: "Me trouxe autoconfiança e muita vontade de continuar crescendo. Me fez acreditar novamente, após o puerpério. Estava confusa, sem força, com muitos medos e você me ajudou a organizar tudo o que estava no meu coração, me deu força para seguir com estrutura e estratégia.",
    author: "Ana Paula Linhares",
  },
  {
    text: "Antes eu ia tendo ideias e ia agindo no impulso, com medo se o resultado seria bom ou se as pessoas iriam valorizar. Agora eu planejo, manifesto e coloco em prática com clareza e certeza de que quem estiver na mesma sintonia e aberta para receber o meu servir irá chegar. Saí da escassez para a abundância e do medo para a confiança.",
    author: "Maíra Sa",
  },
  {
    text: "A cada lunação tenho recebido insights preciosos que estão me ajudando a construir essa jornada. Parece que ganho um bloquinho de tijolo pra construir essa versão cada vez mais alinhada à minha essência.",
    author: "Lohanna Tanajura",
  },
  {
    text: "Hoje, olhando para a minha rotina e meus projetos, o que encontro de mais valioso é a coragem de caminhar com verdade, mesmo diante dos medos. A clareza que ganhei ao viver mais conectada aos ciclos permitiu que eu dissesse 'sim' às oportunidades certas. Ganhei presença para estar com o meu filho, para servir através dos atendimentos espirituais e para plantar, com consciência, a Comunidade Raiz. Sinto que estou a colher frutos muito reais: autonomia, direção e um sentido profundo de missão.",
    author: "Maria Elisa",
  },
  {
    text: "Sinto que estou saindo do amadorismo e me direcionando ao profissionalismo. O planejamento me ajudou a me ver de verdade, e a partir desse reconhecimento, dar passos mais firmes e sólidos no sentido do de-vir. Antes eu me sentia perdida em meio a tantos conteúdos, e com isso, desperdiçava totalmente o meu maior talento. Antes, eu entregava tudo de graça, agora estou aprendendo a verdadeiramente me valorizar e magnetizar quem me valoriza.",
    author: "Mariana Paz",
  },
  {
    text: "Hoje aprendi que a estratégia mais sábia é ir no tempo certo. Ganhei presença e coragem para fazer no meu ritmo! Não me cobro tanto e tudo flui melhor.",
    author: "Larissa Sampaio",
  },
  {
    text: "Aprendi a ter mais calma, consciência, e agora consigo agir apesar do medo. Faço com menos cobrança ou expectativa. Aprendi a planejar de forma mais amorosa, respeitando tempos e limites.",
    author: "Paula Mazini",
  },
  {
    text: "Aprendi que consigo ser uma pessoa organizada e focada, que posso traçar uma rota com objetivos claros e seguir sem me perder. Tenho materializado muitas pequenas e grandes coisas.",
    author: "Xiomara Secondi",
  },
];

const gradients = [
  "from-lilas-mistico/80 to-azul-suave/80",
  "from-azul-suave/80 to-lilas-mistico/90",
  "from-lilas-mistico/80 to-azul-suave/80",
  "from-azul-suave/80 to-lilas-mistico/90",
];

const DepoimentosSection = () => {
  useSectionObserver("depoimentos", "DepoimentosSection", {
    timeToStayMs: 8000,
    trackScrollDepth: true,
    trackBounceOnExit: true,
  });

  const [index, setIndex] = useState(0);
  const safeIndex = Number.isFinite(index)
    ? (index + depoimentos.length) % depoimentos.length
    : 0;

  const depoimento = depoimentos[safeIndex];
  const gradient = gradients[safeIndex % gradients.length];

  const next = () =>
    setIndex((i) => (i + 1 + depoimentos.length) % depoimentos.length);
  const prev = () =>
    setIndex((i) => (i - 1 + depoimentos.length) % depoimentos.length);

  return (
    <section
      id="depoimentos"
      className="py-20 bg-gradient-to-r from-lilas-mistico/5 to-mostarda-quente/5"
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-atteron font-bold text-3xl md:text-4xl uppercase text-gray-800 mb-6">
            O que elas dizem
          </h2>
          <div className="w-24 h-1 bg-lilas-mistico mx-auto rounded-full" />
        </div>

        <div className="relative max-w-3xl mx-auto flex items-center justify-center">
          {/* Botão Esquerdo */}
          <button
            onClick={prev}
            className="absolute left-0 p-2 rounded-full bg-white/70 hover:bg-white text-lilas-mistico shadow-md"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Card com animação */}
          <div className="w-full px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={depoimento.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`rounded-3xl border border-lilas-mistico/40 p-6 sm:p-8 shadow-lg text-center bg-gradient-to-br ${gradient}`}
              >
                <p className="font-montserrat text-base md:text-lg text-gray-800 leading-relaxed italic">
                  <span className="text-lilas-mistico text-3xl mr-1 align-top">“</span>
                  {depoimento.text}
                  <span className="text-lilas-mistico text-3xl ml-1 align-bottom">”</span>
                </p>
                <p className="font-garamond italic font-bold text-gray-800 text-right mt-4">
                  — {depoimento.author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Botão Direito */}
          <button
            onClick={next}
            className="absolute right-0 p-2 rounded-full bg-white/70 hover:bg-white text-lilas-mistico shadow-md"
            aria-label="Próximo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default DepoimentosSection;
