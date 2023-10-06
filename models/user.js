import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  // avatar:{
  //     type:Image
  // },
  Username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: [
    {
      num: Number,
      name: String,
      image: String,
      price: String,
    },
  ],
 
});

export default mongoose.model("User", UserSchema);
