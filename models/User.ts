import mongoose, { Document, Schema } from "mongoose";

// interface of the user
interface UserInterFace extends Document {
  email: string;
  password: string;
}

///declaring the
const UserSchema: Schema<UserInterFace> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User =
  mongoose.models.User || mongoose.model<UserInterFace>("User", UserSchema);

export default User;
