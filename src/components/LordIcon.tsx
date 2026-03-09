"use client";

import { useEffect, useRef } from "react";

interface LordIconProps {
  src: string;
  trigger?: string;
  size?: number;
  colors?: string;
  className?: string;
}

// Lordicon icons we use across Phylaxone:
// Shield/Security: https://cdn.lordicon.com/xzalkbkz.json (shield)
// Lock: https://cdn.lordicon.com/prjooket.json
// Search/Scan: https://cdn.lordicon.com/kkvxgpti.json
// Warning: https://cdn.lordicon.com/usownftb.json
// User/Identity: https://cdn.lordicon.com/dxjqoygy.json
// Network: https://cdn.lordicon.com/ofwpzftr.json
// Chart: https://cdn.lordicon.com/fhtaantg.json
// Check/Success: https://cdn.lordicon.com/oqdnkfpf.json
// Eye/Monitor: https://cdn.lordicon.com/lupuorrc.json
// Globe: https://cdn.lordicon.com/jmkrnisz.json
// Fingerprint: https://cdn.lordicon.com/fpmskzsv.json
// Building: https://cdn.lordicon.com/qhkvfxpn.json

export default function LordIcon({ src, trigger = "hover", size = 48, colors, className }: LordIconProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load lordicon element script once
    if (typeof window !== "undefined" && !document.querySelector('script[src*="lordicon"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.lordicon.com/lordicon.js";
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = document.createElement("lord-icon") as HTMLElement;
    el.setAttribute("src", src);
    el.setAttribute("trigger", trigger);
    el.setAttribute("colors", colors || "primary:#e84393,secondary:#8b5cf6");
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(el);
  }, [src, trigger, colors, size]);

  return <div ref={containerRef} className={className} style={{ width: size, height: size }} />;
}
