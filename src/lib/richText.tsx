import React from "react";

/**
 * Convertit un texte contenant une mise en forme simple type Markdown
 * (**gras** et __souligné__) en éléments React. Utilisé pour afficher
 * les descriptions du CV (expérience, formation, profil, etc.) avec
 * la mise en forme choisie par l'utilisateur dans l'éditeur.
 */
export function renderRichText(text?: string): React.ReactNode {
  if (!text) return text;
  const regex = /(\*\*[^*]+\*\*|__[^_]+__)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<u key={key++}>{token.slice(2, -2)}</u>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}
