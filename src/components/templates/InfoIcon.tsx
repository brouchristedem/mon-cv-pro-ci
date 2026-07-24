import { Flag, Users, Cake, CalendarDays, Baby, VenusAndMars, Info } from "lucide-react";
import { CVData } from "@/lib/types";

/**
 * Devine une icône pertinente à partir du libellé saisi par l'utilisateur
 * (ex: "Nationalité", "Situation matrimoniale", "Date de naissance"...).
 * Fonctionne en français et en anglais, insensible aux accents/majuscules.
 */
function guessIcon(label: string) {
  const normalized = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/national/.test(normalized)) return Flag;
  if (/matrimon|marital|etat civil|civil status/.test(normalized)) return Users;
  if (/naissance|birth|ne le|born/.test(normalized)) return Cake;
  if (/age\b/.test(normalized)) return CalendarDays;
  if (/sexe|genre|gender/.test(normalized)) return VenusAndMars;
  if (/enfant|child/.test(normalized)) return Baby;
  return Info;
}

export function InfoIcon({
  label,
  cv,
  size = 11,
  className = "",
}: {
  label: string;
  cv: CVData;
  size?: number;
  className?: string;
}) {
  if (cv.iconStyle === "aucune") return null;
  const Icon = guessIcon(label || "");
  const filled = cv.iconStyle === "remplie";
  return (
    <Icon
      size={size}
      className={`inline-block mr-1 align-[-2px] ${className}`}
      strokeWidth={filled ? 2.2 : 1.6}
      fill={filled ? "currentColor" : "none"}
      fillOpacity={filled ? 0.25 : undefined}
    />
  );
}
