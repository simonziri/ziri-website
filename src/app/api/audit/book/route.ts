import { NextResponse } from "next/server";
import { createAuditBooking } from "@/lib/cal-audit";
import { sendIntegrationAlert } from "@/lib/ziri-alert";

/**
 * Bucht einen Audit-Termin in Cal.com. Cal.com schickt Einladung + Google-Meet-
 * Link an den Besucher und an Simon. Scheitert die Buchung aus anderem Grund als
 * "Termin weg", geht eine Alarm-Mail an ZIRI (Person hat es versucht).
 */
const asTrimmed = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max
    ? value.trim()
    : null;

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const start = asTrimmed(payload.start, 40);
  const name = asTrimmed(payload.name, 200);
  const email = asTrimmed(payload.email, 320);
  const timeZone = asTrimmed(payload.timeZone, 64) ?? "UTC";
  const notes = asTrimmed(payload.notes, 2000) ?? undefined;
  if (
    !start ||
    Number.isNaN(Date.parse(start)) ||
    !name ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  let result;
  try {
    result = await createAuditBooking({ start, name, email, timeZone, notes });
  } catch (error) {
    result = { status: "error" as const, detail: String(error) };
  }

  if (result.status === "taken") {
    return NextResponse.json({ ok: false, error: "taken" }, { status: 409 });
  }
  if (result.status === "bad-email") {
    return NextResponse.json({ ok: false, error: "email" }, { status: 400 });
  }
  if (result.status === "error") {
    console.error("[audit-book]", result.detail);
    await sendIntegrationAlert(
      "Audit call booking (Cal.com)",
      [`Email:    ${email}`, `Name:     ${name}`, `Wanted:   ${start} (${timeZone})`],
      [{ target: "cal.com booking", error: result.detail }],
    );
    return NextResponse.json({ ok: false, error: "booking" }, { status: 502 });
  }
  console.info("[audit-book] booked", result.uid, start);
  return NextResponse.json({ ok: true, start: result.start, meetingUrl: result.meetingUrl });
}
