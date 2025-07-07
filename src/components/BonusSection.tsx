
const BonusSection = () => {
  const bonus = [
    {
      icon: "✨",
      title: "Workshop Ciclo de Vênus",
      subtitle: "(gravado)",
      description: "Entenda como usar os ciclos venusianos no seu planejamento"
    },
    {
      icon: "✨",
      title: "Imersão Empreendedorismo Selvagem",
      subtitle: "(ao vivo)",
      description: "Como criar um negócio autêntico e alinhado"
    },
    {
      icon: "📍",
      title: "Encontro presencial em Florianópolis",
      subtitle: "",
      description: "Conexão real com a comunidade em um ambiente mágico"
    }
  ];

  return (
    <section className="py-20 bg-offwhite-leve">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-atteron font-bold text-3xl md:text-4xl uppercase text-gray-800 mb-6">
            Bônus Especiais
          </h2>
          <div className="w-24 h-1 bg-lilas-mistico mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {bonus.map((item, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-mostarda-quente/10 to-azul-suave/10 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 animate-fade-in text-center"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-garamond italic font-bold text-xl text-gray-800 mb-2">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="font-garamond italic text-mostarda-quente mb-4 text-lg">
                    {item.subtitle}
                  </p>
                )}
                <p className="font-montserrat text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BonusSection;
