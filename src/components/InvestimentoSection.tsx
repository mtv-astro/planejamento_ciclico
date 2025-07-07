import { Button } from "@/components/ui/button";

const InvestimentoSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-verde-lavanda/10 via-azul-suave/5 to-lilas-mistico/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-atteron font-bold text-3xl md:text-4xl uppercase text-gray-800 mb-6">
            Investimento
          </h2>
          <div className="w-24 h-1 bg-azul-suave mx-auto rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Opção 1 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in border border-mostarda-quente/20 w-full max-w-full break-words">
              <div className="text-center mb-6">
                <h3 className="font-garamond italic font-bold text-xl sm:text-2xl text-gray-800 mb-4 break-words">
                  Acesso até o fim do ano astrológico
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  <span className="text-base sm:text-lg text-gray-400 line-through font-montserrat">
                    R$ 1.080
                  </span>
                  <span className="text-2xl sm:text-4xl font-montserrat font-bold text-mostarda-quente break-words max-w-full">
                    R$ 880
                  </span>
                </div>
                <p className="font-montserrat text-sm text-gray-600">
                  Economia de R$ 200
                </p>
              </div>

              <Button
                size="lg"
                className="w-full bg-mostarda-quente hover:bg-mostarda-quente/90 text-white font-montserrat font-semibold py-3 px-4 rounded-full text-base shadow-lg hover:shadow-xl transition-all duration-300 mx-auto block"
              >
                Quero aplicar para a próxima lunação
              </Button>
            </div>

            {/* Opção 2 */}
            <div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in w-full max-w-full break-words"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-center mb-6">
                <h3 className="font-garamond italic font-bold text-xl sm:text-2xl text-gray-800 mb-4 break-words">
                  Acesso por 3 meses
                </h3>
                <div className="mb-4">
                  <span className="text-2xl sm:text-4xl font-montserrat font-bold text-azul-suave break-words max-w-full">
                    R$ 497
                  </span>
                </div>
                <p className="font-montserrat text-sm text-gray-600">
                  Ideal para experimentar
                </p>
              </div>

              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-azul-suave text-azul-suave hover:bg-azul-suave hover:text-white font-montserrat font-semibold py-3 px-4 rounded-full text-base transition-all duration-300 mx-auto block"
              >
                Começar agora
              </Button>
            </div>
          </div>

          {/* Garantia */}
          <div
            className="text-center mt-12 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="inline-flex items-center gap-2 bg-verde-lavanda/20 rounded-full px-6 py-3">
              <span className="text-2xl">✅</span>
              <span className="font-montserrat font-semibold text-gray-800">
                Garantia de 7 dias
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestimentoSection;
