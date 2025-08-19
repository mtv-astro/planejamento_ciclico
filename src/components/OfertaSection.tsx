import React from "react";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

// Ícones inline SVG personalizados
const icons = [
  <svg key="quadrantes" viewBox="0 0 24 24" className="w-6 h-6 mt-1 text-lilas-mistico">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" />
  </svg>,
  <svg key="lua-crescente" viewBox="0 0 24 24" className="w-6 h-6 mt-1 text-lilas-mistico fill-current">
    <path d="M12 2a10 10 0 1 0 0 20c-4-2-4-6-4-10s2-8 6-10z" />
  </svg>,
  <svg key="lua-nova" viewBox="0 0 24 24" className="w-6 h-6 mt-1 text-verde-lavanda fill-current">
    <circle cx="12" cy="12" r="8" />
  </svg>,
  <svg key="lua-minguante" viewBox="0 0 24 24" className="w-6 h-6 mt-1 text-lilas-mistico fill-current">
    <path d="M12 2a10 10 0 1 1 0 20c4-2 4-6 4-10s-2-8-6-10z" />
  </svg>,
  <svg key="estrela-2" viewBox="0 0 24 24" className="w-6 h-6 mt-1 text-lilas-mistico fill-current">
    <path d="M12 3l2.09 6.26H21l-5.45 3.96L17.91 21 12 17.27 6.09 21l1.36-7.78L2 9.26h6.91z" />
  </svg>,
  <svg key="sol" viewBox="0 0 24 24" className="w-6 h-6 mt-1 text-mostarda-quente fill-current">
    <circle cx="12" cy="12" r="4" />
    <g stroke="currentColor" strokeWidth="1.5">
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.7" y1="4.7" x2="6.2" y2="6.2" />
      <line x1="17.8" y1="17.8" x2="19.3" y2="19.3" />
      <line x1="4.7" y1="19.3" x2="6.2" y2="17.8" />
      <line x1="17.8" y1="6.2" x2="19.3" y2="4.7" />
    </g>
  </svg>,
];

const entregas = [
  {
    titulo: "Método de Planejamento Cíclico",
    descricao: "Sistema vivo e intuitivo de organização, alinhado ao seu ritmo interno.",
    valor: "R$ 997,00",
  },
  {
    titulo: "Encontros de Lua Nova por 1 ano",
    descricao: "Renovação mensal de intenções com foco, presença e ancoragem simbólica.",
    valor: "R$ 997,00",
  },
  {
    titulo: "Guia completo no Notion",
    descricao: "Guia prático de Planejamento Cíclico totalmente estruturado no Notion.",
    valor: "R$ 197,00",
  },
  {
    titulo: "Mariah — Guardiã das 12 Casas",
    descricao: "Sua assistente IA de planejamento cíclico que ajuda a navegar pelos ciclos e acompanha nos estudos astrológicos.",
    valor: "R$ 247,00",
  },
  {
    titulo: "Workshop Ciclos de Vênus (gravada)",
    descricao: "Descubra os ciclos de Vênus e aprenda a dar valor para seu servir autêntico se posicionando com sua Vênus.",
    valor: "R$ 197,00",
  },
  {
    titulo: "Grupo de integração no WhatsApp",
    descricao: "Momentos abertos para troca e ativação cíclica. Com moderação e foco.",
    valor: "—",
  },
  {
    titulo: "Conteúdos cíclicos de acompanhamento",
    descricao: "Materiais de apoio para sustentar sua jornada com clareza e consistência.",
    valor: "—",
  },
  {
    titulo: "Bônus com convidadas",
    descricao: "Entradas prioritárias em conteúdos futuros, mentorias e experiências especiais.",
    valor: "—",
  },
];

