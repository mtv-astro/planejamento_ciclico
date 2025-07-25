import { Button } from "@/components/ui/button";

const ParaQuemSection = () => {
  const items = [
    {
      image: "/img/amp.png",
      text: "Sentem que estão sempre sobrecarregadas e confusas sobre o próximo passo",
    },
    {
      image: "/img/seg.png",
      text: "Querem consolidar um servir autêntico, mas se sentem sem foco ou constância",
    },
    {
      image: "/img/card33.png",
      text: "Já tentaram mil formas de se organizar, mas nenhuma respeita o seu ritmo",
    },
    {
      image: "/img/card5.png",
      text: "Desejam um caminho que una espiritualidade, clareza e estrutura para criar um servir autêntico",
    },
  ];

  return (
    <section className="pt-12 pb-16 bg-gradient-to-r from-verde-lavanda/5 to-azul-suave/5">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="font-atteron font-bold text-3xl md:text-4xl uppercase text-gray-800 mb-6">
            Este é um espaço para mulheres que
          </h2>
          <div className="w-24 h-1 bg-lilas-mistico mx-auto rounded-full"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item, index) => (
              <div
                key={index}
                className="text-center animate-fade-in bg-gradient-to-br from-lilas-mistico to-azul-suave rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden">
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-montserrat text-lg text-white leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Botão no final da seção */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <a
            href="#grupo-whatsapp"
            className="
                  /* Mobile first */
                  max-w-xs mx-auto w-full 
                  px-10 py-5 text-[1.2rem]

                  /* Telas ≥640px */
                  sm:w-fit sm:px-[2.5rem] sm:py-2 sm:text-2x1

                  bg-verde-lavanda hover:bg-mostarda-quente/90
                  text-white font-montserrat font-semibold
                  rounded-full shadow-lg hover:shadow-xl
                  transition-all duration-300 transform hover:scale-105
                  break-words text-center
                "
          >
            Quero fazer parte!
          </a>
        </div>
      </div>
    </section>
  );
};

export default ParaQuemSection;
