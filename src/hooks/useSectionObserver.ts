import { useEffect } from "react";
import { logEventGA } from "@/lib/analytics";

type SectionObserverOptions = {
  trackView?: boolean;
  timeToStayMs?: number;
  trackScrollDepth?: boolean;
  trackBounceOnExit?: boolean;
};

export function useSectionObserver(
  sectionId: string,
  eventLabel: string,
  options: SectionObserverOptions = {}
) {
  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    let timer: ReturnType<typeof setTimeout>;
    let engaged = false;

    const {
      trackView = true,
      timeToStayMs = 0,
      trackScrollDepth = false,
      trackBounceOnExit = false,
    } = options;

    // ✅ onScroll sempre definido
    const onScroll = () => {
      const scrollTop = window.scrollY + window.innerHeight;
      const totalHeight = document.body.scrollHeight;
      const depth = Math.round((scrollTop / totalHeight) * 100);

      if (depth >= 80) {
        logEventGA("scroll_depth", "Scroll", "Reached 80%");
        window.removeEventListener("scroll", onScroll); // dispara uma vez
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (trackView) {
            logEventGA("view_section", "Scroll", eventLabel);
          }

          if (timeToStayMs > 0) {
            timer = setTimeout(() => {
              engaged = true;
              logEventGA(`stay_${timeToStayMs / 1000}s`, "SessionTime", eventLabel);
            }, timeToStayMs);
          }

          observer.unobserve(entry.target);
        } else {
          clearTimeout(timer);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(section);

    if (trackScrollDepth) {
      window.addEventListener("scroll", onScroll);
    }

    const handleExit = () => {
      if (!engaged && trackBounceOnExit) {
        logEventGA("bounce_from_section", "Bounce", eventLabel);
      }
    };

    if (trackBounceOnExit) {
      window.addEventListener("beforeunload", handleExit);
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      if (trackScrollDepth) window.removeEventListener("scroll", onScroll);
      if (trackBounceOnExit) window.removeEventListener("beforeunload", handleExit);
    };
  }, [sectionId, eventLabel, options]);
}
