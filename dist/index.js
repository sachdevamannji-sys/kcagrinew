var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import session from "express-session";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  cashRegister: () => cashRegister,
  cashRegisterRelations: () => cashRegisterRelations,
  cities: () => cities,
  citiesRelations: () => citiesRelations,
  crops: () => crops,
  cropsRelations: () => cropsRelations,
  insertCashRegisterSchema: () => insertCashRegisterSchema,
  insertCitySchema: () => insertCitySchema,
  insertCropSchema: () => insertCropSchema,
  insertInventorySchema: () => insertInventorySchema,
  insertPartyLedgerSchema: () => insertPartyLedgerSchema,
  insertPartySchema: () => insertPartySchema,
  insertStateSchema: () => insertStateSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  inventory: () => inventory,
  inventoryRelations: () => inventoryRelations,
  parties: () => parties,
  partiesRelations: () => partiesRelations,
  partyLedger: () => partyLedger,
  partyLedgerRelations: () => partyLedgerRelations,
  partyTypeEnum: () => partyTypeEnum,
  paymentModeEnum: () => paymentModeEnum,
  paymentStatusEnum: () => paymentStatusEnum,
  states: () => states,
  statesRelations: () => statesRelations,
  transactionTypeEnum: () => transactionTypeEnum,
  transactions: () => transactions,
  transactionsRelations: () => transactionsRelations,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var partyTypeEnum = pgEnum("party_type", ["farmer", "buyer", "trader", "contractor", "thekedar", "company", "other"]);
