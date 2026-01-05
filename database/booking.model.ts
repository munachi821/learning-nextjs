import mongoose, { Document, Model } from "mongoose";
import Event from "./event.model";

// Strongly-typed attributes for Booking creation
export interface BookingAttrs {
  eventId: mongoose.Types.ObjectId | string;
  email: string;
}

export interface BookingDoc extends Document {
  eventId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingModel extends Model<BookingDoc> {
  build(attrs: BookingAttrs): BookingDoc;
}

// Simple email regex for validation (reasonable balance between strictness and flexibility)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new mongoose.Schema<BookingDoc, BookingModel>(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "eventId is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: "Invalid email format",
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Index eventId for faster lookup of bookings by event
bookingSchema.index({ eventId: 1 });

// Pre-save hook: verify that the referenced Event exists. Throwing an
// error will abort the save operation when the event cannot be found.
bookingSchema.pre<BookingDoc>("save", async function (this: BookingDoc) {
  const exists = await Event.exists({ _id: this.eventId });
  if (!exists) {
    throw new Error("Referenced event does not exist");
  }
});

bookingSchema.statics.build = function (
  this: BookingModel,
  attrs: BookingAttrs
) {
  return new this(attrs) as BookingDoc;
};

const Booking =
  (mongoose.models.Booking as BookingModel) ||
  mongoose.model<BookingDoc, BookingModel>("Booking", bookingSchema);

export default Booking;
