import { Mail, Phone, MapPin, Car, Link, Globe } from "lucide-react";
import { CVData } from "@/lib/types";

const ICONS = {
  email: Mail,
  telephone: Phone,
  adresse: MapPin,
  permis: Car,
  linkedin: Link,
  siteWeb: Globe,
};

export function ContactIcon({
  type,
  cv,
  size = 11,
  className = "",
}: {
  type: keyof typeof ICONS;
  cv: CVData;
  size?: number;
  className?: string;
}) {
  if (cv.iconStyle === "aucune") return null;
  const Icon = ICONS[type];
  const filled = cv.iconStyle === "remplie";
  return (
    <Icon
      size={size}
      className={`inline-block mr-1 -mt-0.5 ${className}`}
      strokeWidth={filled ? 2.2 : 1.6}
      fill={filled ? "currentColor" : "none"}
      fillOpacity={filled ? 0.25 : undefined}
    />
  );
}
