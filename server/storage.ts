import { users, files, osSettings, type User, type InsertUser, type File, type InsertFile, type OsSettings, type InsertOsSettings } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserFiles(userId: number, parentId?: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, updates: Partial<InsertFile>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  getUserSettings(userId: number): Promise<OsSettings | undefined>;
  updateUserSettings(userId: number, settings: Partial<InsertOsSettings>): Promise<OsSettings>;
  factoryReset(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserFiles(userId: number, parentId?: number): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(
        parentId 
          ? eq(files.parentId, parentId)
          : eq(files.userId, userId)
      );
  }

  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db
      .insert(files)
      .values(file)
      .returning();
    return newFile;
  }

  async updateFile(id: number, updates: Partial<InsertFile>): Promise<File | undefined> {
    const [updatedFile] = await db
      .update(files)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return updatedFile || undefined;
  }

  async deleteFile(id: number): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id));
    return result.rowCount > 0;
  }

  async getUserSettings(userId: number): Promise<OsSettings | undefined> {
    const [settings] = await db
      .select()
      .from(osSettings)
      .where(eq(osSettings.userId, userId));
    return settings || undefined;
  }

  async updateUserSettings(userId: number, settingsData: Partial<InsertOsSettings>): Promise<OsSettings> {
    const existing = await this.getUserSettings(userId);
    
    if (existing) {
      const [updated] = await db
        .update(osSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(osSettings.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(osSettings)
        .values({ userId, ...settingsData })
        .returning();
      return created;
    }
  }

  async factoryReset(): Promise<void> {
    try {
      // Delete all data from all tables while preserving table structure
      await db.delete(osSettings);
      await db.delete(files);  
      await db.delete(users);
      console.log('Database factory reset completed successfully');
    } catch (error) {
      console.error('Factory reset error:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
