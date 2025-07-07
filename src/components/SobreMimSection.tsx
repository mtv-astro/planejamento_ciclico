
const SobreMimSection = () => {
  return (
    <section className="py-20 bg-offwhite-leve">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative animate-fade-in">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/public/img/linda.jpg" 
                  alt="Astróloga trabalhando com mapas astrológicos"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-azul-suave/20 to-transparent"></div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-verde-lavanda rounded-full opacity-70 animate-float"></div>
              <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-lilas-mistico rounded-full opacity-60 animate-float" style={{ animationDelay: '1s' }}></div>
            </div>
            
            {/* Content */}
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h2 className="font-atteron font-bold text-3xl md:text-4xl uppercase text-gray-800 mb-6">
                Sobre mim
              </h2>
              
              <div className="space-y-6">
                <p className="font-garamond italic font-bold text-lg text-gray-700 leading-relaxed">
                  <span className="text-xl text-mostarda-quente">Astróloga, guia cíclica e criadora do Método Planejamento Cíclico.</span>
                </p>
                
                <p className="font-montserrat text-lg text-gray-700 leading-relaxed">
                  Há anos acompanho mulheres na jornada de descobrir seu propósito autêntico, 
                  combinando a sabedoria ancestral da astrologia com ferramentas práticas de organização.
                </p>
                
                <p className="font-montserrat text-lg text-gray-700 leading-relaxed">
                  Acredito que cada uma de nós tem um <span className="italic text-lilas-mistico">servir único</span> no mundo, 
                  e minha missão é ajudar você a encontrar e viver essa verdade com coragem e leveza.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SobreMimSection;
