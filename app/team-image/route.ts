import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get("teamId");
  if (!teamId) return new NextResponse("teamId kerak", { status: 400 });

  const res = await fetch(
    `https://sofascore.p.rapidapi.com/teams/get-logo?teamId=${teamId}`,
    {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
        "x-rapidapi-host": "sofascore.p.rapidapi.com",
      },
      next: { revalidate: 86400 },
    }
  );

  if (!res.ok) return new NextResponse("Rasm topilmadi", { status: 404 });

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}