const ComunidadeSection = () => {
  return (
    <section className="py-20 bg-offwhite-leve">
      <div className="container mx-auto px-6 lg:px-8">

        {/* Título da seção */}
        <h2 className="font-atteron font-bold text-4xl md:text-5xl uppercase text-gray-800 mb-16 text-center">
          O que é a Comunidade?
        </h2>

        {/* Grid de imagem + conteúdo */}
        <div className="grid md:grid-cols-2 gap-12 items-center animate-fade-in">
          
          {/* Imagem à esquerda */}
          <div className="flex justify-center">
            <img
              src="/public/img/roda.jpg"
              alt="Mulher em momento reflexivo"
              className="rounded-3xl shadow-lg max-w-full h-auto object-cover"
            />
          </div>

          {/* Bloco de texto à direita */}
          <div className="bg-gradient-to-br from-lilas-mistico/50 to-azul-suave/50 rounded-3xl p-8 md:p-12 shadow-lg">
            <p className="font-garamond italic font-bold text-xl md:text-2xl text-gray-700 leading-relaxed mb-6">
              Um <span className="italic font-medium text-lilas-mistico">espaço vivo</span> de autoconhecimento, organização cíclica e astrologia prática criado para mulheres.
            </p>

            <p className="font-montserrat text-lg text-gray-600 leading-relaxed">
              Aqui você vai encontrar o método do <span className="font-semibold text-lilas-mistico">Planejamento Cíclico</span> e descobrir como viver sua vida com mais 
              <span className="italic font-medium text-verde-lavanda"> direção</span>, 
              <span className="italic font-medium text-azul-suave"> leveza</span> e 
              <span className="italic font-medium text-mostarda-quente"> verdade</span>.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ComunidadeSection;
