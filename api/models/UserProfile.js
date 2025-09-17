import mongoose from "mongoose";
const UserProfileSchema = new mongoose.Schema({
  email: { type: String, index: true },
  name: String,
  memberships: [{
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    role: { type: String, enum: ["org_admin","technician","receptionist"] },
    status: { type: String, enum: ["active","disabled"], default: "active" }
  }]
}, { timestamps: true });
export default mongoose.model("UserProfile", UserProfileSchema);
