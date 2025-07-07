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

const Index = () => {
  return (
    <div className="min-h-screen bg-offwhite-leve">
      <HeroSection />
      <ParaQuemSection />
      <ComunidadeSection />
      <RecebeSection />
      <BeneficiosSection />
      <BonusSection />
      <InvestimentoSection />
      <DepoimentosSection />
      <SobreMimSection />
      <FinalSection />
    </div>
  );
};

export default Index;
