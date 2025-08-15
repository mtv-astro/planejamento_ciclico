import HeroSection from "@/components/HeroSection";
import ParaQuemSection from "@/components/ParaQuemSection";
import ComunidadeSection from "@/components/ComunidadeSection";
import RecebeSection from "@/components/RecebeSection";
import BeneficiosSection from "@/components/BeneficiosSection";
import BonusSection from "@/components/BonusSection";
import InvestimentoSection from "@/components/InvestimentoSection";
import DepoimentosSection from "@/components/DepoimentosSection";
import SobreMimSection from "@/components/SobreMimSection";
import FinalSection from "@/components/FinalSection";
import OfertaSection from "@/components/OfertaSection";


const Index = () => {
  return (
    <div className="min-h-screen bg-offwhite-leve">
      <HeroSection />
      <ComunidadeSection />
      <ParaQuemSection />
      <RecebeSection />
      <BeneficiosSection />
      <DepoimentosSection />
      <SobreMimSection />
      <FinalSection />
      <OfertaSection />
    </div>
  );
};

export default Index;
