import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSectionObserver } from "@/hooks/useSectionObserver"; // ✅ novo

const depoimentos = [
  {
    text: "Me trouxe autoconfiança e muita vontade de continuar crescendo. Me fez acreditar novamente, após o puerpério...",
    author: "Ana Paula Linhares",
  },
  {
    text: "Antes eu ia tendo ideias e ia agindo no impulso...",
    author: "Maíra",
  },
  {
    text: "A cada lunação tenho recebido insights preciosos...",
    author: "Lohanna",
  },
  {
    text: 'Hoje, olhando para a minha rotina e meus projetos, o que encontro de mais valioso é a coragem de caminhar com verdade...',
    author: "Maria Elisa",
  },
  {
    text: "Sinto que estou saindo do amadorismo e me direcionando ao profissionalismo...",
    author: "Mariana Paz",
  },
  {
    text: "Hoje aprendi que a estratégia mais sábia é ir no tempo certo...",
    author: "Larissa",
  },
  {
    text: "Aprendi a ter mais calma, consciência, e agora consigo agir apesar do medo...",
    author: "Paula",
  },
  {
    text: "Aprendi que consigo ser uma pessoa organizada e focada...",
    author: "Xio",
  },
];

const gradients = [
  "from-lilas-mistico/80 to-azul-suave/80",
  "from-azul-suave/80 to-lilas-mistico/90",
  "from-lilas-mistico/80 to-azul-suave/80",
  "from-azul-suave/80 to-lilas-mistico/90",
];

const DepoimentosSection = () => {
  // ✅ Tracking da seção
  useSectionObserver("depoimentos", "DepoimentosSection", {
    timeToStayMs: 8000,
    trackScrollDepth: true,
    trackBounceOnExit: true,
  });

  const [index, setIndex] = useState(0);
  const depoimento = depoimentos[index % depoimentos.length];
  const gradient = gradients[index % gradients.length];

  const next = () => setIndex((i) => (i + 1) % depoimentos.length);
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
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`rounded-3xl border border-lilas-mistico/40 p-6 sm:p-8 shadow-lg text-center bg-gradient-to-br ${gradient}`}
              >
                <p className="font-montserrat text-base md:text-lg text-gray-700 leading-relaxed italic mb-6">
                  <span className="text-4xl text-lilas-mistico/50 align-top leading-none mr-1">
                    &ldquo;
                  </span>
                  {depoimento.text}
                  <span className="text-4xl text-lilas-mistico/50 align-bottom leading-none ml-1">
                    &rdquo;
                  </span>
                </p>
                <p className="font-garamond italic font-bold text-gray-800 text-right">
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
