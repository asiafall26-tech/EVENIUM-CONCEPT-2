import Image from "next/image";

/**
 * Shows a full invitation (2:3 artwork) inside the taller phone screen without cropping its text:
 * a blurred copy fills the screen, the sharp artwork sits centered on top.
 */
export default function InvitationSample({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <Image src={src} alt="" aria-hidden fill sizes="270px" className="object-cover scale-125 blur-xl opacity-80" />
      <div className="absolute inset-0 bg-black/15" />
      <Image src={src} alt={alt} fill sizes="270px" className="object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]" />
    </div>
  );
}
