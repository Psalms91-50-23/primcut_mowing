function clampWindowMins(n: any, fallback = 240) {
  const x = parseInt(String(n ?? ""), 10);
  if (Number.isNaN(x) || x <= 0) return fallback;
  return x;
}

function addMinutesToISO(startISO: string, mins: number) {
  const t = new Date(startISO).getTime();
  const end = new Date(t + mins * 60_000);
  return end.toISOString();
}

export function getWindowPreview(
  startISO?: string | null,
  preset?: string | null,
  mins?: number | null
) {
  if (!startISO) return "—";

  if (preset === "morning") return "9:00 AM – 12:00 PM";
  if (preset === "midday") return "12:00 PM – 3:00 PM";
  if (preset === "afternoon") return "3:00 PM – 5:00 PM";
  if (preset === "anytime") return "9:00 AM – 5:00 PM";

  const safeMins = clampWindowMins(mins, 240);
  const endISO = addMinutesToISO(startISO, safeMins);

  return `${new Date(startISO).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} – ${new Date(endISO).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}