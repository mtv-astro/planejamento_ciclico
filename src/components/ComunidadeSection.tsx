import React from 'react';

const ComunidadeSection = () => {
  return (
    <section className="py-16 bg-offwhite-leve">
      <div className="container mx-auto px-6 lg:px-8">

        {/* Card com h2 com imagem ao fundo */}
        <div
          className="rounded-3xl overflow-hidden shadow-lg mb-12 text-center flex items-center justify-center h-[160px] md:h-[200px] lg:h-[240px] relative"
          style={{
            backgroundImage: "url('/img/roda-cerimonial.png')",
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center 40%', // apenas o terço central
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <h2 className="relative z-10 font-atteron font-bold text-3xl md:text-4xl uppercase text-white leading-snug px-4">
            O que é a Comunidade de{' '}
            <span className="[letter-spacing:0.01em]">Planejamento</span>{' '}
            <span className="[letter-spacing:0.03em]">Cíclico?</span>
          </h2>
        </div>

        {/* Grid ajustado: texto primeiro no mobile, imagem depois */}
        <div className="flex flex-col md:grid md:grid-cols-2 items-center gap-6 animate-fade-in">
          {/* Texto */}
          <div className="order-1 md:order-none bg-gradient-to-br from-lilas-mistico/50 to-azul-suave/50 rounded-3xl p-6 md:p-12 shadow-lg">
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

          {/* Imagem */}
          <div className="order-2 md:order-none flex justify-center">
            <img
              src="/img/roda.jpg"
              alt="Mulher em momento reflexivo"
              className="rounded-3xl shadow-lg w-full max-w-sm md:max-w-md h-auto object-cover"
            />
          </div>
        </div>

        {/* Banner de oferta especial */}
        <div className="mt-10 bg-mostarda-quente/20 rounded-3xl p-6 md:p-8 text-center">
          <p className="font-montserrat italic text-base md:text-lg text-gray-800 leading-relaxed mb-6">
            <span className="font-bold">
              A condição especial da Comunidade será dia <strong>06 de agosto</strong> e apenas quem estiver no Grupo terá acesso
            </span>
            <br /> com bônus exclusivos para as primeiras inscritas e valores especiais.
          </p>
          <button
            onClick={() =>
              window.open("https://chat.whatsapp.com/K2pUcUW2EIb9w3Q8YiUbMP?mode=ac_t", "_blank")
            }
            className="
              inline-block
              max-w-xs mx-auto w-full
              px-4 py-2
              sm:w-fit sm:px-6 sm:py-2
              bg-verde-lavanda hover:bg-mostarda-quente/90
              text-white font-montserrat font-semibold
              rounded-full shadow-lg hover:shadow-xl
              animate-button-breath
              text-base sm:text-lg
              text-center whitespace-nowrap
            "
          >
            Quero entrar no grupo!
          </button>
        </div>

      </div>
    </section>
  );
};

export default ComunidadeSection;
