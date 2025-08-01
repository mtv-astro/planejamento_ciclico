// src/hooks/useSectionObserver.ts

import { useEffect } from "react";
import { logEventGA } from "@/lib/analytics";

/**
 * Hook para rastrear quando o usuário visualiza uma seção (scroll)
 * e quanto tempo permanece nela.
 *
 * @param sectionId - O ID da seção HTML (ex: "beneficios")
 * @param eventLabel - Nome legível da seção para aparecer nos relatórios do GA
 * @param timeToStayMs - Tempo (em ms) para considerar que o usuário permaneceu (opcional)
 */
export function useSectionObserver(
  sectionId: string,
  eventLabel: string,
  timeToStayMs: number = 0
) {
  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    let timer: ReturnType<typeof setTimeout>;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          logEventGA("view_section", "Scroll", eventLabel);

          if (timeToStayMs > 0) {
            timer = setTimeout(() => {
              logEventGA(
                `stay_${timeToStayMs / 1000}s`,
                "SessionTime",
                eventLabel
              );
            }, timeToStayMs);
          }

          observer.unobserve(entry.target); // só dispara 1x
        } else {
          clearTimeout(timer);
        }
      },
      { threshold: 0.3 } // considera visto quando 30% da seção entra na viewport
    );

    observer.observe(section);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [sectionId, eventLabel, timeToStayMs]);
}
