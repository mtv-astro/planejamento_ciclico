import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-offwhite-leve via-azul-suave/10 to-verde-lavanda/15">
      {/* Bolinhas de fundo decorativas (visíveis apenas no desktop, com opacidades diferentes) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Bolinhas atrás do texto */}
        <div className="hidden sm:block absolute top-20 left-10 w-32 h-32 rounded-full bg-lilas-mistico opacity-15 animate-float"></div>
        <div
          className="hidden sm:block absolute bottom-32 right-16 w-24 h-24 rounded-full bg-mostarda-quente opacity-15 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="hidden sm:block absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-verde-lavanda opacity-15 animate-float"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10 pt-18 sm:pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
          {/* Texto */}
          <div className="text-center lg:text-right animate-fade-in w-full max-w-[95vw] sm:max-w-xl mx-auto lg:mx-0 break-words hyphens-auto">
            <h1 className="font-atteron text-[1.3rem] sm:text-4xl md:text-5xl lg:text-4xl uppercase leading-snug sm:leading-tight mb-6 text-gray-800 break-words hyphens-auto">
              <span className="block">Ganhe coragem para realizar</span>
              <span className="text-mostarda-quente">seu servir autêntico</span>
              <br />
              <span>sem passar por cima dos seus valores.</span>
            </h1>

            <p className="text-center sm:text-right font-garamond text-base sm:text-xl md:text-2xl italic text-gray-600 mb-8 leading-relaxed px-2 sm:px-0">
              <span className="text-verde-lavanda font-semibold">
                Organize o fluxo da sua vida
              </span>{" "}
              respeitando seu ritmo e <br />
              encontre clareza usando
              <span className="text-verde-lavanda font-semibold"> a astrologia na prática!</span>
            </p>

            <div className="flex justify-center sm:justify-end px-2 sm:px-0">
              <Button
                size="lg"
                className="bg-verde-lavanda hover:bg-mostarda-quente/90 text-white font-montserrat font-semibold px-10 py-5 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-[90vw] sm:max-w-fit"
              >
                Quero entrar para a próxima lunação
              </Button>
            </div>

          </div>

          {/* Imagem com bolinhas externas nos cantos */}
          <div className="relative flex justify-center items-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative w-full max-w-[375px] px-2 sm:px-0">
              {/* Bolinha canto superior esquerdo da imagem */}
              <div
                className="hidden sm:block absolute -top-3 -left-3 w-12 h-12 bg-verde-lavanda rounded-full opacity-60 animate-float z-20"
                style={{ animationDelay: "1s" }}
              ></div>

              {/* Bolinha canto inferior direito da imagem */}
              <div
                className="hidden sm:block absolute -bottom-4 -right-3 w-12 h-12 bg-azul-suave rounded-full opacity-60 animate-float z-20"
                style={{ animationDelay: "1.4s" }}
              ></div>

              {/* Bolinha do lado da imagem (meio) */}
              <div
                className="hidden sm:block absolute top-1/2 left-0 w-10 h-10 bg-mostarda-quente rounded-full opacity-50 animate-float z-10"
                style={{ animationDelay: "0.8s" }}
              ></div>

              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/img/hero.jpg"
                  alt="Mulher em contemplação na natureza conectada com seus ciclos"
                  className="w-full aspect-[3/4] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lilas-mistico/20 to-transparent z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
