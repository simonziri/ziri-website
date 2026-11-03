import { buildCalendarIcs, getTraining, trainings } from "@/data/trainings";

/*
 * .ics-Download für Apple Kalender & Co. (Thank-you-Seite, "Add to calendar").
 * Statisch, verarbeitet keine Daten.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return trainings.map(({ slug }) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const training = getTraining(slug);
  if (!training) return new Response("Not found", { status: 404 });
  return new Response(buildCalendarIcs(training), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="ziri-training.ics"`,
      "X-Robots-Tag": "noindex",
    },
  });
}
