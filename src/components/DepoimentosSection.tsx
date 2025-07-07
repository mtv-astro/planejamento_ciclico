
const DepoimentosSection = () => {
  const depoimentos = [
    {
      text: "Hoje eu planejo com mais calma, sem culpa por não dar conta de tudo.",
      author: "Marina S."
    },
    {
      text: "A clareza sobre minha Casa 10 me deu direção pra sair do limbo.",
      author: "Fernanda L."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-lilas-mistico/5 to-mostarda-quente/5">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-atteron font-bold text-3xl md:text-4xl uppercase text-gray-800 mb-6">
            O que elas dizem
          </h2>
          <div className="w-24 h-1 bg-lilas-mistico mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {depoimentos.map((depoimento, index) => (
              <div 
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-6xl text-lilas-mistico/30 font-garamond leading-none mb-4">"</div>
                <p className="font-montserrat text-lg md:text-xl text-gray-700 leading-relaxed mb-6 italic">
                  {depoimento.text}
                </p>
                <p className="font-garamond italic font-bold text-gray-800">
                  — {depoimento.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DepoimentosSection;
