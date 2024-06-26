const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: [true, "Your username is required"],
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  age: Number,
  email: {
    type: String,
    required: [true, "Your email address is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Your password is required"],
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
  dateOfBirth: Date,
  phoneNumber: {
    type: String,
    unique: true,
  },

  image: {
    type: String,
    default: "",
  },

  gender: String,
  address: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: Date,
  role: {
    type: String,
    enum: ["admin", "teacher", "user", "student"],
    required: true,
  },  
// Deadline for payment
  status: {
    type: String,
    enum: [
      "active",
      "inactive",
      "deleted",
      "suspended",
      "offboarded",
      "archived",
    ],
    default: "active",
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },
  preferedInstrument: [String],
  Mjob: {
    type: String,
    enum: ["teacher", "health", "services", "at_home", "other"],
  },
  Fjob: {
    type: String,
    enum: ["teacher", "health", "services", "at_home", "other"],
  },
  activity: String,
  famsize: {
    type: String,
    enum: ["LE3", "GT3"],
  },
  Pstatus: {
    type: String,
    enum: ["T", "A"],
  },
  Medu: {
    type: Number,
    min: 0,
    max: 4,
  },
  Fedu: {
    type: Number,
    min: 0,
    max: 4,
  },
  activities: {
    type: String,
    enum: ["Yes", "No"],
  },
  
  resetToken: { type: String, required: false },
  courses: [
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
      paymentStatus: {
        type: String,
        enum: ["paid", "unpaid", "rejected"],
        default: "unpaid",
      },
    },
  ],
  availability: {
    type: [Date], // Array of Date objects
    default: [], // Default empty array
  },

  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],

});


userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.resetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000;
  return resetToken;
};
module.exports = mongoose.model("Users", userSchema);
