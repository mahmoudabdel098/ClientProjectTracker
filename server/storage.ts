import { 
  users, clients, projects, projectTasks,
  files, estimates, estimateItems, activities,
  type User, type InsertUser, type Client, type InsertClient,
  type Project, type InsertProject, type ProjectTask, type InsertProjectTask,
  type File, type InsertFile, type Estimate, type InsertEstimate,
  type EstimateItem, type InsertEstimateItem, type Activity, type InsertActivity
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { v4 as uuidv4 } from 'uuid';

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Client methods
  getClients(userId: number): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Project methods
  getProjects(userId: number): Promise<Project[]>;
  getProjectsByClient(clientId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectByUuid(uuid: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Project tasks methods
  getProjectTasks(projectId: number): Promise<ProjectTask[]>;
  getProjectTask(id: number): Promise<ProjectTask | undefined>;
  createProjectTask(task: InsertProjectTask): Promise<ProjectTask>;
  updateProjectTask(id: number, task: Partial<ProjectTask>): Promise<ProjectTask | undefined>;
  deleteProjectTask(id: number): Promise<boolean>;

  // File methods
  getFiles(projectId: number): Promise<File[]>;
  getFile(id: number): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  deleteFile(id: number): Promise<boolean>;

  // Estimate methods
  getEstimates(userId: number): Promise<Estimate[]>;
  getEstimatesByProject(projectId: number): Promise<Estimate[]>;
  getEstimate(id: number): Promise<Estimate | undefined>;
  createEstimate(estimate: InsertEstimate): Promise<Estimate>;
  updateEstimate(id: number, estimate: Partial<Estimate>): Promise<Estimate | undefined>;
  deleteEstimate(id: number): Promise<boolean>;

  // Estimate items methods
  getEstimateItems(estimateId: number): Promise<EstimateItem[]>;
  createEstimateItem(item: InsertEstimateItem): Promise<EstimateItem>;
  updateEstimateItem(id: number, item: Partial<EstimateItem>): Promise<EstimateItem | undefined>;
  deleteEstimateItem(id: number): Promise<boolean>;

  // Activity methods
  getActivities(userId: number, limit?: number): Promise<Activity[]>;
  getActivitiesByProject(projectId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  sessionStore: any; // Uso di any per evitare problemi con il tipo SessionStore
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private projects: Map<number, Project>;
  private projectTasks: Map<number, ProjectTask>;
  private files: Map<number, File>;
  private estimates: Map<number, Estimate>;
  private estimateItems: Map<number, EstimateItem>;
  private activities: Map<number, Activity>;

  currentUserId: number;
  currentClientId: number;
  currentProjectId: number;
  currentTaskId: number;
  currentFileId: number;
  currentEstimateId: number;
  currentEstimateItemId: number;
  currentActivityId: number;
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.projects = new Map();
    this.projectTasks = new Map();
    this.files = new Map();
    this.estimates = new Map();
    this.estimateItems = new Map();
    this.activities = new Map();

    this.currentUserId = 1;
    this.currentClientId = 1;
    this.currentProjectId = 1;
    this.currentTaskId = 1;
    this.currentFileId = 1;
    this.currentEstimateId = 1;
    this.currentEstimateItemId = 1;
    this.currentActivityId = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, planType: "free" };
    this.users.set(id, user);
    return user;
  }

  // Client methods
  async getClients(userId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(
      (client) => client.userId === userId
    );
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const client: Client = { 
      ...insertClient, 
      id,
      createdAt: new Date()
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, clientUpdate: Partial<Client>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;

    const updatedClient = { ...client, ...clientUpdate };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Project methods
  async getProjects(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId
    );
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.clientId === clientId
    );
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectByUuid(uuid: string): Promise<Project | undefined> {
    return Array.from(this.projects.values()).find(
      (project) => project.uuid === uuid
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { 
      ...insertProject, 
      id,
      progress: 0,
      uuid: uuidv4(),
      createdAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = { ...project, ...projectUpdate };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Project Task methods
  async getProjectTasks(projectId: number): Promise<ProjectTask[]> {
    return Array.from(this.projectTasks.values()).filter(
      (task) => task.projectId === projectId
    );
  }

  async getProjectTask(id: number): Promise<ProjectTask | undefined> {
    return this.projectTasks.get(id);
  }

  async createProjectTask(insertTask: InsertProjectTask): Promise<ProjectTask> {
    const id = this.currentTaskId++;
    const task: ProjectTask = { 
      ...insertTask, 
      id,
      createdAt: new Date()
    };
    this.projectTasks.set(id, task);
    return task;
  }

  async updateProjectTask(id: number, taskUpdate: Partial<ProjectTask>): Promise<ProjectTask | undefined> {
    const task = this.projectTasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...taskUpdate };
    this.projectTasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteProjectTask(id: number): Promise<boolean> {
    return this.projectTasks.delete(id);
  }

  // File methods
  async getFiles(projectId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.projectId === projectId
    );
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.currentFileId++;
    const file: File = { 
      ...insertFile, 
      id,
      createdAt: new Date()
    };
    this.files.set(id, file);
    return file;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  // Estimate methods
  async getEstimates(userId: number): Promise<Estimate[]> {
    return Array.from(this.estimates.values()).filter(
      (estimate) => estimate.userId === userId
    );
  }

  async getEstimatesByProject(projectId: number): Promise<Estimate[]> {
    return Array.from(this.estimates.values()).filter(
      (estimate) => estimate.projectId === projectId
    );
  }

  async getEstimate(id: number): Promise<Estimate | undefined> {
    return this.estimates.get(id);
  }

  async createEstimate(insertEstimate: InsertEstimate): Promise<Estimate> {
    const id = this.currentEstimateId++;
    const estimate: Estimate = { 
      ...insertEstimate, 
      id,
      createdAt: new Date()
    };
    this.estimates.set(id, estimate);
    return estimate;
  }

  async updateEstimate(id: number, estimateUpdate: Partial<Estimate>): Promise<Estimate | undefined> {
    const estimate = this.estimates.get(id);
    if (!estimate) return undefined;

    const updatedEstimate = { ...estimate, ...estimateUpdate };
    this.estimates.set(id, updatedEstimate);
    return updatedEstimate;
  }

  async deleteEstimate(id: number): Promise<boolean> {
    return this.estimates.delete(id);
  }

  // Estimate items methods
  async getEstimateItems(estimateId: number): Promise<EstimateItem[]> {
    return Array.from(this.estimateItems.values()).filter(
      (item) => item.estimateId === estimateId
    );
  }

  async createEstimateItem(insertItem: InsertEstimateItem): Promise<EstimateItem> {
    const id = this.currentEstimateItemId++;
    const item: EstimateItem = { 
      ...insertItem, 
      id 
    };
    this.estimateItems.set(id, item);
    return item;
  }

  async updateEstimateItem(id: number, itemUpdate: Partial<EstimateItem>): Promise<EstimateItem | undefined> {
    const item = this.estimateItems.get(id);
    if (!item) return undefined;

    const updatedItem = { ...item, ...itemUpdate };
    this.estimateItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteEstimateItem(id: number): Promise<boolean> {
    return this.estimateItems.delete(id);
  }

  // Activity methods
  async getActivities(userId: number, limit: number = 20): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getActivitiesByProject(projectId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = { 
      ...insertActivity, 
      id,
      createdAt: new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }
}

import { db } from "./db";
import connectPg from "connect-pg-simple";
import { eq, desc, and } from "drizzle-orm";
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using 'any' to bypass TS error

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userWithDefaults = {
      ...insertUser,
      planType: insertUser.planType || "free"
    };
    const [user] = await db
      .insert(users)
      .values(userWithDefaults)
      .returning();
    return user;
  }

  // Client methods
  async getClients(userId: number): Promise<Client[]> {
    return db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(desc(clients.id));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const clientWithDefaults = {
      ...insertClient,
      createdAt: new Date()
    };
    const [client] = await db
      .insert(clients)
      .values(clientWithDefaults)
      .returning();
    return client;
  }

  async updateClient(id: number, clientUpdate: Partial<Client>): Promise<Client | undefined> {
    const [updated] = await db
      .update(clients)
      .set(clientUpdate)
      .where(eq(clients.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    await db
      .delete(clients)
      .where(eq(clients.id, id));
    return true;
  }

  // Project methods
  async getProjects(userId: number): Promise<Project[]> {
    return db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.id));
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return db
      .select()
      .from(projects)
      .where(eq(projects.clientId, clientId))
      .orderBy(desc(projects.id));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectByUuid(uuid: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.uuid, uuid));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const projectWithDefaults = {
      ...insertProject,
      uuid: uuidv4(),
      progress: 0,
      createdAt: new Date()
    };
    const [project] = await db
      .insert(projects)
      .values(projectWithDefaults)
      .returning();
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set(projectUpdate)
      .where(eq(projects.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    await db
      .delete(projects)
      .where(eq(projects.id, id));
    return true;
  }

  // Project tasks methods
  async getProjectTasks(projectId: number): Promise<ProjectTask[]> {
    return db
      .select()
      .from(projectTasks)
      .where(eq(projectTasks.projectId, projectId))
      .orderBy(desc(projectTasks.id));
  }

  async getProjectTask(id: number): Promise<ProjectTask | undefined> {
    const [task] = await db
      .select()
      .from(projectTasks)
      .where(eq(projectTasks.id, id));
    return task || undefined;
  }

  async createProjectTask(insertTask: InsertProjectTask): Promise<ProjectTask> {
    const taskWithDefaults = {
      ...insertTask,
      createdAt: new Date()
    };
    const [task] = await db
      .insert(projectTasks)
      .values(taskWithDefaults)
      .returning();
    return task;
  }

  async updateProjectTask(id: number, taskUpdate: Partial<ProjectTask>): Promise<ProjectTask | undefined> {
    const [updated] = await db
      .update(projectTasks)
      .set(taskUpdate)
      .where(eq(projectTasks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProjectTask(id: number): Promise<boolean> {
    await db
      .delete(projectTasks)
      .where(eq(projectTasks.id, id));
    return true;
  }

  // File methods
  async getFiles(projectId: number): Promise<File[]> {
    return db
      .select()
      .from(files)
      .where(eq(files.projectId, projectId))
      .orderBy(desc(files.id));
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.id, id));
    return file || undefined;
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const fileWithDefaults = {
      ...insertFile,
      createdAt: new Date()
    };
    const [file] = await db
      .insert(files)
      .values(fileWithDefaults)
      .returning();
    return file;
  }

  async deleteFile(id: number): Promise<boolean> {
    await db
      .delete(files)
      .where(eq(files.id, id));
    return true;
  }

  // Estimate methods
  async getEstimates(userId: number): Promise<Estimate[]> {
    return db
      .select()
      .from(estimates)
      .where(eq(estimates.userId, userId))
      .orderBy(desc(estimates.id));
  }

  async getEstimatesByProject(projectId: number): Promise<Estimate[]> {
    return db
      .select()
      .from(estimates)
      .where(eq(estimates.projectId, projectId))
      .orderBy(desc(estimates.id));
  }

  async getEstimate(id: number): Promise<Estimate | undefined> {
    const [estimate] = await db
      .select()
      .from(estimates)
      .where(eq(estimates.id, id));
    return estimate || undefined;
  }

  async createEstimate(insertEstimate: InsertEstimate): Promise<Estimate> {
    const estimateWithDefaults = {
      ...insertEstimate,
      createdAt: new Date()
    };
    const [estimate] = await db
      .insert(estimates)
      .values(estimateWithDefaults)
      .returning();
    return estimate;
  }

  async updateEstimate(id: number, estimateUpdate: Partial<Estimate>): Promise<Estimate | undefined> {
    const [updated] = await db
      .update(estimates)
      .set(estimateUpdate)
      .where(eq(estimates.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEstimate(id: number): Promise<boolean> {
    await db
      .delete(estimates)
      .where(eq(estimates.id, id));
    return true;
  }

  // Estimate items methods
  async getEstimateItems(estimateId: number): Promise<EstimateItem[]> {
    return db
      .select()
      .from(estimateItems)
      .where(eq(estimateItems.estimateId, estimateId))
      .orderBy(desc(estimateItems.id));
  }

  async createEstimateItem(insertItem: InsertEstimateItem): Promise<EstimateItem> {
    const [item] = await db
      .insert(estimateItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateEstimateItem(id: number, itemUpdate: Partial<EstimateItem>): Promise<EstimateItem | undefined> {
    const [updated] = await db
      .update(estimateItems)
      .set(itemUpdate)
      .where(eq(estimateItems.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEstimateItem(id: number): Promise<boolean> {
    await db
      .delete(estimateItems)
      .where(eq(estimateItems.id, id));
    return true;
  }

  // Activity methods
  async getActivities(userId: number, limit: number = 20): Promise<Activity[]> {
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getActivitiesByProject(projectId: number): Promise<Activity[]> {
    return db
      .select()
      .from(activities)
      .where(eq(activities.projectId, projectId))
      .orderBy(desc(activities.createdAt));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const activityWithDefaults = {
      ...insertActivity,
      createdAt: new Date()
    };
    const [activity] = await db
      .insert(activities)
      .values(activityWithDefaults)
      .returning();
    return activity;
  }
}

export const storage = new DatabaseStorage();
