import React from 'react';

const ComunidadeSection = () => {
  return (
    <section className="py-16 bg-offwhite-leve">
      <div className="container mx-auto px-6 lg:px-8">

        {/* Título da seção */}
        <h2 className="font-atteron font-bold text-3xl md:text-4xl uppercase text-gray-800 mb-12 text-center">
          O que é a Comunidade de{' '}
          <span className="[letter-spacing:0.01em]">Planejamento</span>{' '}
          <span className="[letter-spacing:0.03em]">Cíclico?</span>
        </h2>

        {/* Grid de imagem + conteúdo principal */}
        <div className="grid md:grid-cols-2 items-center animate-fade-in">
          {/* Imagem */}
          <div className="flex justify-center">
            <img
              src="/img/roda.jpg"
              alt="Mulher em momento reflexivo"
              className="rounded-3xl shadow-lg w-full max-w-sm md:max-w-md h-auto object-cover"
            />
          </div>

          {/* Card de texto */}
          <div className="bg-gradient-to-br from-lilas-mistico/50 to-azul-suave/50 rounded-3xl p-6 md:p-12 shadow-lg mt-6 md:mt-0">
            <p className="font-garamond italic font-bold text-xl md:text-2xl text-black leading-relaxed mb-6">
              Um <span className="font-bold">espaço vivo</span> de autoconhecimento, organização cíclica e astrologia prática criado para mulheres.
            </p>
            <p className="font-montserrat text-base md:text-xl text-black leading-relaxed">
              Aqui você vai encontrar o <span className="font-bold">Método de Planejamento Cíclico</span> e aprender a viver sua vida com mais
              <span className="font-bold"> direção</span>,
              <span className="font-bold"> leveza</span> e
              <span className="font-bold"> autenticidade</span>.
            </p>
          </div>
        </div>

        {/* Banner de oferta especial */}
        <div className="mt-10 bg-mostarda-quente/20 rounded-3xl p-6 md:p-8 text-center">
          <p className="font-montserrat italic text-base md:text-lg text-gray-800 leading-relaxed mb-6">
            <span className="font-bold">
              A condição especial da Comunidade será dia <strong>05 de agosto</strong> e apenas quem estiver no Grupo terá acesso
            </span>
            <br /> com bônus exclusivos para as primeiras inscritas e valores especiais.
          </p>
          <a
            href="#grupo-whatsapp"
            className="
                  /* Mobile first */
                  max-w-xs mx-auto w-full 
                  px-4 py-3 text-[1.2rem]

                  /* Telas ≥640px */
                  sm:w-fit sm:px-[2.5rem] sm:py-2 sm:text-2x1

                  bg-verde-lavanda hover:bg-mostarda-quente/90
                  text-white font-montserrat font-semibold
                  rounded-full shadow-lg hover:shadow-xl
                  transition-all duration-300 transform hover:scale-105
                  break-words text-center
                "
          >
            Quero entrar no grupo!
          </a>
        </div>

      </div>
    </section>
  );
};

export default ComunidadeSection;
