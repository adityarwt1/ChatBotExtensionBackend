import { corsHeader } from "@/utils/corsHeader";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("chatbot")?.value;
    console.log("token", token);

    if (!token) {
      return NextResponse.json(
        { error: "token not found" },
        { status: 401, headers: corsHeader }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      exp: number;
    };

    if (!decoded) {
      return NextResponse.json(
        { error: "unable to decode the token" },
        { status: 401, headers: corsHeader }
      );
    }

    if (new Date(decoded.exp * 1000) < new Date()) {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 401, headers: corsHeader }
      );
    }

    return NextResponse.json(
      { message: "User Auntheticated" },
      { status: 200, headers: corsHeader }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500, headers: corsHeader }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  try {
    return NextResponse.json(
      { message: "cors preflight" },
      { status: 200, headers: corsHeader }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500, headers: corsHeader }
    );
  }
}
