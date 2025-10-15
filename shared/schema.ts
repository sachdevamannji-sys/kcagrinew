import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const partyTypeEnum = pgEnum('party_type', ['farmer', 'buyer', 'trader', 'contractor', 'thekedar', 'company', 'other']);
export const transactionTypeEnum = pgEnum('transaction_type', ['purchase', 'sale', 'expense', 'cash_in', 'cash_out']);
export const paymentModeEnum = pgEnum('payment_mode', ['cash', 'credit', 'bank_transfer', 'cheque']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed']);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").default('admin'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// States table
export const states = pgTable("states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  code: text("code"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Cities table
export const cities = pgTable("cities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  stateId: varchar("state_id").references(() => states.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Parties table
export const parties = pgTable("parties", {
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
  openingBalance: decimal("opening_balance", { precision: 15, scale: 2 }).default('0'),
  balanceType: text("balance_type").default('credit'), // credit or debit
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Crops table
export const crops = pgTable("crops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  variety: text("variety"),
  category: text("category"),
  unit: text("unit").notNull().default('quintal'),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: transactionTypeEnum("type").notNull(),
  date: timestamp("date").notNull(),
  invoiceNumber: text("invoice_number"),
  partyId: varchar("party_id").references(() => parties.id),
  cropId: varchar("crop_id").references(() => crops.id),
  quantity: decimal("quantity", { precision: 15, scale: 3 }),
  rate: decimal("rate", { precision: 15, scale: 2 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentMode: paymentModeEnum("payment_mode").default('cash'),
  paymentStatus: paymentStatusEnum("payment_status").default('pending'),
  quality: text("quality"), // Quality grade (A, B, C, etc.)
  notes: text("notes"),
  category: text("category"), // for expenses
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Inventory table
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cropId: varchar("crop_id").references(() => crops.id).notNull(),
  openingStock: decimal("opening_stock", { precision: 15, scale: 3 }).default('0'),
  currentStock: decimal("current_stock", { precision: 15, scale: 3 }).default('0'),
  averageRate: decimal("average_rate", { precision: 15, scale: 2 }).default('0'),
  stockValue: decimal("stock_value", { precision: 15, scale: 2 }).default('0'),
  minStockLevel: decimal("min_stock_level", { precision: 15, scale: 3 }).default('0'),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Cash Register table
export const cashRegister = pgTable("cash_register", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // cash_in or cash_out
  description: text("description").notNull(),
  reference: text("reference"), // transaction id or reference
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull(),
  partyId: varchar("party_id").references(() => parties.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Party Ledger table
export const partyLedger = pgTable("party_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partyId: varchar("party_id").references(() => parties.id).notNull(),
  transactionId: varchar("transaction_id").references(() => transactions.id),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  debit: decimal("debit", { precision: 15, scale: 2 }).default('0'),
  credit: decimal("credit", { precision: 15, scale: 2 }).default('0'),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const statesRelations = relations(states, ({ many }) => ({
  cities: many(cities),
  parties: many(parties)
}));

export const citiesRelations = relations(cities, ({ one, many }) => ({
  state: one(states, {
    fields: [cities.stateId],
    references: [states.id]
  }),
  parties: many(parties)
}));

export const partiesRelations = relations(parties, ({ one, many }) => ({
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

export const cropsRelations = relations(crops, ({ many }) => ({
  transactions: many(transactions),
  inventory: many(inventory)
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  party: one(parties, {
    fields: [transactions.partyId],
    references: [parties.id]
  }),
  crop: one(crops, {
    fields: [transactions.cropId],
    references: [crops.id]
  })
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  crop: one(crops, {
    fields: [inventory.cropId],
    references: [crops.id]
  })
}));

export const partyLedgerRelations = relations(partyLedger, ({ one }) => ({
  party: one(parties, {
    fields: [partyLedger.partyId],
    references: [parties.id]
  }),
  transaction: one(transactions, {
    fields: [partyLedger.transactionId],
    references: [transactions.id]
  })
}));

export const cashRegisterRelations = relations(cashRegister, ({ one }) => ({
  party: one(parties, {
    fields: [cashRegister.partyId],
    references: [parties.id]
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertStateSchema = createInsertSchema(states).omit({
  id: true,
  createdAt: true
});

export const insertCitySchema = createInsertSchema(cities).omit({
  id: true,
  createdAt: true
});

export const insertPartySchema = createInsertSchema(parties).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCropSchema = createInsertSchema(crops).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  date: z.coerce.date()
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  updatedAt: true
});

export const insertCashRegisterSchema = createInsertSchema(cashRegister).omit({
  id: true,
  createdAt: true
}).extend({
  date: z.coerce.date()
});

export const insertPartyLedgerSchema = createInsertSchema(partyLedger).omit({
  id: true,
  createdAt: true
}).extend({
  date: z.coerce.date()
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertState = z.infer<typeof insertStateSchema>;
export type State = typeof states.$inferSelect;

export type InsertCity = z.infer<typeof insertCitySchema>;
export type City = typeof cities.$inferSelect;

export type InsertParty = z.infer<typeof insertPartySchema>;
export type Party = typeof parties.$inferSelect;

export type InsertCrop = z.infer<typeof insertCropSchema>;
export type Crop = typeof crops.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type InsertCashRegister = z.infer<typeof insertCashRegisterSchema>;
export type CashRegister = typeof cashRegister.$inferSelect;

export type InsertPartyLedger = z.infer<typeof insertPartyLedgerSchema>;
export type PartyLedger = typeof partyLedger.$inferSelect;
