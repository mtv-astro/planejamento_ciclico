const BeneficiosSection = () => {
  const beneficios = [
    {
      title: "Clareza pra agir com propósito",
      description: "Descubra seu caminho único e tome decisões alinhadas",
    },
    {
      title: "Constância sem rigidez",
      description: "Crie rotinas que respeitam seus ciclos naturais",
    },
    {
      title: "Organização viva, leve e alinhada ao seu ciclo",
      description: "Um sistema que flui com você, não contra você",
    },
  ];

  return (
    <section className="py-14 bg-gradient-to-r from-lilas-mistico/10 to-verde-lavanda/10">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Título */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="font-atteron font-bold text-2xl md:text-4xl uppercase text-gray-700 mb-2">
            Benefícios
          </h2>
          <div className="w-20 h-1 bg-verde-lavanda mx-auto rounded-full"></div>
        </div>

        {/* Grid principal */}
        <div className="grid md:grid-cols-2 items-center max-w-6xl mx-auto">

          {/* Coluna dos Cards */}
          <div className="flex flex-col items-center gap-4">
            {beneficios.map((beneficio, index) => (
              <div
                key={index}
                className="bg-mostarda-quente/70 backdrop-blur-sm rounded-2xl px-10 py-6 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in w-[340px] text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="font-garamond italic font-bold text-md md:text-lg text-gray-800 mb-2">
                  {beneficio.title}
                </h3>
                <p className="font-montserrat text-sm text-gray-700 leading-relaxed">
                  {beneficio.description}
                </p>
              </div>
            ))}
          </div>

          {/* Coluna da Imagem */}
          <div className="flex justify-center">
            <img
              src="/public/img/leveza.jpg"
              alt="Mulher dançando"
              className="rounded-3xl w-full max-w-[400px] max-h-[500px] object-cover shadow-lg"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default BeneficiosSection;
