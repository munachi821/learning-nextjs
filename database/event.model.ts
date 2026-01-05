import mongoose, { Document, Model } from "mongoose";

// Strongly-typed interface describing Event document properties
export interface EventAttrs {
  title: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // will be normalized to ISO string in pre-save
  time: string; // will be normalized to HH:mm in pre-save
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

export interface EventDoc extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EventModel extends Model<EventDoc> {
  build(attrs: EventAttrs): EventDoc;
}

// Simple slugify helper to generate URL-friendly slugs from titles
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Normalize time strings to 24-hour HH:mm format. Accepts values like
// '9:00 AM', '09:00', '21:30', etc. Throws if it cannot be parsed.
function normalizeTime(input: string): string {
  const trimmed = input.trim();

  // If already in HH:MM (24h) format
  const hhmm24 = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (hhmm24) return `${hhmm24[1].padStart(2, "0")}:${hhmm24[2]}`;

  // AM/PM format
  const ampm = /^(1[0-2]|0?[1-9]):([0-5]\d)\s*(am|pm)$/i.exec(trimmed);
  if (ampm) {
    let hh = parseInt(ampm[1], 10);
    const mm = ampm[2];
    const period = ampm[3].toLowerCase();
    if (period === "pm" && hh !== 12) hh += 12;
    if (period === "am" && hh === 12) hh = 0;
    return `${String(hh).padStart(2, "0")}:${mm}`;
  }

  // As a last resort, try parsing with Date; attach an arbitrary date.
  const parsed = new Date(`1970-01-01T${trimmed}`);
  if (!Number.isNaN(parsed.getTime())) {
    const hh = String(parsed.getHours()).padStart(2, "0");
    const mm = String(parsed.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  throw new Error("Invalid time format");
}

// Normalize date to ISO string (YYYY-MM-DD or full ISO). Throws on invalid.
function normalizeDate(input: string): string {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date format");
  }
  // Store only the date portion in ISO (YYYY-MM-DD)
  return parsed.toISOString();
}

const eventSchema = new mongoose.Schema<EventDoc, EventModel>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      validate: {
        validator: (v: string) => typeof v === "string" && v.trim().length > 0,
        message: "Title cannot be empty",
      },
    },
    slug: { type: String, required: true, unique: true, index: true },
    description: {
      type: String,
      required: [true, "Description is required"],
      validate: {
        validator: (v: string) => typeof v === "string" && v.trim().length > 0,
        message: "Description cannot be empty",
      },
    },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Pre-save hook:
// - Generate slug only when title changes
// - Normalize date to ISO and time to HH:mm
// Use an async pre-save hook: throw an error to abort save on validation failures.
eventSchema.pre<EventDoc>("save", async function (this: EventDoc) {
  if (this.isModified("title")) {
    // Create a URL-friendly slug from title
    this.slug = slugify(this.title);
  }

  if (this.isModified("date")) {
    // Normalize and validate date
    this.date = normalizeDate(this.date);
  }

  if (this.isModified("time")) {
    // Normalize and validate time
    this.time = normalizeTime(this.time);
  }
});

// Ensure slug uniqueness at the database level
eventSchema.index({ slug: 1 }, { unique: true });

// Add a convenience builder for type-safe creation
// Add a builder using `this` so we don't reference the model before declaration
eventSchema.statics.build = function (this: EventModel, attrs: EventAttrs) {
  return new this(attrs) as EventDoc;
};

// Use existing model if present (prevents OverwriteModelError in dev)
const Event =
  (mongoose.models.Event as EventModel) ||
  mongoose.model<EventDoc, EventModel>("Event", eventSchema);

export default Event;
