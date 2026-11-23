import { NextResponse } from "next/server";
import { fetchAuditSlots } from "@/lib/cal-audit";

/** Freie Audit-Termine für einen Zeitraum (max. 62 Tage), in der Zeitzone des Besuchers. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const start = url.searchParams.get("start") ?? "";
  const end = url.searchParams.get("end") ?? "";
  const timeZone = url.searchParams.get("timeZone") ?? "UTC";
  const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
  const span = (Date.parse(end) - Date.parse(start)) / 86_400_000;
  if (!isDate(start) || !isDate(end) || !(span >= 0 && span <= 62) || timeZone.length > 64) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  try {
    const slots = await fetchAuditSlots(start, end, timeZone);
    return NextResponse.json({ ok: true, slots });
  } catch (error) {
    console.error("[audit-slots]", error);
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 502 });
  }
}
