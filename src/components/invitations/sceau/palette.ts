// Named colours offered for the dress code, grouped by family. Any other colour can be picked freely.

export interface PaletteFamily {
  family: string;
  colors: { name: string; hex: string }[];
}

export const DRESS_PALETTE: PaletteFamily[] = [
  {
    family: "Blancs & ivoires",
    colors: [
      { name: "Blanc", hex: "#ffffff" },
      { name: "Blanc cassé", hex: "#f8f4ec" },
      { name: "Ivoire", hex: "#f1e7da" },
      { name: "Crème", hex: "#f3e5c8" },
      { name: "Perle", hex: "#e9e4dc" },
      { name: "Champagne", hex: "#f2dfbf" },
      { name: "Vanille", hex: "#f3e6b3" },
      { name: "Coquille d'œuf", hex: "#efe6d2" },
    ],
  },
  {
    family: "Beiges & nudes",
    colors: [
      { name: "Sable", hex: "#d4bfa4" },
      { name: "Beige", hex: "#d8c3a5" },
      { name: "Nude", hex: "#e3bfa8" },
      { name: "Lin", hex: "#cdbfa8" },
      { name: "Taupe", hex: "#9a8576" },
      { name: "Grège", hex: "#b5a898" },
      { name: "Café au lait", hex: "#a68a6d" },
      { name: "Camel", hex: "#b88a55" },
    ],
  },
  {
    family: "Ors & métalliques",
    colors: [
      { name: "Or", hex: "#c9a24a" },
      { name: "Or clair", hex: "#e2c06a" },
      { name: "Or rose", hex: "#d4a08c" },
      { name: "Bronze", hex: "#9c6b30" },
      { name: "Cuivre", hex: "#b4643c" },
      { name: "Argent", hex: "#c0c0c4" },
      { name: "Platine", hex: "#dcdad4" },
      { name: "Étain", hex: "#8a8a8e" },
    ],
  },
  {
    family: "Roses",
    colors: [
      { name: "Rose poudré", hex: "#ecc5c0" },
      { name: "Rose pâle", hex: "#f6d6d6" },
      { name: "Blush", hex: "#e8b4b0" },
      { name: "Vieux rose", hex: "#c48b8f" },
      { name: "Rose ancien", hex: "#b77c84" },
      { name: "Rose bonbon", hex: "#f39ab8" },
      { name: "Fuchsia", hex: "#c8247a" },
      { name: "Framboise", hex: "#b0244f" },
    ],
  },
  {
    family: "Rouges & bordeaux",
    colors: [
      { name: "Rouge", hex: "#c0182b" },
      { name: "Rouge cerise", hex: "#a3122a" },
      { name: "Carmin", hex: "#960018" },
      { name: "Bordeaux", hex: "#5e1622" },
      { name: "Lie-de-vin", hex: "#6c1f33" },
      { name: "Grenat", hex: "#7b1c2e" },
      { name: "Marsala", hex: "#8a3b3f" },
      { name: "Rouille", hex: "#a5442a" },
    ],
  },
  {
    family: "Oranges & corails",
    colors: [
      { name: "Pêche", hex: "#f6c3a1" },
      { name: "Abricot", hex: "#f2a971" },
      { name: "Corail", hex: "#f27b62" },
      { name: "Orange", hex: "#ee7d22" },
      { name: "Mandarine", hex: "#f39136" },
      { name: "Terracotta", hex: "#c56a4a" },
      { name: "Brique", hex: "#a64b35" },
      { name: "Saumon", hex: "#f09a83" },
    ],
  },
  {
    family: "Jaunes",
    colors: [
      { name: "Jaune pâle", hex: "#f7eaa4" },
      { name: "Citron", hex: "#f2dc44" },
      { name: "Jaune", hex: "#f5c518" },
      { name: "Moutarde", hex: "#d1a12a" },
      { name: "Safran", hex: "#e9a520" },
      { name: "Ocre", hex: "#c48a2c" },
      { name: "Miel", hex: "#d9a441" },
      { name: "Paille", hex: "#e4d18a" },
    ],
  },
  {
    family: "Verts",
    colors: [
      { name: "Menthe", hex: "#bfe3cc" },
      { name: "Vert d'eau", hex: "#b4d8c8" },
      { name: "Sauge", hex: "#a3b49a" },
      { name: "Olive", hex: "#7c7a3a" },
      { name: "Kaki", hex: "#8a8457" },
      { name: "Vert émeraude", hex: "#1f7a55" },
      { name: "Vert sapin", hex: "#1f4a37" },
      { name: "Vert bouteille", hex: "#16382a" },
      { name: "Vert pomme", hex: "#8cc63e" },
      { name: "Eucalyptus", hex: "#7d9a8c" },
    ],
  },
  {
    family: "Bleus",
    colors: [
      { name: "Bleu ciel", hex: "#b7d7ef" },
      { name: "Bleu poudré", hex: "#a9c1d9" },
      { name: "Bleu glacier", hex: "#cfe3ea" },
      { name: "Turquoise", hex: "#2fb5b0" },
      { name: "Bleu canard", hex: "#1f6f78" },
      { name: "Bleu roi", hex: "#2a4fb5" },
      { name: "Bleu électrique", hex: "#1f5bff" },
      { name: "Bleu nuit", hex: "#1b2a4a" },
      { name: "Bleu marine", hex: "#14213d" },
      { name: "Bleu pétrole", hex: "#1d4e5f" },
    ],
  },
  {
    family: "Violets & mauves",
    colors: [
      { name: "Lavande", hex: "#c8b7e0" },
      { name: "Lilas", hex: "#c3a3d1" },
      { name: "Parme", hex: "#b190c2" },
      { name: "Mauve", hex: "#7b5960" },
      { name: "Prune", hex: "#5d2a4a" },
      { name: "Violet", hex: "#6a3d9a" },
      { name: "Aubergine", hex: "#3f1d38" },
      { name: "Améthyste", hex: "#9966cc" },
    ],
  },
  {
    family: "Marrons",
    colors: [
      { name: "Chocolat", hex: "#4e2a1e" },
      { name: "Cacao", hex: "#6b4232" },
      { name: "Noisette", hex: "#8b5a2b" },
      { name: "Caramel", hex: "#a8693a" },
      { name: "Cognac", hex: "#9a4a22" },
      { name: "Moka", hex: "#6f4e37" },
    ],
  },
  {
    family: "Gris & noirs",
    colors: [
      { name: "Gris perle", hex: "#d6d4d0" },
      { name: "Gris clair", hex: "#bdbdbd" },
      { name: "Gris souris", hex: "#8e8e8e" },
      { name: "Anthracite", hex: "#3a3a3c" },
      { name: "Ardoise", hex: "#4a5560" },
      { name: "Noir", hex: "#111111" },
    ],
  },
];

export const ALL_DRESS_COLORS = DRESS_PALETTE.flatMap((f) => f.colors);

/** Closest named colour, used to suggest a label for a freely picked colour */
export function nearestColorName(hex: string): string {
  const rgb = (h: string) => {
    const n = parseInt(h.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [r, g, b] = rgb(hex);
  let best = ALL_DRESS_COLORS[0];
  let bestD = Infinity;
  for (const c of ALL_DRESS_COLORS) {
    const [r2, g2, b2] = rgb(c.hex);
    const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best.name;
}
