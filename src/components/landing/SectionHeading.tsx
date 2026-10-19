import Reveal from "./Reveal";

/** Shared section header: gold eyebrow between rules, serif title, optional lead. */
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
      <p className="inline-flex items-center gap-3 text-accent text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mb-5">
        <span className="w-8 h-px bg-accent" /> {eyebrow} <span className="w-8 h-px bg-accent" />
      </p>
      <h2 className={`font-serif text-3xl md:text-5xl leading-tight ${dark ? "text-white" : "text-primary"}`}>{title}</h2>
      <div className="ornament mt-6" aria-hidden="true">✦</div>
      {lead && <p className={`mt-5 text-lg leading-relaxed ${dark ? "text-white/65" : "text-gray-600"}`}>{lead}</p>}
    </Reveal>
  );
}
