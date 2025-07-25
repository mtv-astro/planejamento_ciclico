import { Button } from "@/components/ui/button";
import React from "react";

const HeroSection = () => {
  return (
    <section className="flex items-start lg:items-center relative overflow-hidden pt-10 lg:pt-0 bg-gradient-to-br from-offwhite-leve via-azul-suave/10 to-verde-lavanda/15">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 py-12 lg:py-20">
          {/* Coluna 1: Texto */}
          <div
            className="text-center lg:text-right animate-fade-in w-full max-w-[95vw] sm:max-w-xl mx-auto lg:mx-0"
            style={{ animationDelay: "0s" }}
          >
            <h1 className="font-atteron font-bold text-[1.6rem] sm:text-5xl md:text-6xl lg:text-4xl uppercase leading-snug sm:leading-tight mb-6 text-gray-800 break-words hyphens-auto">
              <span className="block font-bold">Ganhe coragem para realizar</span>
              <span className="text-mostarda-quente font-bold">
                seu servir autêntico
              </span>
              <br />
              <span className="font-bold">
                sem passar por cima dos seus valores.
              </span>
            </h1>

            <p className="text-center sm:text-right font-garamond text-[1.7rem] sm:text-[2rem] md:text-[1.5rem] italic text-gray-600 mb-4 leading-tight px-2 sm:px-0">
              <span className="text-verde-lavanda font-semibold">
                Organize o fluxo da sua vida
              </span>{" "}
              respeitando seu ritmo e encontre clareza usando{" "}
              <span className="text-verde-lavanda font-semibold">
                a astrologia na prática!
              </span>
            </p>

            {/* Badge de destaque */}
            <div className="inline-block bg-mostarda-quente/80 text-white px-4 py-2 rounded-full mb-8">
              <span className="font-bold">Aula ao vivo dia 05 de Agosto</span>
              <br />
              <span>Treinamento prático e <strong>GRATUÍTO.</strong></span>
            </div>

            {/* Botão com respiração suave */}
            <div className="flex justify-center sm:justify-end px-2 sm:px-0">
              <Button
                size="lg"
                onClick={() =>
                  window.open("https://chat.whatsapp.com/K2pUcUW2EIb9w3Q8YiUbMP?mode=ac_t", "_blank")
                }
                className={`
    max-w-xs mx-auto w-full px-4 py-5 text-[1.2rem]
    sm:w-fit sm:px-[2.5rem] sm:py-7 sm:text-2xl
    bg-verde-lavanda hover:bg-mostarda-quente/90
    text-white font-montserrat font-semibold
    rounded-full shadow-lg hover:shadow-xl
    animate-button-breath
    break-words text-center
  `}
              >
                QUERO PARTICIPAR
              </Button>
            </div>
          </div>

          {/* Coluna 2: Imagem */}
          <div
            className="relative flex justify-center items-center animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="relative w-full max-w-[375px] px-2 sm:px-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/img/hero.jpg"
                  alt="Mulher em contemplação na natureza conectada com seus ciclos"
                  className="w-full aspect-[3/4] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lilas-mistico/20 to-transparent z-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
