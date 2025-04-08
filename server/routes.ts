import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertProjectSchema, insertProjectTaskSchema, insertEstimateSchema, insertEstimateItemSchema, insertActivitySchema, insertFileSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // API routes
  // Clients API
  app.get("/api/clients", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const clients = await storage.getClients(req.user.id);
      res.json(clients);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/clients/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const client = await storage.getClient(parseInt(req.params.id));
      if (!client) return res.status(404).send("Client not found");
      
      // Only allow access to own clients
      if (client.userId !== req.user.id) return res.sendStatus(403);
      
      res.json(client);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/clients", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Validate request body
      const clientData = insertClientSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const client = await storage.createClient(clientData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.id,
        clientId: client.id,
        type: "client_created",
        description: `Client ${client.name} was created`
      });
      
      res.status(201).json(client);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      next(err);
    }
  });

  app.put("/api/clients/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const clientId = parseInt(req.params.id);
      const existingClient = await storage.getClient(clientId);
      
      if (!existingClient) return res.status(404).send("Client not found");
      
      // Only allow updating own clients
      if (existingClient.userId !== req.user.id) return res.sendStatus(403);
      
      const client = await storage.updateClient(clientId, req.body);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.id,
        clientId: clientId,
        type: "client_updated",
        description: `Client ${client?.name} was updated`
      });
      
      res.json(client);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/clients/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClient(clientId);
      
      if (!client) return res.status(404).send("Client not found");
      
      // Only allow deleting own clients
      if (client.userId !== req.user.id) return res.sendStatus(403);
      
      // Delete associated projects first
      const projects = await storage.getProjectsByClient(clientId);
      for (const project of projects) {
        await storage.deleteProject(project.id);
      }
      
      const success = await storage.deleteClient(clientId);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.id,
        type: "client_deleted",
        description: `Client ${client.name} was deleted`
      });
      
      res.json({ success });
    } catch (err) {
      next(err);
    }
  });

  // Projects API
  app.get("/api/projects", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      
      let projects;
      if (clientId) {
        // Check if client belongs to user
        const client = await storage.getClient(clientId);
        if (!client || client.userId !== req.user.id) return res.sendStatus(403);
        
        projects = await storage.getProjectsByClient(clientId);
      } else {
        projects = await storage.getProjects(req.user.id);
      }
      
      res.json(projects);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/projects/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).send("Project not found");
      
      // Only allow access to own projects
      if (project.userId !== req.user.id) return res.sendStatus(403);
      
      res.json(project);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/projects", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Validate client ownership
      const client = await storage.getClient(req.body.clientId);
      if (!client || client.userId !== req.user.id) return res.sendStatus(403);
      
      // Validate request body
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const project = await storage.createProject(projectData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.id,
        projectId: project.id,
        clientId: project.clientId,
        type: "project_created",
        description: `Project ${project.name} was created`
      });
      
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      next(err);
    }
  });

  app.put("/api/projects/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.id);
      const existingProject = await storage.getProject(projectId);
      
      if (!existingProject) return res.status(404).send("Project not found");
      
      // Only allow updating own projects
      if (existingProject.userId !== req.user.id) return res.sendStatus(403);
      
      const project = await storage.updateProject(projectId, req.body);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.id,
        projectId: projectId,
        clientId: existingProject.clientId,
        type: "project_updated",
        description: `Project ${project?.name} was updated`
      });
      
      res.json(project);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/projects/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) return res.status(404).send("Project not found");
      
      // Only allow deleting own projects
      if (project.userId !== req.user.id) return res.sendStatus(403);
      
      const success = await storage.deleteProject(projectId);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.id,
        clientId: project.clientId,
        type: "project_deleted",
        description: `Project ${project.name} was deleted`
      });
      
      res.json({ success });
    } catch (err) {
      next(err);
    }
  });

  // Client view access
  app.get("/api/project-view/:uuid", async (req, res, next) => {
    try {
      const project = await storage.getProjectByUuid(req.params.uuid);
      if (!project) return res.status(404).send("Project not found");
      
      // Get client info
      const client = await storage.getClient(project.clientId);
      
      // Get tasks
      const tasks = await storage.getProjectTasks(project.id);
      
      // Get files
      const files = await storage.getFiles(project.id);
      
      // Get estimates
      const estimates = await storage.getEstimatesByProject(project.id);
      
      // Get activities
      const activities = await storage.getActivitiesByProject(project.id);
      
      res.json({
        project,
        client,
        tasks,
        files,
        estimates,
        activities
      });
    } catch (err) {
      next(err);
    }
  });

  // Project Tasks API
  app.get("/api/projects/:projectId/tasks", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) return res.status(404).send("Project not found");
      
      // Only allow access to own projects
      if (project.userId !== req.user.id) return res.sendStatus(403);
      
      const tasks = await storage.getProjectTasks(projectId);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/projects/:projectId/tasks", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) return res.status(404).send("Project not found");
      
      // Only allow access to own projects
      if (project.userId !== req.user.id) return res.sendStatus(403);
      
      // Validate request body
      const taskData = insertProjectTaskSchema.parse({
        ...req.body,
        projectId
      });
      
      const task = await storage.createProjectTask(taskData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.id,
        projectId: projectId,
        clientId: project.clientId,
        type: "task_created",
        description: `Task "${task.name}" was added to project ${project.name}`
      });
      
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      next(err);
    }
  });

  app.put("/api/tasks/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getProjectTask(taskId);
      
      if (!task) return res.status(404).send("Task not found");
      
      // Verify project ownership
      const project = await storage.getProject(task.projectId);
      if (!project || project.userId !== req.user.id) return res.sendStatus(403);
      
      const updatedTask = await storage.updateProjectTask(taskId, req.body);
      
      // If task status changed to completed, log activity
      if (req.body.status === "completed" && task.status !== "completed") {
        await storage.createActivity({
          userId: req.user.id,
          projectId: task.projectId,
          clientId: project.clientId,
          type: "task_completed",
          description: `Task "${task.name}" was completed`
        });
      } else {
        await storage.createActivity({
          userId: req.user.id,
          projectId: task.projectId,
          clientId: project.clientId,
          type: "task_updated",
          description: `Task "${task.name}" was updated`
        });
      }
      
      res.json(updatedTask);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/tasks/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getProjectTask(taskId);
      
      if (!task) return res.status(404).send("Task not found");
      
      // Verify project ownership
      const project = await storage.getProject(task.projectId);
      if (!project || project.userId !== req.user.id) return res.sendStatus(403);
      
      const success = await storage.deleteProjectTask(taskId);
      
      await storage.createActivity({
        userId: req.user.id,
        projectId: task.projectId,
        clientId: project.clientId,
        type: "task_deleted",
        description: `Task "${task.name}" was deleted`
      });
      
      res.json({ success });
    } catch (err) {
      next(err);
    }
  });

  // Files API
  app.get("/api/projects/:projectId/files", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) return res.status(404).send("Project not found");
      
      // Only allow access to own projects
      if (project.userId !== req.user.id) return res.sendStatus(403);
      
      const files = await storage.getFiles(projectId);
      res.json(files);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/projects/:projectId/files", upload.single('file'), async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) return res.status(404).send("Project not found");
      
      // Only allow access to own projects
      if (project.userId !== req.user.id) return res.sendStatus(403);
      
      if (!req.file) {
        return res.status(400).send("No file uploaded");
      }
      
      // Create file record
      const fileData = insertFileSchema.parse({
        userId: req.user.id,
        projectId,
        name: req.body.name || req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        path: req.file.path
      });
      
      const file = await storage.createFile(fileData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.id,
        projectId: projectId,
        clientId: project.clientId,
        type: "file_uploaded",
        description: `File "${file.name}" was uploaded to project ${project.name}`
      });
      
      res.status(201).json(file);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      next(err);
    }
  });

  app.get("/api/files/:id", async (req, res, next) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) return res.status(404).send("File not found");
      
      // If user is authenticated, check ownership
      if (req.isAuthenticated()) {
        if (file.userId !== req.user.id) {
          return res.sendStatus(403);
        }
      } else {
        // If not authenticated, check if the project UUID is in the query for public access
        const projectUuid = req.query.uuid as string;
        if (!projectUuid) return res.sendStatus(401);
        
        const project = await storage.getProjectByUuid(projectUuid);
        if (!project || project.id !== file.projectId) {
          return res.sendStatus(403);
        }
      }
      
      res.download(file.path, file.name);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/files/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) return res.status(404).send("File not found");
      
      // Verify ownership
      if (file.userId !== req.user.id) return res.sendStatus(403);
      
      // Get project and client for activity log
      const project = await storage.getProject(file.projectId);
      
      // Delete file from filesystem
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
      
      const success = await storage.deleteFile(fileId);
      
      await storage.createActivity({
        userId: req.user.id,
        projectId: file.projectId,
        clientId: project?.clientId,
        type: "file_deleted",
        description: `File "${file.name}" was deleted`
      });
      
      res.json({ success });
    } catch (err) {
      next(err);
    }
  });

  // Estimates API
  app.get("/api/estimates", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      let estimates;
      if (projectId) {
        // Check if project belongs to user
        const project = await storage.getProject(projectId);
        if (!project || project.userId !== req.user.id) return res.sendStatus(403);
        
        estimates = await storage.getEstimatesByProject(projectId);
      } else {
        estimates = await storage.getEstimates(req.user.id);
      }
      
      res.json(estimates);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/estimates/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const estimateId = parseInt(req.params.id);
      const estimate = await storage.getEstimate(estimateId);
      
      if (!estimate) return res.status(404).send("Estimate not found");
      
      // Only allow access to own estimates
      if (estimate.userId !== req.user.id) return res.sendStatus(403);
      
      // Get estimate items
      const items = await storage.getEstimateItems(estimateId);
      
      res.json({ ...estimate, items });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/estimates", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Validate project ownership
      const project = await storage.getProject(req.body.projectId);
      if (!project || project.userId !== req.user.id) return res.sendStatus(403);
      
      // Validate client ownership
      const client = await storage.getClient(req.body.clientId);
      if (!client || client.userId !== req.user.id) return res.sendStatus(403);
      
      // Validate request body
      const estimateData = insertEstimateSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const estimate = await storage.createEstimate(estimateData);
      
      // Create estimate items if provided
      const items = [];
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const itemData = insertEstimateItemSchema.parse({
            ...item,
            estimateId: estimate.id
          });
          
          const newItem = await storage.createEstimateItem(itemData);
          items.push(newItem);
        }
      }
      
      // Log activity
      await storage.createActivity({
        userId: req.user.id,
        projectId: project.id,
        clientId: project.clientId,
        type: "estimate_created",
        description: `Estimate "${estimate.title}" was created for project ${project.name}`
      });
      
      res.status(201).json({ ...estimate, items });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      next(err);
    }
  });

  app.put("/api/estimates/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const estimateId = parseInt(req.params.id);
      const estimate = await storage.getEstimate(estimateId);
      
      if (!estimate) return res.status(404).send("Estimate not found");
      
      // Only allow updating own estimates
      if (estimate.userId !== req.user.id) return res.sendStatus(403);
      
      const updatedEstimate = await storage.updateEstimate(estimateId, req.body);
      
      // Update items if provided
      if (req.body.items && Array.isArray(req.body.items)) {
        // Get current items
        const currentItems = await storage.getEstimateItems(estimateId);
        
        // Process items
        for (const item of req.body.items) {
          if (item.id) {
            // Update existing item
            await storage.updateEstimateItem(item.id, item);
          } else {
            // Create new item
            const itemData = insertEstimateItemSchema.parse({
              ...item,
              estimateId
            });
            
            await storage.createEstimateItem(itemData);
          }
        }
        
        // Check for deleted items
        const updatedItemIds = req.body.items.map(item => item.id).filter(id => id);
        for (const currentItem of currentItems) {
          if (!updatedItemIds.includes(currentItem.id)) {
            await storage.deleteEstimateItem(currentItem.id);
          }
        }
      }
      
      // Get project for activity log
      const project = await storage.getProject(estimate.projectId);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.id,
        projectId: estimate.projectId,
        clientId: estimate.clientId,
        type: "estimate_updated",
        description: `Estimate "${estimate.title}" for project ${project?.name} was updated`
      });
      
      // Get updated items
      const items = await storage.getEstimateItems(estimateId);
      
      res.json({ ...updatedEstimate, items });
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/estimates/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const estimateId = parseInt(req.params.id);
      const estimate = await storage.getEstimate(estimateId);
      
      if (!estimate) return res.status(404).send("Estimate not found");
      
      // Only allow deleting own estimates
      if (estimate.userId !== req.user.id) return res.sendStatus(403);
      
      // Get project for activity log
      const project = await storage.getProject(estimate.projectId);
      
      // Delete all estimate items first
      const items = await storage.getEstimateItems(estimateId);
      for (const item of items) {
        await storage.deleteEstimateItem(item.id);
      }
      
      const success = await storage.deleteEstimate(estimateId);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.id,
        projectId: estimate.projectId,
        clientId: estimate.clientId,
        type: "estimate_deleted",
        description: `Estimate "${estimate.title}" for project ${project?.name} was deleted`
      });
      
      res.json({ success });
    } catch (err) {
      next(err);
    }
  });

  // Activities API
  app.get("/api/activities", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activities = await storage.getActivities(req.user.id, limit);
      res.json(activities);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/activities", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Validate request body
      const activityData = insertActivitySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      next(err);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
