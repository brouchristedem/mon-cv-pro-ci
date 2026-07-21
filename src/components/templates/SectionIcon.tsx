import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Languages,
  Award,
  FolderKanban,
  Heart,
  Users,
  FileText,
} from "lucide-react";
import { CVData, SectionType } from "@/lib/types";

const ICONS: Record<SectionType, typeof User> = {
  profil: User,
  experience: Briefcase,
  formation: GraduationCap,
  competences: Wrench,
  langues: Languages,
  certifications: Award,
  projets: FolderKanban,
  interets: Heart,
  references: Users,
  custom: FileText,
};

export function SectionIcon({
  type,
  cv,
  size = 13,
  className = "",
}: {
  type: SectionType;
  cv: CVData;
  size?: number;
  className?: string;
}) {
  if (cv.iconStyle === "aucune") return null;
  const Icon = ICONS[type] || FileText;
  const filled = cv.iconStyle === "remplie";
  return (
    <Icon
      size={size}
      className={`inline-block mr-1.5 align-[-2px] ${className}`}
      strokeWidth={filled ? 2.2 : 1.6}
      fill={filled ? "currentColor" : "none"}
      fillOpacity={filled ? 0.2 : undefined}
    />
  );
}
