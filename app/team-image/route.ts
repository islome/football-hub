// app/team-image/route.ts
import { getTeamLogo } from "@/lib/football";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const logo = await getTeamLogo(8650);

  if (!teamId) {
    return new Response("teamId kerak", { status: 400 });
  }

  const url = await getTeamLogo(teamId);

  if (!url) {
    return new Response("Logo topilmadi", { status: 404 });
  }

  // Rasmni proxy qilib qaytarish
  const img = await fetch(url);
  const buffer = await img.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": img.headers.get("Content-Type") || "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}