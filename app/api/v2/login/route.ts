import User from "@/models/User";
import { corsHeader } from "@/utils/corsHeader";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "email or password must be required" },
        { status: 400, headers: corsHeader }
      );
    }

    await dbConnect();
    const user = await User.findOne({ email });

    // if user exists -> login
    if (user) {
      const isPasswordTrue = await bcryptjs.compare(password, user.password);
      if (!isPasswordTrue) {
        return NextResponse.json(
          { error: "Wrong Password" },
          { status: 400, headers: corsHeader }
        );
      }

      const tokenPayload = { email, _id: user._id };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, {
        issuer: "Aditya Rawat",
        expiresIn: "30d",
      });

      (await cookies()).set("chatbot", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/", // ✅ cookie available everywhere
        sameSite: "lax", // or "strict" depending on your use case
      });

      return NextResponse.json(
        { success: true },
        { status: 200, headers: corsHeader }
      );
    }

    // signup -> create user
    const hashedPassword = await bcryptjs.hash(password, 10);
    const createUser = new User({ email, password: hashedPassword });
    await createUser.save();

    const tokenPayload = { email, _id: createUser._id };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, {
      issuer: "Aditya Rawat",
      expiresIn: "30d",
    });

    (await cookies()).set("chatbot", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json(
      { success: true },
      { status: 201, headers: corsHeader }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500, headers: corsHeader }
    );
  }
}


export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
