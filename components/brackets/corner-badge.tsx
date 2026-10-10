import { cn } from "@/lib/utils";
import type { BracketStrings } from "@/lib/i18n/bracket-strings";
import type { BracketMatch, Corner } from "@/types/bracket";

/** Blue and red are the same in light and dark and in every language, so they are fixed colors. */
export const CORNER_FILL: Record<Corner, string> = {
  BLUE: "bg-blue-600 text-white",
  RED: "bg-red-600 text-white",
};

export function cornerName(corner: Corner, t: BracketStrings): string {
  return corner === "BLUE" ? t.cornerBlue : t.cornerRed;
}

/** A player's color in a match that has not finished, or null when there is nothing to show. */
export function activeCorner(match: BracketMatch, side: 1 | 2): Corner | null {
  if (match.status !== "READY" && match.status !== "IN_PROGRESS") return null;
  return (side === 1 ? match.player1Corner : match.player2Corner) ?? null;
}

/** The color a player wears, always written out so it never relies on color alone. */
export function CornerBadge({
  corner,
  t,
  className,
}: {
  corner: Corner;
  t: BracketStrings;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]",
        CORNER_FILL[corner],
        className,
      )}
    >
      {cornerName(corner, t)}
    </span>
  );
}
