import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, insertPartySchema, insertCropSchema, 
  insertStateSchema, insertCitySchema, insertTransactionSchema,
  insertCashRegisterSchema
} from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    user?: any;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'kcagri-trade-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

     const user = await storage.authenticateUser(email, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      res.json({ 
        message: "Login successful", 
        user: req.session.user 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me",  async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Dashboard metrics error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // States routes
  app.get("/api/states", requireAuth, async (req, res) => {
    try {
      const states = await storage.getStates();
      res.json(states);
    } catch (error) {
      console.error("Get states error:", error);
      res.status(500).json({ message: "Failed to fetch states" });
    }
  });

  app.post("/api/states", requireAuth, async (req, res) => {
    try {
      const validatedData = insertStateSchema.parse(req.body);
      const state = await storage.createState(validatedData);
      res.status(201).json(state);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create state error:", error);
      res.status(500).json({ message: "Failed to create state" });
    }
  });

  app.put("/api/states/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertStateSchema.partial().parse(req.body);
      const state = await storage.updateState(id, validatedData);
      res.json(state);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update state error:", error);
      res.status(500).json({ message: "Failed to update state" });
    }
  });

  app.delete("/api/states/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteState(id);
      res.json({ message: "State deleted successfully" });
    } catch (error) {
      console.error("Delete state error:", error);
      res.status(500).json({ message: "Failed to delete state" });
    }
  });

  // Cities routes
  app.get("/api/cities", requireAuth, async (req, res) => {
    try {
      const { stateId } = req.query;
      const cities = stateId 
        ? await storage.getCitiesByState(stateId as string)
        : await storage.getCities();
      res.json(cities);
    } catch (error) {
      console.error("Get cities error:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  app.post("/api/cities", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCitySchema.parse(req.body);
      const city = await storage.createCity(validatedData);
      res.status(201).json(city);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create city error:", error);
      res.status(500).json({ message: "Failed to create city" });
    }
  });
  app.put("/api/cities/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCitySchema.partial().parse(req.body);
      const state = await storage.updateCity(id, validatedData);
      res.json(state);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update state error:", error);
      res.status(500).json({ message: "Failed to update state" });
    }
  });
  // Parties routes
  app.get("/api/parties", requireAuth, async (req, res) => {
    try {
      const parties = await storage.getParties();
      res.json(parties);
    } catch (error) {
      console.error("Get parties error:", error);
      res.status(500).json({ message: "Failed to fetch parties" });
    }
  });

  app.post("/api/parties", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPartySchema.parse(req.body);
      const party = await storage.createParty(validatedData);
      res.status(201).json(party);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create party error:", error);
      res.status(500).json({ message: "Failed to create party" });
    }
  });

  app.put("/api/parties/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertPartySchema.partial().parse(req.body);
      const party = await storage.updateParty(id, validatedData);
      res.json(party);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update party error:", error);
      res.status(500).json({ message: "Failed to update party" });
    }
  });

  app.delete("/api/parties/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteParty(id);
      res.json({ message: "Party deleted successfully" });
    } catch (error) {
      console.error("Delete party error:", error);
      res.status(500).json({ message: "Failed to delete party" });
    }
  });

  app.get("/api/parties/with-balance", requireAuth, async (req, res) => {
    try {
      const parties = await storage.getPartiesWithBalance();
      res.json(parties);
    } catch (error) {
      console.error("Get parties with balance error:", error);
      res.status(500).json({ message: "Failed to fetch parties with balance" });
    }
  });

  // Crops routes
  app.get("/api/crops", requireAuth, async (req, res) => {
    try {
      const crops = await storage.getCrops();
      res.json(crops);
    } catch (error) {
      console.error("Get crops error:", error);
      res.status(500).json({ message: "Failed to fetch crops" });
    }
  });

  app.post("/api/crops", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCropSchema.parse(req.body);
      const crop = await storage.createCrop(validatedData);
      res.status(201).json(crop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create crop error:", error);
      res.status(500).json({ message: "Failed to create crop" });
    }
  });

  app.put("/api/crops/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCropSchema.partial().parse(req.body);
      const crop = await storage.updateCrop(id, validatedData);
      res.json(crop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update crop error:", error);
      res.status(500).json({ message: "Failed to update crop" });
    }
  });

  app.delete("/api/crops/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCrop(id);
      res.json({ message: "Crop deleted successfully" });
    } catch (error) {
      console.error("Delete crop error:", error);
      res.status(500).json({ message: "Failed to delete crop" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const { type, partyId, cropId } = req.query;
      let transactions;
      
      if (type) {
        transactions = await storage.getTransactionsByType(type as string);
      } else if (partyId) {
        transactions = await storage.getTransactionsByParty(partyId as string);
      } else if (cropId) {
        transactions = await storage.getTransactionsByCrop(cropId as string);
      } else {
        transactions = await storage.getTransactions();
      }
      
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      // Check if it's an inventory validation error
      if (error instanceof Error && (error.message.includes('Insufficient stock') || error.message.includes('No inventory record'))) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Create transaction error:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.put("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, validatedData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      // Check if it's an inventory validation error
      if (error instanceof Error && (error.message.includes('Insufficient stock') || error.message.includes('No inventory record'))) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Update transaction error:", error);
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTransaction(id);
      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.error("Delete transaction error:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  app.post("/api/transactions/:id/restore", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.restoreTransaction(id);
      res.json({ message: "Transaction restored successfully" });
    } catch (error) {
      console.error("Restore transaction error:", error);
      res.status(500).json({ message: "Failed to restore transaction" });
    }
  });

  app.delete("/api/transactions/:id/permanent", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.permanentlyDeleteTransaction(id);
      res.json({ message: "Transaction permanently deleted" });
    } catch (error) {
      console.error("Permanent delete transaction error:", error);
      res.status(500).json({ message: "Failed to permanently delete transaction" });
    }
  });

  app.get("/api/transactions/deleted/all", requireAuth, async (req, res) => {
    try {
      const deletedTransactions = await storage.getDeletedTransactions();
      res.json(deletedTransactions);
    } catch (error) {
      console.error("Get deleted transactions error:", error);
      res.status(500).json({ message: "Failed to fetch deleted transactions" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", requireAuth, async (req, res) => {
    try {
      const inventory = await storage.getInventoryWithCrops();
      res.json(inventory);
    } catch (error) {
      console.error("Get inventory error:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  // Cash register routes
  app.get("/api/cash-register", requireAuth, async (req, res) => {
    try {
      const entries = await storage.getCashRegister();
      res.json(entries);
    } catch (error) {
      console.error("Get cash register error:", error);
      res.status(500).json({ message: "Failed to fetch cash register" });
    }
  });

  app.post("/api/cash-register", requireAuth, async (req, res) => {
    try {
      const currentBalance = await storage.getCashBalance();
      const amount = parseFloat(req.body.amount);
      const newBalance = req.body.type === 'cash_in' 
        ? currentBalance + amount 
        : currentBalance - amount;

      const entryData: any = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : new Date(),
        balance: newBalance.toString(),
        reference: req.body.referenceNumber || req.body.reference
      };

      // Handle partyId - convert empty string to null for DB
      if ('partyId' in req.body) {
        entryData.partyId = req.body.partyId && req.body.partyId.trim() !== '' ? req.body.partyId : null;
      }

      const validatedData = insertCashRegisterSchema.parse(entryData);
      const entry = await storage.createCashEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create cash entry error:", error);
      res.status(500).json({ message: "Failed to create cash entry" });
    }
  });

  app.put("/api/cash-register/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const entryData: any = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
        reference: req.body.referenceNumber || req.body.reference
      };

      // Only handle partyId if it's explicitly in the request body
      if ('partyId' in req.body) {
        entryData.partyId = req.body.partyId && req.body.partyId.trim() !== '' ? req.body.partyId : null;
      }

      const validatedData = insertCashRegisterSchema.partial().parse(entryData);
      const entry = await storage.updateCashEntry(id, validatedData);
      
      if (!entry) {
        return res.status(404).json({ message: "Cash entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update cash entry error:", error);
      res.status(500).json({ message: "Failed to update cash entry" });
    }
  });

  app.get("/api/cash-register/balance", requireAuth, async (req, res) => {
    try {
      const balance = await storage.getCashBalance();
      res.json({ balance });
    } catch (error) {
      console.error("Get cash balance error:", error);
      res.status(500).json({ message: "Failed to fetch cash balance" });
    }
  });

  // Ledger routes
  app.get("/api/ledger/all/entries", requireAuth, async (req, res) => {
    try {
      const ledger = await storage.getAllLedgerEntries();
      res.json(ledger);
    } catch (error) {
      console.error("Get all ledger entries error:", error);
      res.status(500).json({ message: "Failed to fetch all ledger entries" });
    }
  });

  app.get("/api/ledger/:partyId", requireAuth, async (req, res) => {
    try {
      const { partyId } = req.params;
      const ledger = await storage.getPartyLedger(partyId);
      res.json(ledger);
    } catch (error) {
      console.error("Get party ledger error:", error);
      res.status(500).json({ message: "Failed to fetch party ledger" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
