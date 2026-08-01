import React from "react";

/**
 * Un segment de texte avec son état de mise en forme (gras / souligné
 * peuvent être actifs en même temps).
 */
export interface RichRun {
  text: string;
  bold: boolean;
  underline: boolean;
}

/**
 * Découpe un texte contenant une mise en forme simple type Markdown
 * (**gras** et __souligné__, combinables) en segments avec leur état
 * de mise en forme. Les marqueurs sont de simples bascules : on n'exige
 * pas un emboîtement strict, ce qui tolère __**texte**__ comme **__texte__**.
 */
export function parseRichRuns(text?: string): RichRun[] {
  if (!text) return [];
  const tokens = text.split(/(\*\*|__)/);
  const runs: RichRun[] = [];
  let bold = false;
  let underline = false;
  for (const token of tokens) {
    if (token === "**") {
      bold = !bold;
    } else if (token === "__") {
      underline = !underline;
    } else if (token) {
      const last = runs[runs.length - 1];
      if (last && last.bold === bold && last.underline === underline) {
        last.text += token;
      } else {
        runs.push({ text: token, bold, underline });
      }
    }
  }
  return runs;
}

/**
 * Convertit un texte contenant une mise en forme simple type Markdown
 * (**gras** et __souligné__) en éléments React. Utilisé pour afficher
 * les descriptions du CV (expérience, formation, profil, etc.) avec
 * la mise en forme choisie par l'utilisateur dans l'éditeur.
 */
export function renderRichText(text?: string): React.ReactNode {
  if (!text) return text;
  const runs = parseRichRuns(text);
  let key = 0;
  return runs.map((run) => {
    // Une ligne peut contenir des retours à la ligne (\n) : on les
    // transforme en <br /> tout en gardant la mise en forme du segment.
    const lines = run.text.split("\n");
    const content: React.ReactNode = lines.map((line, i) => (
      <React.Fragment key={i}>
        {i > 0 && <br />}
        {line}
      </React.Fragment>
    ));
    if (run.bold && run.underline) {
      return (
        <strong key={key++}>
          <u>{content}</u>
        </strong>
      );
    }
    if (run.bold) return <strong key={key++}>{content}</strong>;
    if (run.underline) return <u key={key++}>{content}</u>;
    return <React.Fragment key={key++}>{content}</React.Fragment>;
  });
}
