/**
 * Suggestions d'inspirations de textes d'accueil et d'invitation prêtes à l'emploi.
 * Permet au client de changer la tonalité de son message en 1 clic sans devoir tout rédiger.
 */

export interface ToneInspiration {
  id: string;
  title: string;
  icon: string;
  subtitle: string;
  welcomeTitle: string;
  welcomeText: string;
}

export const WEDDING_TONES: ToneInspiration[] = [
  {
    id: "romantique",
    title: "Romantique & Poétique",
    icon: "✨",
    subtitle: "Émotion, amour et célébration poétique",
    welcomeTitle: "Deux cœurs, une histoire ♡",
    welcomeText:
      "Deux chemins qui se croisent, un amour qui grandit chaque jour… C'est avec une joie infinie que nous vous invitons à célébrer notre mariage. Votre présence à nos côtés rendra ce moment véritablement magique et inoubliable.",
  },
  {
    id: "traditionnel",
    title: "Traditionnel & Respectueux",
    icon: "🕊️",
    subtitle: "Bénédiction des familles et formule solennelle",
    welcomeTitle: "Avec la bénédiction de nos familles",
    welcomeText:
      "C'est entourés de l'amour et de la bienveillance de nos familles que nous avons la joie de vous convier à la célébration de notre union. Nous serions honorés de partager ce moment précieux et béni en votre compagnie.",
  },
  {
    id: "festif",
    title: "Chic & Festif",
    icon: "🥂",
    subtitle: "Moderne, dynamique et tourné vers la fête",
    welcomeTitle: "Le grand jour est arrivé !",
    welcomeText:
      "Le compte à rebours est lancé ! Nous avons tellement hâte de célébrer notre amour avec vous, de lever nos verres et de danser jusqu'au bout de la nuit. Préparez vos plus beaux sourires et votre joie de vivre !",
  },
  {
    id: "epure",
    title: "Sobre & Épuré",
    icon: "🤍",
    subtitle: "Minimaliste, direct et raffiné",
    welcomeTitle: "Chers amis & famille,",
    welcomeText:
      "Nous serions très heureux de vous compter parmi nous pour célébrer notre mariage. Rendez-vous pour partager ce jour si particulier entourés de ceux qui nous sont les plus chers.",
  },
];

export const BIRTHDAY_TONES: ToneInspiration[] = [
  {
    id: "chic",
    title: "Chic & Festif",
    icon: "🎂",
    subtitle: "Une nouvelle année à célébrer",
    welcomeTitle: "Une nouvelle bougie à souffler !",
    welcomeText:
      "Une année de plus à célébrer ensemble ! Venez partager un moment d'exception fait de rires, de musique et de souvenirs inoubliables. Votre présence sera mon plus beau cadeau.",
  },
  {
    id: "intime",
    title: "Chaleureux & Intime",
    icon: "🥂",
    subtitle: "Entouré des personnes les plus chères",
    welcomeTitle: "Célébrons ce moment ensemble",
    welcomeText:
      "Pour marquer cette nouvelle étape, rien ne me ferait plus plaisir que de vous avoir à mes côtés. Venez partager un délicieux moment de convivialité et de fête.",
  },
  {
    id: "surprise",
    title: "Soirée d'Exception",
    icon: "✨",
    subtitle: "Ambiance mémorable et festivités",
    welcomeTitle: "Une soirée mémorable vous attend",
    welcomeText:
      "Rejoignez-nous pour une soirée festive et pleine de surprises ! Tenue élégante et bonne humeur exigées pour fêter cet anniversaire comme il se doit.",
  },
];
