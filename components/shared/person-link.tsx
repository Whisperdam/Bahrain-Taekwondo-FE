"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const LINK_STYLE =
  "hover:text-flag hover:underline underline-offset-2 decoration-flag/60 transition-colors";

interface EntityLinkProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A player's name, linking to their page. Every list that shows players uses this, so there is
 * one page per player and the page decides what the viewer may see.
 */
export function PlayerLink({
  playerId,
  children,
  className,
}: EntityLinkProps & { playerId: number | null | undefined }) {
  if (playerId == null) return <span className={className}>{children}</span>;
  return (
    <Link
      href={`/players/${playerId}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(LINK_STYLE, className)}
    >
      {children}
    </Link>
  );
}

/** A coach's, official's or other member's name, linking to their page. */
export function UserLink({
  userId,
  children,
  className,
}: EntityLinkProps & { userId: number | null | undefined }) {
  if (userId == null) return <span className={className}>{children}</span>;
  return (
    <Link
      href={`/users/${userId}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(LINK_STYLE, className)}
    >
      {children}
    </Link>
  );
}

/** An academy's name, linking to its page. */
export function AcademyLink({
  academyId,
  children,
  className,
}: EntityLinkProps & { academyId: number | null | undefined }) {
  if (academyId == null) return <span className={className}>{children}</span>;
  return (
    <Link
      href={`/academies/${academyId}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(LINK_STYLE, className)}
    >
      {children}
    </Link>
  );
}

/** A tournament's name, linking to its page. */
export function TournamentLink({
  tournamentId,
  children,
  className,
}: EntityLinkProps & { tournamentId: number | null | undefined }) {
  if (tournamentId == null) return <span className={className}>{children}</span>;
  return (
    <Link
      href={`/tournaments/${tournamentId}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(LINK_STYLE, className)}
    >
      {children}
    </Link>
  );
}
