import { pgTable, text, serial, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  planType: text("plan_type").default("free"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
});

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).pick({
  userId: true,
  name: true,
  email: true,
  phone: true,
  company: true,
});

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clientId: integer("client_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("new"),
  progress: integer("progress").default(0),
  dueDate: timestamp("due_date"),
  uuid: uuid("uuid").defaultRandom().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  userId: true,
  clientId: true,
  name: true,
  description: true,
  status: true,
  dueDate: true,
});

// Project tasks
export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("pending"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectTaskSchema = createInsertSchema(projectTasks).pick({
  projectId: true,
  name: true,
  description: true,
  status: true,
  dueDate: true,
});

// Files schema
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  path: text("path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFileSchema = createInsertSchema(files).pick({
  userId: true,
  projectId: true,
  name: true,
  fileType: true,
  fileSize: true,
  path: true,
});

// Estimates schema
export const estimates = pgTable("estimates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id").notNull(),
  clientId: integer("client_id").notNull(),
  title: text("title").notNull(),
  status: text("status").default("draft"),
  totalAmount: integer("total_amount").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEstimateSchema = createInsertSchema(estimates).pick({
  userId: true,
  projectId: true,
  clientId: true,
  title: true,
  status: true,
  totalAmount: true,
});

// Estimate items schema
export const estimateItems = pgTable("estimate_items", {
  id: serial("id").primaryKey(),
  estimateId: integer("estimate_id").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").default(1),
  price: integer("price").notNull(),
});

export const insertEstimateItemSchema = createInsertSchema(estimateItems).pick({
  estimateId: true,
  description: true,
  quantity: true,
  price: true,
});

// Activities schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id"),
  clientId: integer("client_id"),
  type: text("type").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  projectId: true,
  clientId: true,
  type: true,
  description: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertProjectTask = z.infer<typeof insertProjectTaskSchema>;
export type ProjectTask = typeof projectTasks.$inferSelect;

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export type InsertEstimate = z.infer<typeof insertEstimateSchema>;
export type Estimate = typeof estimates.$inferSelect;

export type InsertEstimateItem = z.infer<typeof insertEstimateItemSchema>;
export type EstimateItem = typeof estimateItems.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
