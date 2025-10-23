import { corsHeader } from "@/utils/corsHeader";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    (await cookies()).delete("chatbot")
    return NextResponse.json({ message: "Boiler plate of next js" }, { status: 200,headers: corsHeader });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 , headers: corsHeader }
    );
  }
}



export async function OPTIONS(req: NextRequest) {
  try {
    return NextResponse.json({ message: "cors preflight" }, { status: 200 ,headers: corsHeader });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 , headers: corsHeader }
    );
  }
}