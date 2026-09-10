"use client";

import { useEffect, useState } from "react";
import type { Actor, SubmitterKind } from "@/types/upload";

/**
 * Client-side sign-in state.
 *
 * There is no auth backend yet, so the "session" is an account object in
 * localStorage that the login and signup forms write. It carries an identity —
 * not just a yes/no — because every submission has to say who sent it: the
 * wizard stamps `uploadedBy` from here, which is what the admin's "Uploaded by"
 * column and the reviewer's screen read.
 *
 * Swap the four functions below for real session calls and everything that
 * depends on them keeps working unchanged.
 */

const KEY = "ws-account";
/** The old boolean flag, so anyone already signed in stays signed in. */
const LEGACY_KEY = "ws-signed-in";
const EVENT = "ws-session-change";

export interface Account {
  /** Stable id for this person. The backend issues the real one. */
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  /** What they submit as — seeds the wizard, editable there and on the profile. */
  kind: SubmitterKind;
  initials: string;
  color: string;
  joinedAt: string;
}

/** Avatar colours, picked from the id so one person is always the same colour. */
const COLORS = ["#e50914", "#0d9488", "#0369a1", "#7c3aed", "#b45309", "#be185d"];

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** "marco.rossi@studio.it" -> "Marco Rossi", so a login-only sign-in has a name. */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  return (
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
      .join(" ") || "Weshort member"
  );
}

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

/**
 * The id is derived from the address rather than random, so signing out and
 * back in lands on the same member — and the submissions already sitting in the
 * admin under that id still show up on the profile.
 */
function idFor(email: string): string {
  const key = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 33 + key.charCodeAt(i)) >>> 0;
  return `usr_${hash.toString(36)}`;
}

/** Fills in everything that was not typed, so an account is always complete. */
export function buildAccount(input: Partial<Account> & { email: string }): Account {
  const id = input.id ?? idFor(input.email);
  const name = input.name?.trim() || nameFromEmail(input.email);
  return {
    id,
    name,
    email: input.email,
    company: input.company ?? "",
    phone: input.phone ?? "",
    kind: input.kind ?? "director",
    initials: input.initials ?? initialsOf(name),
    color: input.color ?? colorFor(id),
    joinedAt: input.joinedAt ?? new Date().toISOString(),
  };
}

/* -------------------------------- storage ------------------------------- */

function read(): Account | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Account;
    // signed in before this file grew an identity — keep them in, with a stand-in
    if (localStorage.getItem(LEGACY_KEY) === "1") {
      const account = buildAccount({ email: "member@weshort.com" });
      localStorage.setItem(KEY, JSON.stringify(account));
      return account;
    }
    return null;
  } catch {
    return null;
  }
}

function write(account: Account | null) {
  try {
    if (account) {
      localStorage.setItem(KEY, JSON.stringify(account));
      localStorage.setItem(LEGACY_KEY, "1");
    } else {
      localStorage.removeItem(KEY);
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch {
    /* storage blocked — the session just won't survive a reload */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function signIn(input: Partial<Account> & { email: string }): Account {
  const account = buildAccount(input);
  write(account);
  return account;
}

export function signOut() {
  write(null);
}

/** Saves an edit from the profile page. */
export function updateAccount(patch: Partial<Account>): Account | null {
  const current = read();
  if (!current) return null;
  const next: Account = { ...current, ...patch };
  if (patch.name) next.initials = initialsOf(patch.name);
  write(next);
  return next;
}

/* --------------------------------- hook --------------------------------- */

/**
 * The signed-in account. Starts empty so the server and the first client render
 * agree; the real value arrives on mount, and `ready` says when it has, so the
 * header can hold its shape instead of flashing the wrong control.
 */
export function useSession(): { account: Account | null; signedIn: boolean; ready: boolean } {
  const [state, setState] = useState<{ account: Account | null; ready: boolean }>({
    account: null,
    ready: false,
  });

  useEffect(() => {
    const sync = () => setState({ account: read(), ready: true });
    sync();

    window.addEventListener(EVENT, sync);
    // another tab signing in or out
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { account: state.account, signedIn: state.account !== null, ready: state.ready };
}

/** The account as the API's `uploadedBy` — this is what stamps a submission. */
export function actorOf(account: Account): Actor {
  return {
    id: account.id,
    name: account.name,
    initials: account.initials,
    color: account.color,
  };
}
