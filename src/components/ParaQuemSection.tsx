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

  const gradients = [
    "from-lilas-mistico/80 to-azul-suave/80",
    "from-azul-suave/80 to-lilas-mistico/90",
    "from-lilas-mistico/80 to-azul-suave/80",
    "from-azul-suave/80 to-lilas-mistico/90",
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
                className={`text-center animate-fade-in bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}
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
          <button
            onClick={() =>
              window.open("https://chat.whatsapp.com/K2pUcUW2EIb9w3Q8YiUbMP?mode=ac_t", "_blank")
            }
            className="
  inline-block
  mx-auto w-full sm:w-fit
  px-6 py-3 sm:px-10 sm:py-3
  text-lg sm:text-2xl
  bg-verde-lavanda hover:bg-mostarda-quente/90
  text-white font-montserrat font-bold
  rounded-full shadow-lg hover:shadow-2xl
  animate-button-breath
  text-center whitespace-nowrap
"
          >
            Quero fazer parte!
          </button>
        </div>
      </div>
    </section>
  );
};

export default ParaQuemSection;
