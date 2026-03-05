import { pgTable, uuid, varchar, timestamp, text, integer, jsonb } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  level: varchar("level", { length: 50 }),
  description: text("description"),
});

export const chapters = pgTable("chapters", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  order: integer("order").notNull(), // Sorrendezéshez
});

export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  chapterId: uuid("chapter_id").references(() => chapters.id, { onDelete: 'cascade' }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  bunnyVideoId: varchar("bunny_video_id", { length: 100 }), // Bunny.net stream azonosító
  order: integer("order").notNull(), // Sorrendezéshez
});

export const userProgress = pgTable("user_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: 'cascade' }).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const exams = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: 'cascade' }), // Lehet kurzushoz kötött
  chapterId: uuid("chapter_id").references(() => chapters.id, { onDelete: 'cascade' }), // Vagy fejezethez kötött
  questions: jsonb("questions").notNull(), // Vizsgakérdések és válaszok listája JSON formátumban
  requiredScore: integer("required_score").notNull(), // Elvárt pontszám vagy százalék a megfeleléshez
});
