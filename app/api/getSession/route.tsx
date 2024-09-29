import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust the path

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions); // Use authOptions

  console.log("Session data: ", session?.user); // Should include id and usertype

  return NextResponse.json({ session });
}
