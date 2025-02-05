import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST() {
  revalidatePath("/sites");
  return NextResponse.json({ success: true });
}
