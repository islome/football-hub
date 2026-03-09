import { NextRequest, NextResponse } from "next/server";
import { getPlayer } from "@/lib/football-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const player = await getPlayer(parseInt(id));
    return NextResponse.json(player);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "O'yinchi ma'lumotini olishda xato" },
      { status: 500 }
    );
  }
}