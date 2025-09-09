import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const files: any = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  type: text("type").notNull(), // 'file' or 'folder'
  content: text("content"),
  size: integer("size").default(0),
  userId: integer("user_id").notNull(),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const osSettings = pgTable("os_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  theme: text("theme").default("dark").notNull(),
  wallpaper: text("wallpaper").default("default").notNull(),
  showDesktopIcons: boolean("show_desktop_icons").default(true).notNull(),
  soundEffects: boolean("sound_effects").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  files: many(files),
  settings: one(osSettings),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
  parent: one(files, {
    fields: [files.parentId],
    references: [files.id],
  }),
  children: many(files),
}));

export const osSettingsRelations = relations(osSettings, ({ one }) => ({
  user: one(users, {
    fields: [osSettings.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFileSchema = createInsertSchema(files).pick({
  name: true,
  path: true,
  type: true,
  content: true,
  size: true,
  userId: true,
  parentId: true,
});

export const insertOsSettingsSchema = createInsertSchema(osSettings).pick({
  userId: true,
  theme: true,
  wallpaper: true,
  showDesktopIcons: true,
  soundEffects: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
export type InsertOsSettings = z.infer<typeof insertOsSettingsSchema>;
export type OsSettings = typeof osSettings.$inferSelect;
