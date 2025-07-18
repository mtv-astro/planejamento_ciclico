import { Button } from "@/components/ui/button";

const FinalSection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-azul-suave/10 via-lilas-mistico/10 to-verde-lavanda/10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-16 left-20 w-40 h-40 rounded-full bg-mostarda-quente animate-float"></div>
        <div
          className="absolute bottom-20 right-24 w-32 h-32 rounded-full bg-azul-suave animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-lilas-mistico animate-float"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="font-atteron font-bold text-4xl md:text-5xl lg:text-6xl text-gray-800 mb-8 leading-tight">
            Se você sente que é o momento de alinhar sua vida com seu ciclo,{" "}
            <span className="text-verde-lavanda"><br></br>essa comunidade é pra você.</span>
          </h2>

          <p className="font-garamond italic font-bold text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
            O tempo de viver com pressa e desconexão já passou.
            Chegou a hora de honrar seus ritmos e servir com autenticidade.
          </p>

          {/* BOTÃO RESPONSIVO */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="w-full flex justify-center">
              <Button
                size="lg"
                className="w-full max-w-md sm:max-w-lg md:max-w-xl
                  bg-gradient-to-r from-verde-lavanda to-azul-suave 
                  hover:from-mostarda-quente/90 hover:to-azul-suave/90 
                  text-white font-montserrat font-bold 
                  px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 
                  rounded-full text-base sm:text-lg md:text-xl 
                  shadow-2xl hover:shadow-3xl 
                  transition-all duration-300 transform hover:scale-105"
              >
                Quero viver meu tempo com presença
              </Button>

            </div>
          </div>

          <div className="mt-12 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <p className="font-garamond italic text-lg text-gray-500">
              A próxima lunação te espera ✨
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalSection;
