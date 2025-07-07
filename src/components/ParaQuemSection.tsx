import { Button } from "@/components/ui/button";

const ParaQuemSection = () => {
  const items = [
    {
      image: "/img/mao3.png",
      text: "Para quem está sempre sobrecarregada e confusa sobre o próximo passo",
    },
    {
      image: "/img/mao3.png",
      text: "Para quem quer consolidar um servir autêntico, mas se sente sem foco ou constância",
    },
    {
      image: "/img/mao3.png",
      text: "Para quem já tentou mil formas de se organizar, mas nenhuma respeita o seu ritmo",
    },
    {
      image: "/img/mao3.png",
      text: "Se você deseja um caminho que una espiritualidade, clareza e estrutura para criar um servir autêntico",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-verde-lavanda/5 to-azul-suave/5">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-atteron font-bold text-3xl md:text-4xl uppercase text-gray-800 mb-6">
            Para quem é ?
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
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-mostarda-quente to-azul-suave hover:from-mostarda-quente/90 hover:to-azul-suave/90 text-white font-montserrat font-bold px-10 py-5 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto max-w-md"
          >
            Quero viver meu tempo com presença
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ParaQuemSection;
