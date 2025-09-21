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
        {
          success: false,
          error: "email or password must be required",
        },
        {
          status: 400,
          headers: corsHeader,
        }
      );
    }
    await dbConnect();
    const user = await User.findOne({ email });

    //handling the auth when user already exist
    if (user) {
      const isPasswordTrue = await bcryptjs.compare(password, user.password);
      if (!isPasswordTrue) {
        return NextResponse.json(
          {
            error: "Wrong Password",
          },
          {
            status: 400,
            headers: corsHeader,
          }
        );
      }
      const tokenPaylod = {
        email,
        _id: user._id,
      };

      const token = jwt.sign(tokenPaylod, process.env.JWT_SECRET as string, {
        issuer: "Aditya Rawat",
        expiresIn: "30d",
      });
      (await cookies()).set("chatbot",token,{
        httpOnly: true,
        expires: 7 *24 * 60 * 60,
        
      } )
      return NextResponse.json(
        {  success: true },
        {
          status: 200,
          headers: corsHeader,
        }
      );
    }
    //storing password in the hashed forma
    const hashedPassword = await bcryptjs.hash(password, 10);
    const createUser = new User({ email, password: hashedPassword });

    await createUser.save();

    const tokenPaylod = {
      email,
      _id: createUser._id,
    };

    const token = jwt.sign(tokenPaylod, process.env.JWT_SECRET as string, {
      issuer: "Aditya Rawat",
      expiresIn: "30d",
    });
    (await cookies()).set("chatbot", token, {
      httpOnly: true,
      expires: 7 * 24 * 60 * 60,
    });
    return NextResponse.json(
      { success: true, },
      {
        status: 201,
        headers: corsHeader,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500, headers: corsHeader }
    );
  }
}

///cors preflight
export async function OPTIONS() {
  try {
    return NextResponse.json(
      { success: false, message: "Cors Prefight" },
      { status: 200, headers: corsHeader }
    );
  } catch (error) {
    console.log((error as Error).message);
    return NextResponse.json(
      { success: false, errro: (error as Error).message },
      { status: 500, headers: corsHeader }
    );
  }
}
