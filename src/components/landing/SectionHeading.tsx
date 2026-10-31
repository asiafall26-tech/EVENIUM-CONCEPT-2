import Reveal from "./Reveal";
import { Fleuron, DiamondRule } from "./LuxOrnaments";

/** Shared section header: gold fleuron, eyebrow, Playfair title, diamond rule, optional lead. */
export default function SectionHeading({
  eyebrow,
  title,
  lead,
  dark,
  className = "mb-16",
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={`text-center max-w-3xl mx-auto ${className}`}>
      <Fleuron className="mx-auto w-40 md:w-48 h-auto mb-3" />
      <p className={`pl-[0.35em] text-[11px] md:text-xs font-medium tracking-[0.35em] uppercase mb-5 ${dark ? "text-[#e7c97f]" : "text-[#8f6f33]"}`}>
        {eyebrow}
      </p>
      <h2 className={`font-serif not-italic text-3xl md:text-5xl leading-tight ${dark ? "text-[#fbf3e4]" : "text-[#1d120a]"}`}>{title}</h2>
      <DiamondRule className="mt-6" />
      {lead && <p className={`mt-5 text-lg leading-relaxed ${dark ? "text-white/70" : "text-[#3d3126]"}`}>{lead}</p>}
    </Reveal>
  );
}