const OfertaSection = () => {
  useSectionObserver("oferta", "OfertaSection", {
    timeToStayMs: 7000,
    trackScrollDepth: true,
    trackBounceOnExit: true,
  });

  return (
    <section id="oferta" className="py-24 bg-offwhite-leve">
      {/* antes: max-w-3xl, agora limitado a 1/3 da tela em desktop */}
      <div className="w-full md:w-2/4 mx-auto px-4">
        <div className="border-4 border-dashed border-lilas-mistico rounded-[2.5rem] p-1">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-gradient-to-b from-lilas-mistico/60 via-azul-suave/40 to-verde-lavanda/30 text-gray-800 rounded-[2.3rem] shadow-xl p-6 md:p-10 text-center"
          >
            <p className="font-garamond text-lg md:text-xl text-gray-800 mb-8 text-center">
              <strong>O valor total do que você vai receber<br />
                seria mais de R$ 2.000...</strong><br />
              mas não se preocupe,<br />
              entrando na comunidade voce tera acesso a:
            </p>

            {/* Entregas com ícones SVG decorativos inline */}
            <div className="text-left space-y-8 divide-y divide-dashed divide-lilas-mistico/60 mb-10">
              {entregas.map((item, index) => (
                <div
                  key={index}
                  className="pt-6 first:pt-0 flex flex-col items-center text-center"
                >
                  {/* Ícone + título na mesma linha */}
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {icons[index % icons.length]}
                    <h3 className="font-atteron text-lg md:text-xl text-gray-900">
                      <strong>{item.titulo}</strong>
                    </h3>
                  </div>

                  {/* Valor abaixo do título */}
                  {item.valor !== "—" && (
                    <p className="text-sm font-montserrat text-gray-600 mb-2">
                      <strong>
                        Valor: <span className="line-through text-red-500">{item.valor}</span>
                      </strong>
                    </p>
                  )}

                  {/* Descrição */}
                  <p className="font-garamond text-lg text-gray-700 leading-relaxed">
                    {item.descricao}
                  </p>
                </div>

              ))}
            </div>

            {/* Rodapé extra motivacional */}
            <div className="mt-12 text-center">
              <p className="font-garamond text-lg italic text-gray-800 mb-3">
                🌸 E mais... <br />
                <strong>Bônus da Primavera:</strong> <br />
                Imersão de Empreendedorismo Selvagem <br />
                + Encontro Presencial (Solstício de Verão)<br />
                + Workshop Ciclo de Vênus.
              </p>
              <p className="font-garamond text-lg text-gray-900 font-semibold">
                O tempo de viver com pressa e desconexão já passou. <br />
                Chegou a hora de honrar seus ritmos e servir com autenticidade.
              </p>
            </div>

            {/* Bloco final com preço e CTA */}
            <div className="mt-16 bg-[#ded1e3] py-6 px-6 md:px-10 rounded-3xl shadow-lg">
              <p className="text-lg line-through text-red-500 font-semibold">
                R$ 2.635,00
              </p>
              <p className="text-4xl md:text-5xl font-atteron text-gray-900 mt-1 mb-1 tracking-tight leading-none [font-variant-ligatures:none]">
                12x{" "}
                <span className="font-montserrat font-semibold align-baseline">
                  R$ 128,00
                </span>
              </p>
              <p className="text-sm font-medium text-gray-700">ou R$ 1200,00 à vista</p>
              <p className="text-sm font-medium text-gray-700">*Acesso por 1 ano</p>
              <div className="mt-2 flex justify-center items-center gap-2 text-sm text-gray-800">
                <ShieldCheck className="text-verde-lavanda" size={18} />
                Garantia de 30 dias
              </div>

              <button
                onClick={() =>
                  window.open("https://chk.eduzz.com/6W4VQX2O0Z", "_blank")
                }
                className="bg-verde-lavanda hover:bg-mostarda-quente text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-md mt-6"
              >
                Quero viver meu tempo com presença!
              </button>

              {/* Meios de pagamento atualizados */}
              <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
                {[
                  "visa",
                  "mastercard",
                  "pix",
                  "hiper",
                  "elo",
                  "amex",
                  "paypal",
                  "boleto",
                ].map((method) => (
                  <img
                    key={method}
                    src={`/img/payments/${method}.png`}
                    alt={method}
                    className="h-6 w-auto object-contain"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OfertaSection;