var transactionTypeEnum = pgEnum("transaction_type", ["purchase", "sale", "expense", "cash_in", "cash_out"]);
var paymentModeEnum = pgEnum("payment_mode", ["cash", "credit", "bank_transfer", "cheque"]);
var paymentStatusEnum = pgEnum("payment_status", ["pending", "completed"]);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").default("admin"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var states = pgTable("states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  code: text("code"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var cities = pgTable("cities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  stateId: varchar("state_id").references(() => states.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var parties = pgTable("parties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").unique(),
  type: partyTypeEnum("type").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  gstNumber: text("gst_number"),
  aadharCard: text("aadhar_card"),
  address: text("address"),
  stateId: varchar("state_id").references(() => states.id),
  cityId: varchar("city_id").references(() => cities.id),
  openingBalance: decimal("opening_balance", { precision: 15, scale: 2 }).default("0"),
  balanceType: text("balance_type").default("credit"),
  // credit or debit
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var crops = pgTable("crops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  variety: text("variety"),
  category: text("category"),
  unit: text("unit").notNull().default("quintal"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: transactionTypeEnum("type").notNull(),
  date: timestamp("date").notNull(),
  invoiceNumber: text("invoice_number"),
  partyId: varchar("party_id").references(() => parties.id),
  cropId: varchar("crop_id").references(() => crops.id),
  quantity: decimal("quantity", { precision: 15, scale: 3 }),
  rate: decimal("rate", { precision: 15, scale: 2 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentMode: paymentModeEnum("payment_mode").default("cash"),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  quality: text("quality"),
  // Quality grade (A, B, C, etc.)
  notes: text("notes"),
  category: text("category"),
  // for expenses
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cropId: varchar("crop_id").references(() => crops.id).notNull(),
  openingStock: decimal("opening_stock", { precision: 15, scale: 3 }).default("0"),
  currentStock: decimal("current_stock", { precision: 15, scale: 3 }).default("0"),
  averageRate: decimal("average_rate", { precision: 15, scale: 2 }).default("0"),
  stockValue: decimal("stock_value", { precision: 15, scale: 2 }).default("0"),
  minStockLevel: decimal("min_stock_level", { precision: 15, scale: 3 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow()
});
var cashRegister = pgTable("cash_register", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  type: text("type").notNull(),
  // cash_in or cash_out
  description: text("description").notNull(),
  reference: text("reference"),
  // transaction id or reference
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull(),
  partyId: varchar("party_id").references(() => parties.id),
  createdAt: timestamp("created_at").defaultNow()
});
var partyLedger = pgTable("party_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partyId: varchar("party_id").references(() => parties.id).notNull(),
  transactionId: varchar("transaction_id").references(() => transactions.id),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  debit: decimal("debit", { precision: 15, scale: 2 }).default("0"),
  credit: decimal("credit", { precision: 15, scale: 2 }).default("0"),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var statesRelations = relations(states, ({ many }) => ({
  cities: many(cities),
  parties: many(parties)
}));
var citiesRelations = relations(cities, ({ one, many }) => ({
  state: one(states, {
    fields: [cities.stateId],
    references: [states.id]
  }),
  parties: many(parties)
}));
var partiesRelations = relations(parties, ({ one, many }) => ({
  state: one(states, {
    fields: [parties.stateId],
    references: [states.id]
  }),
  city: one(cities, {
    fields: [parties.cityId],
    references: [cities.id]
  }),
  transactions: many(transactions),
  ledgerEntries: many(partyLedger),
  cashEntries: many(cashRegister)
}));
var cropsRelations = relations(crops, ({ many }) => ({
  transactions: many(transactions),
  inventory: many(inventory)
}));
var transactionsRelations = relations(transactions, ({ one }) => ({
  party: one(parties, {
    fields: [transactions.partyId],
    references: [parties.id]
  }),
  crop: one(crops, {
    fields: [transactions.cropId],
    references: [crops.id]
  })
}));
var inventoryRelations = relations(inventory, ({ one }) => ({
  crop: one(crops, {
    fields: [inventory.cropId],
    references: [crops.id]
  })
}));
var partyLedgerRelations = relations(partyLedger, ({ one }) => ({
  party: one(parties, {
    fields: [partyLedger.partyId],
    references: [parties.id]
  }),
  transaction: one(transactions, {
    fields: [partyLedger.transactionId],
    references: [transactions.id]
  })
}));
var cashRegisterRelations = relations(cashRegister, ({ one }) => ({
  party: one(parties, {
    fields: [cashRegister.partyId],
    references: [parties.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertStateSchema = createInsertSchema(states).omit({
  id: true,
  createdAt: true
});
var insertCitySchema = createInsertSchema(cities).omit({
  id: true,
  createdAt: true
});
var insertPartySchema = createInsertSchema(parties).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCropSchema = createInsertSchema(crops).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  date: z.coerce.date()
});
var insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  updatedAt: true
});
var insertCashRegisterSchema = createInsertSchema(cashRegister).omit({
  id: true,
  createdAt: true
}).extend({
  date: z.coerce.date()
});
var insertPartyLedgerSchema = createInsertSchema(partyLedger).omit({
  id: true,
  createdAt: true
}).extend({
  date: z.coerce.date()
});

// server/db.ts
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import ws from "ws";
import dotenv from "dotenv";
dotenv.config();
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var databaseUrl = process.env.DATABASE_URL;
var isNeonDatabase = databaseUrl.includes("neon.tech") || databaseUrl.includes("neon.aws");
var pool;
var db;
if (isNeonDatabase) {
  neonConfig.webSocketConstructor = ws;
  const neonPool = new NeonPool({ connectionString: databaseUrl });
  pool = neonPool;
  db = drizzleNeon(neonPool, { schema: schema_exports });
  console.log("\u2705 Connected to Neon Serverless Database (WebSocket)");
} else {
  const pgPool = new PgPool({ connectionString: databaseUrl });
  pool = pgPool;
  db = drizzlePg(pgPool, { schema: schema_exports });
  console.log("\u2705 Connected to Local PostgreSQL Database (TCP)");
}

// server/storage.ts
import { eq, desc, and, sql as sql2, sum, count } from "drizzle-orm";
import bcrypt from "bcrypt";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(insertUser) {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db.insert(users).values({ ...insertUser, password: hashedPassword }).returning();
    return user;
  }
  async authenticateUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
  // State methods
  async getStates() {
    return await db.select().from(states).where(eq(states.isActive, true)).orderBy(states.name);
  }
  async getState(id) {
    const [state] = await db.select().from(states).where(eq(states.id, id));
    return state;
  }
  async createState(state) {
    const [newState] = await db.insert(states).values(state).returning();
    return newState;
  }
  async updateState(id, state) {
    const [updatedState] = await db.update(states).set(state).where(eq(states.id, id)).returning();
    return updatedState;
  }
  async deleteState(id) {
    await db.update(states).set({ isActive: false }).where(eq(states.id, id));
  }
  // City methods
  async getCities() {
    return await db.select().from(cities).where(eq(cities.isActive, true)).orderBy(cities.name);
  }
  async getCitiesByState(stateId) {
    return await db.select().from(cities).where(and(eq(cities.stateId, stateId), eq(cities.isActive, true))).orderBy(cities.name);
  }
  async getCity(id) {
    const [city] = await db.select().from(cities).where(eq(cities.id, id));
    return city;
  }
  async createCity(city) {
    const [newCity] = await db.insert(cities).values(city).returning();
    return newCity;
  }
  async updateCity(id, city) {
    const [updatedCity] = await db.update(cities).set(city).where(eq(cities.id, id)).returning();
    return updatedCity;
  }
  async deleteCity(id) {
    await db.update(cities).set({ isActive: false }).where(eq(cities.id, id));
  }
  // Party methods
  async getParties() {
    return await db.select().from(parties).where(eq(parties.isActive, true)).orderBy(parties.name);
  }
  async getParty(id) {
    const [party] = await db.select().from(parties).where(eq(parties.id, id));
    return party;
  }
  async createParty(party) {
    if (!party.code) {
      const count2 = await db.select({ count: sql2`count(*)` }).from(parties);
      party.code = `P${String(count2[0].count + 1).padStart(3, "0")}`;
    }
    const [newParty] = await db.insert(parties).values(party).returning();
    return newParty;
  }
  async updateParty(id, party) {
    const [updatedParty] = await db.update(parties).set({ ...party, updatedAt: /* @__PURE__ */ new Date() }).where(eq(parties.id, id)).returning();
    return updatedParty;
  }
  async deleteParty(id) {
    await db.update(parties).set({ isActive: false }).where(eq(parties.id, id));
  }
  async getPartiesWithBalance() {
    const latestLedgerSubquery = db.select({
      partyId: partyLedger.partyId,
      balance: partyLedger.balance,
      rn: sql2`ROW_NUMBER() OVER (PARTITION BY ${partyLedger.partyId} ORDER BY ${partyLedger.date} DESC)`.as("rn")
    }).from(partyLedger).as("latest_ledger");
    const result = await db.select({
      id: parties.id,
      name: parties.name,
      type: parties.type,
      phone: parties.phone,
      email: parties.email,
      openingBalance: parties.openingBalance,
      balanceType: parties.balanceType,
      totalBalance: sql2`COALESCE(${latestLedgerSubquery.balance}, ${parties.openingBalance}, '0')`.as("totalBalance")
    }).from(parties).leftJoin(
      latestLedgerSubquery,
      and(
        eq(parties.id, latestLedgerSubquery.partyId),
        eq(latestLedgerSubquery.rn, 1)
      )
    ).where(eq(parties.isActive, true)).orderBy(parties.name);
    return result;
  }
  // Crop methods
  async getCrops() {
    return await db.select().from(crops).where(eq(crops.isActive, true)).orderBy(crops.name);
  }
  async getCrop(id) {
    const [crop] = await db.select().from(crops).where(eq(crops.id, id));
    return crop;
  }
  async createCrop(crop) {
    const [newCrop] = await db.insert(crops).values(crop).returning();
    await db.insert(inventory).values({
      cropId: newCrop.id,
      openingStock: "0",
      currentStock: "0",
      averageRate: "0",
      stockValue: "0"
    });
    return newCrop;
  }
  async updateCrop(id, crop) {
    const [updatedCrop] = await db.update(crops).set({ ...crop, updatedAt: /* @__PURE__ */ new Date() }).where(eq(crops.id, id)).returning();
    return updatedCrop;
  }
  async deleteCrop(id) {
    await db.update(crops).set({ isActive: false }).where(eq(crops.id, id));
  }
  // Transaction methods
  async getTransactions() {
    return await db.select().from(transactions).where(eq(transactions.isActive, true)).orderBy(desc(transactions.date));
  }
  async getTransaction(id) {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }
  async createTransaction(transaction) {
    if (transaction.type === "sale" && transaction.cropId && transaction.quantity) {
      await this.validateSaleInventory(transaction.cropId, parseFloat(transaction.quantity));
    }
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    if ((transaction.type === "purchase" || transaction.type === "sale") && transaction.cropId && transaction.quantity) {
      await this.updateInventoryFromTransaction(transaction);
    }
    if (transaction.partyId) {
      await this.createLedgerEntryFromTransaction(newTransaction);
    }
    return newTransaction;
  }
  async updateTransaction(id, transaction) {
    const oldTransaction = await this.getTransaction(id);
    if (!oldTransaction) {
      throw new Error("Transaction not found");
    }
    const updatedData = { ...oldTransaction, ...transaction };
    if (updatedData.type === "sale" && updatedData.cropId && updatedData.quantity) {
      let stockAdjustment = 0;
      if (oldTransaction.cropId === updatedData.cropId) {
        if (oldTransaction.type === "sale") {
          stockAdjustment = parseFloat(oldTransaction.quantity || "0");
        } else if (oldTransaction.type === "purchase") {
          stockAdjustment = -parseFloat(oldTransaction.quantity || "0");
        }
      }
      await this.validateSaleInventory(updatedData.cropId, parseFloat(updatedData.quantity), stockAdjustment);
    }
    const [updatedTransaction] = await db.update(transactions).set({ ...transaction, updatedAt: /* @__PURE__ */ new Date() }).where(eq(transactions.id, id)).returning();
    if ((oldTransaction.type === "purchase" || oldTransaction.type === "sale") && oldTransaction.cropId && oldTransaction.quantity) {
      await this.reverseInventoryFromTransaction(oldTransaction);
    }
    if ((updatedTransaction.type === "purchase" || updatedTransaction.type === "sale") && updatedTransaction.cropId && updatedTransaction.quantity) {
      await this.updateInventoryFromTransaction(updatedTransaction);
    }
    if (oldTransaction) {
      const affectedParties = /* @__PURE__ */ new Set();
      if (oldTransaction.partyId) {
        await db.delete(partyLedger).where(eq(partyLedger.transactionId, id));
        affectedParties.add(oldTransaction.partyId);
      }
      if (updatedTransaction.partyId) {
        await this.createLedgerEntryFromTransaction(updatedTransaction);
        affectedParties.add(updatedTransaction.partyId);
      }
      for (const partyId of Array.from(affectedParties)) {
        await this.recalculateLedgerBalances(partyId);
      }
    }
    return updatedTransaction;
  }
  async deleteTransaction(id) {
    const transaction = await this.getTransaction(id);
    await db.update(transactions).set({ isActive: false }).where(eq(transactions.id, id));
    if (transaction && (transaction.type === "purchase" || transaction.type === "sale")) {
      if (transaction.cropId && transaction.quantity) {
        await this.reverseInventoryFromTransaction(transaction);
      }
    }
    if (transaction && transaction.partyId) {
      await db.delete(partyLedger).where(eq(partyLedger.transactionId, id));
      await this.recalculateLedgerBalances(transaction.partyId);
    }
  }
  async restoreTransaction(id) {
    await db.update(transactions).set({ isActive: true }).where(eq(transactions.id, id));
  }
  async permanentlyDeleteTransaction(id) {
    await db.delete(transactions).where(eq(transactions.id, id));
  }
  async getDeletedTransactions() {
    return await db.select().from(transactions).where(eq(transactions.isActive, false)).orderBy(desc(transactions.date));
  }
  async getTransactionsByType(type) {
    return await db.select({
      id: transactions.id,
      type: transactions.type,
      date: transactions.date,
      invoiceNumber: transactions.invoiceNumber,
      partyId: transactions.partyId,
      partyName: parties.name,
      cropId: transactions.cropId,
      cropName: crops.name,
      quantity: transactions.quantity,
      rate: transactions.rate,
      amount: transactions.amount,
      paymentMode: transactions.paymentMode,
      notes: transactions.notes,
      category: transactions.category,
      isActive: transactions.isActive,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt
    }).from(transactions).leftJoin(parties, eq(transactions.partyId, parties.id)).leftJoin(crops, eq(transactions.cropId, crops.id)).where(and(eq(transactions.type, type), eq(transactions.isActive, true))).orderBy(desc(transactions.date));
  }
  async getTransactionsByParty(partyId) {
    return await db.select().from(transactions).where(and(eq(transactions.partyId, partyId), eq(transactions.isActive, true))).orderBy(desc(transactions.date));
  }
  async getTransactionsByCrop(cropId) {
    return await db.select().from(transactions).where(and(eq(transactions.cropId, cropId), eq(transactions.isActive, true))).orderBy(desc(transactions.date));
  }
  // Inventory methods
  async getInventory() {
    return await db.select().from(inventory);
  }
  async getInventoryByCrop(cropId) {
    const [inv] = await db.select().from(inventory).where(eq(inventory.cropId, cropId));
    return inv;
  }
  async updateInventory(cropId, inventoryData) {
    const [updatedInventory] = await db.update(inventory).set({ ...inventoryData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(inventory.cropId, cropId)).returning();
    return updatedInventory;
  }
  async getInventoryWithCrops() {
    return await db.select({
      id: inventory.id,
      cropId: inventory.cropId,
      cropName: crops.name,
      variety: crops.variety,
      category: crops.category,
      unit: crops.unit,
      openingStock: inventory.openingStock,
      currentStock: inventory.currentStock,
      averageRate: inventory.averageRate,
      stockValue: inventory.stockValue,
      minStockLevel: inventory.minStockLevel
    }).from(inventory).leftJoin(crops, eq(inventory.cropId, crops.id)).where(eq(crops.isActive, true));
  }
  // Cash register methods
  async getCashRegister() {
    return await db.select().from(cashRegister).orderBy(desc(cashRegister.date));
  }
  async getCashEntry(id) {
    const [entry] = await db.select().from(cashRegister).where(eq(cashRegister.id, id));
    return entry;
  }
  async createCashEntry(entry) {
    const [newEntry] = await db.insert(cashRegister).values(entry).returning();
    if (newEntry.partyId) {
      await this.createLedgerEntryFromCashTransaction(newEntry);
    }
    return newEntry;
  }
  async updateCashEntry(id, entry) {
    const oldEntry = await this.getCashEntry(id);
    const [updatedEntry] = await db.update(cashRegister).set(entry).where(eq(cashRegister.id, id)).returning();
    await this.recalculateCashRegisterBalances();
    const affectedParties = /* @__PURE__ */ new Set();
    if (oldEntry?.partyId) {
      await db.delete(partyLedger).where(
        and(
          eq(partyLedger.partyId, oldEntry.partyId),
          sql2`${partyLedger.description} LIKE ${`%Ref: ${id}%`}`
        )
      );
      affectedParties.add(oldEntry.partyId);
    }
    if (updatedEntry.partyId) {
      await this.createLedgerEntryFromCashTransaction(updatedEntry);
      affectedParties.add(updatedEntry.partyId);
    }
    for (const partyId of Array.from(affectedParties)) {
      await this.recalculateLedgerBalances(partyId);
    }
    const finalEntry = await this.getCashEntry(id);
    return finalEntry;
  }
  async getCashBalance() {
    const result = await db.select({
      balance: sql2`COALESCE(MAX(balance), 0)`
    }).from(cashRegister);
    return parseFloat(result[0]?.balance || "0");
  }
  async recalculateCashRegisterBalances() {
    const allEntries = await db.select().from(cashRegister).orderBy(cashRegister.date);
    let runningBalance = 0;
    for (const entry of allEntries) {
      const amount = parseFloat(entry.amount);
      if (entry.type === "cash_in") {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }
      if (parseFloat(entry.balance) !== runningBalance) {
        await db.update(cashRegister).set({ balance: runningBalance.toString() }).where(eq(cashRegister.id, entry.id));
      }
    }
  }
  // Ledger methods
  async getPartyLedger(partyId) {
    return await db.select().from(partyLedger).where(eq(partyLedger.partyId, partyId)).orderBy(desc(partyLedger.date));
  }
  async getAllLedgerEntries() {
    return await db.select({
      id: partyLedger.id,
      partyId: partyLedger.partyId,
      partyName: parties.name,
      transactionId: partyLedger.transactionId,
      date: partyLedger.date,
      description: partyLedger.description,
      debit: partyLedger.debit,
      credit: partyLedger.credit,
      balance: partyLedger.balance,
      createdAt: partyLedger.createdAt
    }).from(partyLedger).leftJoin(parties, eq(partyLedger.partyId, parties.id)).orderBy(desc(partyLedger.date), desc(partyLedger.createdAt));
  }
  async createLedgerEntry(entry) {
    const [newEntry] = await db.insert(partyLedger).values(entry).returning();
    return newEntry;
  }
  // Dashboard methods
  async getDashboardMetrics() {
    const totalSales = await db.select({ value: sum(transactions.amount) }).from(transactions).where(and(eq(transactions.type, "sale"), eq(transactions.isActive, true)));
    const totalPurchases = await db.select({ value: sum(transactions.amount) }).from(transactions).where(and(eq(transactions.type, "purchase"), eq(transactions.isActive, true)));
    const totalExpenses = await db.select({ value: sum(transactions.amount) }).from(transactions).where(and(eq(transactions.type, "expense"), eq(transactions.isActive, true)));
    const inventoryValue = await db.select({ value: sum(inventory.stockValue) }).from(inventory);
    const totalCrops = await db.select({ count: count() }).from(crops).where(eq(crops.isActive, true));
    const lowStockItems = await db.select({ count: count() }).from(inventory).where(sql2`current_stock <= min_stock_level`);
    return {
      totalSales: totalSales[0]?.value || "0",
      totalPurchases: totalPurchases[0]?.value || "0",
      totalExpenses: totalExpenses[0]?.value || "0",
      inventoryValue: inventoryValue[0]?.value || "0",
      netProfit: parseFloat(totalSales[0]?.value || "0") - parseFloat(totalPurchases[0]?.value || "0") - parseFloat(totalExpenses[0]?.value || "0"),
      totalCrops: totalCrops[0]?.count || 0,
      lowStockItems: lowStockItems[0]?.count || 0
    };
  }
  // Helper methods
  async validateSaleInventory(cropId, saleQuantity, oldQuantity = 0) {
    const existingInventory = await this.getInventoryByCrop(cropId);
    if (!existingInventory) {
      const crop = await this.getCrop(cropId);
      const cropName = crop?.name || "this item";
      throw new Error(`Cannot sell ${cropName}. No inventory record found. Please purchase this item first.`);
    }
    const currentStock = parseFloat(existingInventory.currentStock || "0");
    const availableStock = currentStock + oldQuantity;
    if (availableStock < saleQuantity) {
      const crop = await this.getCrop(cropId);
      const cropName = crop?.name || "item";
      const unit = crop?.unit || "units";
      throw new Error(`Insufficient stock for ${cropName}. Available: ${availableStock.toFixed(2)} ${unit}, Requested: ${saleQuantity.toFixed(2)} ${unit}`);
    }
  }
  async updateInventoryFromTransaction(transaction) {
    if (!transaction.cropId || !transaction.quantity) return;
    const existingInventory = await this.getInventoryByCrop(transaction.cropId);
    if (!existingInventory) return;
    const currentStock = parseFloat(existingInventory.currentStock || "0");
    const transactionQty = parseFloat(transaction.quantity);
    const rate = parseFloat(transaction.rate || "0");
    let newStock;
    let newAverageRate;
    if (transaction.type === "purchase") {
      newStock = currentStock + transactionQty;
      const currentValue = currentStock * parseFloat(existingInventory.averageRate || "0");
      const newValue = transactionQty * rate;
      newAverageRate = (currentValue + newValue) / newStock;
    } else {
      newStock = currentStock - transactionQty;
      newAverageRate = parseFloat(existingInventory.averageRate || "0");
    }
    const stockValue = newStock * newAverageRate;
    await this.updateInventory(transaction.cropId, {
      currentStock: newStock.toString(),
      averageRate: newAverageRate.toString(),
      stockValue: stockValue.toString()
    });
  }
  async reverseInventoryFromTransaction(transaction) {
    if (!transaction.cropId || !transaction.quantity) return;
    const existingInventory = await this.getInventoryByCrop(transaction.cropId);
    if (!existingInventory) return;
    const currentStock = parseFloat(existingInventory.currentStock || "0");
    const transactionQty = parseFloat(transaction.quantity);
    const rate = parseFloat(transaction.rate || "0");
    let newStock;
    let newAverageRate;
    if (transaction.type === "purchase") {
      newStock = currentStock - transactionQty;
      const currentValue = currentStock * parseFloat(existingInventory.averageRate || "0");
      const purchaseValue = transactionQty * rate;
      if (newStock !== 0) {
        newAverageRate = (currentValue - purchaseValue) / newStock;
      } else {
        newAverageRate = 0;
      }
    } else {
      newStock = currentStock + transactionQty;
      newAverageRate = parseFloat(existingInventory.averageRate || "0");
    }
    const stockValue = newStock * newAverageRate;
    await this.updateInventory(transaction.cropId, {
      currentStock: newStock.toString(),
      averageRate: newAverageRate.toString(),
      stockValue: stockValue.toString()
    });
  }
  async createLedgerEntryFromTransaction(transaction) {
    if (!transaction.partyId) return;
    const existingEntries = await this.getPartyLedger(transaction.partyId);
    let currentBalance;
    if (existingEntries.length > 0) {
      currentBalance = parseFloat(existingEntries[0].balance);
    } else {
      const [party] = await db.select().from(parties).where(eq(parties.id, transaction.partyId));
      currentBalance = party ? parseFloat(party.openingBalance || "0") : 0;
    }
    let debit = 0;
    let credit = 0;
    let description = "";
    switch (transaction.type) {
      case "purchase":
        credit = parseFloat(transaction.amount);
        description = `Purchase - ${transaction.invoiceNumber || "N/A"}`;
        break;
      case "sale":
        debit = parseFloat(transaction.amount);
        description = `Sale - ${transaction.invoiceNumber || "N/A"}`;
        break;
      case "expense":
        credit = parseFloat(transaction.amount);
        description = `Expense - ${transaction.category || "N/A"}`;
        break;
    }
    const newBalance = currentBalance - debit + credit;
    await this.createLedgerEntry({
      partyId: transaction.partyId,
      transactionId: transaction.id,
      date: transaction.date,
      description,
      debit: debit.toString(),
      credit: credit.toString(),
      balance: newBalance.toString()
    });
  }
  async createLedgerEntryFromCashTransaction(cashEntry) {
    if (!cashEntry.partyId) return;
    const existingEntries = await this.getPartyLedger(cashEntry.partyId);
    let currentBalance;
    if (existingEntries.length > 0) {
      currentBalance = parseFloat(existingEntries[0].balance);
    } else {
      const [party] = await db.select().from(parties).where(eq(parties.id, cashEntry.partyId));
      currentBalance = party ? parseFloat(party.openingBalance || "0") : 0;
    }
    let debit = 0;
    let credit = 0;
    let description = "";
    if (cashEntry.type === "cash_in") {
      credit = parseFloat(cashEntry.amount);
      description = `Cash In - ${cashEntry.description} (Ref: ${cashEntry.id})`;
    } else {
      debit = parseFloat(cashEntry.amount);
      description = `Cash Out - ${cashEntry.description} (Ref: ${cashEntry.id})`;
    }
    const newBalance = currentBalance - debit + credit;
    await this.createLedgerEntry({
      partyId: cashEntry.partyId,
      transactionId: null,
      date: cashEntry.date,
      description,
      debit: debit.toString(),
      credit: credit.toString(),
      balance: newBalance.toString()
    });
  }
  async recalculateLedgerBalances(partyId) {
    const [party] = await db.select().from(parties).where(eq(parties.id, partyId));
    if (!party) return;
    const openingBalance = parseFloat(party.openingBalance || "0");
    const ledgerEntries = await db.select().from(partyLedger).where(eq(partyLedger.partyId, partyId)).orderBy(partyLedger.date);
    let runningBalance = openingBalance;
    for (const entry of ledgerEntries) {
      const debit = parseFloat(entry.debit || "0");
      const credit = parseFloat(entry.credit || "0");
      runningBalance = runningBalance - debit + credit;
      if (parseFloat(entry.balance) !== runningBalance) {
        await db.update(partyLedger).set({ balance: runningBalance.toString() }).where(eq(partyLedger.id, entry.id));
      }
    }
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.use(session({
    secret: process.env.SESSION_SECRET || "kcagri-trade-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
  app2.post("/api/auth/login", async (req, res) => {
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
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/auth/me", async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
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
  app2.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Dashboard metrics error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });
  app2.get("/api/states", requireAuth, async (req, res) => {
    try {
      const states2 = await storage.getStates();
      res.json(states2);
    } catch (error) {
      console.error("Get states error:", error);
      res.status(500).json({ message: "Failed to fetch states" });
    }
  });
  app2.post("/api/states", requireAuth, async (req, res) => {
    try {
      const validatedData = insertStateSchema.parse(req.body);
      const state = await storage.createState(validatedData);
      res.status(201).json(state);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create state error:", error);
      res.status(500).json({ message: "Failed to create state" });
    }
  });
  app2.put("/api/states/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertStateSchema.partial().parse(req.body);
      const state = await storage.updateState(id, validatedData);
      res.json(state);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update state error:", error);
      res.status(500).json({ message: "Failed to update state" });
    }
  });
  app2.delete("/api/states/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteState(id);
      res.json({ message: "State deleted successfully" });
    } catch (error) {
      console.error("Delete state error:", error);
      res.status(500).json({ message: "Failed to delete state" });
    }
  });
  app2.get("/api/cities", requireAuth, async (req, res) => {
    try {
      const { stateId } = req.query;
      const cities2 = stateId ? await storage.getCitiesByState(stateId) : await storage.getCities();
      res.json(cities2);
    } catch (error) {
      console.error("Get cities error:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });
  app2.post("/api/cities", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCitySchema.parse(req.body);
      const city = await storage.createCity(validatedData);
      res.status(201).json(city);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create city error:", error);
      res.status(500).json({ message: "Failed to create city" });
    }
  });
  app2.get("/api/parties", requireAuth, async (req, res) => {
    try {
      const parties2 = await storage.getParties();
      res.json(parties2);
    } catch (error) {
      console.error("Get parties error:", error);
      res.status(500).json({ message: "Failed to fetch parties" });
    }
  });
  app2.post("/api/parties", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPartySchema.parse(req.body);
      const party = await storage.createParty(validatedData);
      res.status(201).json(party);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create party error:", error);
      res.status(500).json({ message: "Failed to create party" });
    }
  });
  app2.put("/api/parties/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertPartySchema.partial().parse(req.body);
      const party = await storage.updateParty(id, validatedData);
      res.json(party);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update party error:", error);
      res.status(500).json({ message: "Failed to update party" });
    }
  });
  app2.delete("/api/parties/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteParty(id);
      res.json({ message: "Party deleted successfully" });
    } catch (error) {
      console.error("Delete party error:", error);
      res.status(500).json({ message: "Failed to delete party" });
    }
  });
  app2.get("/api/parties/with-balance", requireAuth, async (req, res) => {
    try {
      const parties2 = await storage.getPartiesWithBalance();
      res.json(parties2);
    } catch (error) {
      console.error("Get parties with balance error:", error);
      res.status(500).json({ message: "Failed to fetch parties with balance" });
    }
  });
  app2.get("/api/crops", requireAuth, async (req, res) => {
    try {
      const crops2 = await storage.getCrops();
      res.json(crops2);
    } catch (error) {
      console.error("Get crops error:", error);
      res.status(500).json({ message: "Failed to fetch crops" });
    }
  });
  app2.post("/api/crops", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCropSchema.parse(req.body);
      const crop = await storage.createCrop(validatedData);
      res.status(201).json(crop);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create crop error:", error);
      res.status(500).json({ message: "Failed to create crop" });
    }
  });
  app2.put("/api/crops/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCropSchema.partial().parse(req.body);
      const crop = await storage.updateCrop(id, validatedData);
      res.json(crop);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update crop error:", error);
      res.status(500).json({ message: "Failed to update crop" });
    }
  });
  app2.delete("/api/crops/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCrop(id);
      res.json({ message: "Crop deleted successfully" });
    } catch (error) {
      console.error("Delete crop error:", error);
      res.status(500).json({ message: "Failed to delete crop" });
    }
  });
  app2.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const { type, partyId, cropId } = req.query;
      let transactions2;
      if (type) {
        transactions2 = await storage.getTransactionsByType(type);
      } else if (partyId) {
        transactions2 = await storage.getTransactionsByParty(partyId);
      } else if (cropId) {
        transactions2 = await storage.getTransactionsByCrop(cropId);
      } else {
        transactions2 = await storage.getTransactions();
      }
      res.json(transactions2);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      if (error instanceof Error && (error.message.includes("Insufficient stock") || error.message.includes("No inventory record"))) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Create transaction error:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });
  app2.put("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, validatedData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      if (error instanceof Error && (error.message.includes("Insufficient stock") || error.message.includes("No inventory record"))) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Update transaction error:", error);
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });
  app2.delete("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTransaction(id);
      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.error("Delete transaction error:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });
  app2.post("/api/transactions/:id/restore", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.restoreTransaction(id);
      res.json({ message: "Transaction restored successfully" });
    } catch (error) {
      console.error("Restore transaction error:", error);
      res.status(500).json({ message: "Failed to restore transaction" });
    }
  });
  app2.delete("/api/transactions/:id/permanent", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.permanentlyDeleteTransaction(id);
      res.json({ message: "Transaction permanently deleted" });
    } catch (error) {
      console.error("Permanent delete transaction error:", error);
      res.status(500).json({ message: "Failed to permanently delete transaction" });
    }
  });
  app2.get("/api/transactions/deleted/all", requireAuth, async (req, res) => {
    try {
      const deletedTransactions = await storage.getDeletedTransactions();
      res.json(deletedTransactions);
    } catch (error) {
      console.error("Get deleted transactions error:", error);
      res.status(500).json({ message: "Failed to fetch deleted transactions" });
    }
  });
  app2.get("/api/inventory", requireAuth, async (req, res) => {
    try {
      const inventory2 = await storage.getInventoryWithCrops();
      res.json(inventory2);
    } catch (error) {
      console.error("Get inventory error:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });
  app2.get("/api/cash-register", requireAuth, async (req, res) => {
    try {
      const entries = await storage.getCashRegister();
      res.json(entries);
    } catch (error) {
      console.error("Get cash register error:", error);
      res.status(500).json({ message: "Failed to fetch cash register" });
    }
  });
  app2.post("/api/cash-register", requireAuth, async (req, res) => {
    try {
      const currentBalance = await storage.getCashBalance();
      const amount = parseFloat(req.body.amount);
      const newBalance = req.body.type === "cash_in" ? currentBalance + amount : currentBalance - amount;
      const entryData = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : /* @__PURE__ */ new Date(),
        balance: newBalance.toString(),
        reference: req.body.referenceNumber || req.body.reference
      };
      if ("partyId" in req.body) {
        entryData.partyId = req.body.partyId && req.body.partyId.trim() !== "" ? req.body.partyId : null;
      }
      const validatedData = insertCashRegisterSchema.parse(entryData);
      const entry = await storage.createCashEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create cash entry error:", error);
      res.status(500).json({ message: "Failed to create cash entry" });
    }
  });
  app2.put("/api/cash-register/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const entryData = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : void 0,
        reference: req.body.referenceNumber || req.body.reference
      };
      if ("partyId" in req.body) {
        entryData.partyId = req.body.partyId && req.body.partyId.trim() !== "" ? req.body.partyId : null;
      }
      const validatedData = insertCashRegisterSchema.partial().parse(entryData);
      const entry = await storage.updateCashEntry(id, validatedData);
      if (!entry) {
        return res.status(404).json({ message: "Cash entry not found" });
      }
      res.json(entry);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update cash entry error:", error);
      res.status(500).json({ message: "Failed to update cash entry" });
    }
  });
  app2.get("/api/cash-register/balance", requireAuth, async (req, res) => {
    try {
      const balance = await storage.getCashBalance();
      res.json({ balance });
    } catch (error) {
      console.error("Get cash balance error:", error);
      res.status(500).json({ message: "Failed to fetch cash balance" });
    }
  });
  app2.get("/api/ledger/all/entries", requireAuth, async (req, res) => {
    try {
      const ledger = await storage.getAllLedgerEntries();
      res.json(ledger);
    } catch (error) {
      console.error("Get all ledger entries error:", error);
      res.status(500).json({ message: "Failed to fetch all ledger entries" });
    }
  });
  app2.get("/api/ledger/:partyId", requireAuth, async (req, res) => {
    try {
      const { partyId } = req.params;
      const ledger = await storage.getPartyLedger(partyId);
      res.json(ledger);
    } catch (error) {
      console.error("Get party ledger error:", error);
      res.status(500).json({ message: "Failed to fetch party ledger" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5004", 10);
  server.listen(port, () => {
    console.log(`\u{1F680} Server is running on port ${port}`);
  });
})();
