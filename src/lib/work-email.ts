/**
 * Nur Firmen-Adressen für die Training-Anmeldung (Simons Wunsch: keine
 * anonymen Freemail-Teilnehmer). Läuft im Browser (Hinweis am Feld) und
 * auf dem Server (/api/training), damit es nicht umgangen werden kann.
 *
 * Bewusst eine Liste der großen Freemail- und Wegwerf-Anbieter, kein
 * vollständiges Verzeichnis. Fehlt ein Anbieter: hier ergänzen.
 */

/** Exakte Domains */
const FREE_DOMAINS = new Set([
  // global
  "gmail.com", "googlemail.com", "icloud.com", "me.com", "mac.com",
  "aol.com", "aim.com", "mail.com", "email.com", "inbox.com",
  "proton.me", "protonmail.com", "protonmail.ch", "pm.me",
  "tutanota.com", "tutanota.de", "tuta.io", "tuta.com",
  "fastmail.com", "fastmail.fm", "hey.com", "zohomail.com",
  "msn.com", "rocketmail.com", "ymail.com", "hushmail.com",
  "gmx.com", "gmx.net", "gmx.de", "gmx.at", "gmx.ch",
  "yandex.com", "yandex.ru", "mail.ru", "qq.com", "163.com", "126.com",
  "naver.com", "rediffmail.com",
  // USA (Provider-Mail)
  "comcast.net", "att.net", "verizon.net", "sbcglobal.net", "cox.net",
  "charter.net", "bellsouth.net", "earthlink.net", "optonline.net",
  // DACH
  "web.de", "t-online.de", "freenet.de", "arcor.de", "posteo.de",
  "posteo.net", "mailbox.org", "online.de", "bluewin.ch", "gmx.li",
  // Wegwerf-Adressen
  "mailinator.com", "guerrillamail.com", "10minutemail.com",
  "temp-mail.org", "yopmail.com", "trashmail.com", "sharklasers.com",
  "getnada.com", "dispostable.com", "maildrop.cc",
]);

/** Anbieter mit vielen Länder-Endungen (yahoo.co.uk, hotmail.de, ...) */
const FREE_BRANDS = ["yahoo", "hotmail", "outlook", "live", "windowslive"];

export function isFreeEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@").pop() ?? "";
  if (FREE_DOMAINS.has(domain)) return true;
  const brand = domain.split(".")[0];
  return FREE_BRANDS.includes(brand);
}

export const WORK_EMAIL_MESSAGE =
  "Please use your work email. Personal addresses like Gmail or Outlook aren't accepted.";
