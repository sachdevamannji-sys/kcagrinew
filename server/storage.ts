import { 
  users, parties, crops, states, cities, transactions, inventory, 
  cashRegister, partyLedger,
  type User, type InsertUser, type Party, type InsertParty,
  type Crop, type InsertCrop, type State, type InsertState,
  type City, type InsertCity, type Transaction, type InsertTransaction,
  type Inventory, type InsertInventory, type CashRegister, type InsertCashRegister,
  type PartyLedger, type InsertPartyLedger
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, sum, count } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;

  // State methods
  getStates(): Promise<State[]>;
  getState(id: string): Promise<State | undefined>;
  createState(state: InsertState): Promise<State>;
  updateState(id: string, state: Partial<InsertState>): Promise<State>;
  deleteState(id: string): Promise<void>;

  // City methods
  getCities(): Promise<City[]>;
  getCitiesByState(stateId: string): Promise<City[]>;
  getCity(id: string): Promise<City | undefined>;
  createCity(city: InsertCity): Promise<City>;
  updateCity(id: string, city: Partial<InsertCity>): Promise<City>;
  deleteCity(id: string): Promise<void>;

  // Party methods
  getParties(): Promise<Party[]>;
  getParty(id: string): Promise<Party | undefined>;
  createParty(party: InsertParty): Promise<Party>;
  updateParty(id: string, party: Partial<InsertParty>): Promise<Party>;
  deleteParty(id: string): Promise<void>;
  getPartiesWithBalance(): Promise<any[]>;

  // Crop methods
  getCrops(): Promise<Crop[]>;
  getCrop(id: string): Promise<Crop | undefined>;
  createCrop(crop: InsertCrop): Promise<Crop>;
  updateCrop(id: string, crop: Partial<InsertCrop>): Promise<Crop>;
  deleteCrop(id: string): Promise<void>;

  // Transaction methods
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  restoreTransaction(id: string): Promise<void>;
  permanentlyDeleteTransaction(id: string): Promise<void>;
  getDeletedTransactions(): Promise<Transaction[]>;
  getTransactionsByType(type: string): Promise<Transaction[]>;
  getTransactionsByParty(partyId: string): Promise<Transaction[]>;
  getTransactionsByCrop(cropId: string): Promise<Transaction[]>;

  // Inventory methods
  getInventory(): Promise<Inventory[]>;
  getInventoryByCrop(cropId: string): Promise<Inventory | undefined>;
  updateInventory(cropId: string, inventory: Partial<InsertInventory>): Promise<Inventory>;
  getInventoryWithCrops(): Promise<any[]>;

  // Cash register methods
  getCashRegister(): Promise<CashRegister[]>;
  getCashEntry(id: string): Promise<CashRegister | undefined>;
  createCashEntry(entry: InsertCashRegister): Promise<CashRegister>;
  updateCashEntry(id: string, entry: Partial<InsertCashRegister>): Promise<CashRegister>;
  getCashBalance(): Promise<number>;

  // Ledger methods
  getPartyLedger(partyId: string): Promise<PartyLedger[]>;
  createLedgerEntry(entry: InsertPartyLedger): Promise<PartyLedger>;

  // Dashboard methods
  getDashboardMetrics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // State methods
  async getStates(): Promise<State[]> {
    return await db.select().from(states).where(eq(states.isActive, true)).orderBy(states.name);
  }

  async getState(id: string): Promise<State | undefined> {
    const [state] = await db.select().from(states).where(eq(states.id, id));
    return state;
  }

  async createState(state: InsertState): Promise<State> {
    const [newState] = await db.insert(states).values(state).returning();
    return newState;
  }

  async updateState(id: string, state: Partial<InsertState>): Promise<State> {
    const [updatedState] = await db
      .update(states)
      .set(state)
      .where(eq(states.id, id))
      .returning();
    return updatedState;
  }

  async deleteState(id: string): Promise<void> {
    await db.update(states).set({ isActive: false }).where(eq(states.id, id));
  }

  // City methods
  async getCities(): Promise<City[]> {
    return await db.select().from(cities).where(eq(cities.isActive, true)).orderBy(cities.name);
  }

  async getCitiesByState(stateId: string): Promise<City[]> {
    return await db
      .select()
      .from(cities)
      .where(and(eq(cities.stateId, stateId), eq(cities.isActive, true)))
      .orderBy(cities.name);
  }

  async getCity(id: string): Promise<City | undefined> {
    const [city] = await db.select().from(cities).where(eq(cities.id, id));
    return city;
  }

  async createCity(city: InsertCity): Promise<City> {
    const [newCity] = await db.insert(cities).values(city).returning();
    return newCity;
  }

  async updateCity(id: string, city: Partial<InsertCity>): Promise<City> {
    const [updatedCity] = await db
      .update(cities)
      .set(city)
      .where(eq(cities.id, id))
      .returning();
    return updatedCity;
  }

  async deleteCity(id: string): Promise<void> {
    await db.update(cities).set({ isActive: false }).where(eq(cities.id, id));
  }

  // Party methods
  async getParties(): Promise<Party[]> {
    return await db.select().from(parties).where(eq(parties.isActive, true)).orderBy(parties.name);
  }

  async getParty(id: string): Promise<Party | undefined> {
    const [party] = await db.select().from(parties).where(eq(parties.id, id));
    return party;
  }

  async createParty(party: InsertParty): Promise<Party> {
    // Generate party code if not provided
    if (!party.code) {
      const count = await db.select({ count: sql<number>`count(*)` }).from(parties);
      party.code = `P${String(count[0].count + 1).padStart(3, '0')}`;
    }
    
    const [newParty] = await db.insert(parties).values(party).returning();
    return newParty;
  }

  async updateParty(id: string, party: Partial<InsertParty>): Promise<Party> {
    const [updatedParty] = await db
      .update(parties)
      .set({ ...party, updatedAt: new Date() })
      .where(eq(parties.id, id))
      .returning();
    return updatedParty;
  }

  async deleteParty(id: string): Promise<void> {
    await db.update(parties).set({ isActive: false }).where(eq(parties.id, id));
  }

  async getPartiesWithBalance(): Promise<any[]> {
    // Subquery to get the latest ledger entry for each party
    const latestLedgerSubquery = db
      .select({
        partyId: partyLedger.partyId,
        balance: partyLedger.balance,
        rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${partyLedger.partyId} ORDER BY ${partyLedger.date} DESC)`.as('rn')
      })
      .from(partyLedger)
      .as('latest_ledger');

    // Main query joining parties with their latest ledger balance
    const result = await db
      .select({
        id: parties.id,
        name: parties.name,
        type: parties.type,
        phone: parties.phone,
        email: parties.email,
        openingBalance: parties.openingBalance,
        balanceType: parties.balanceType,
        totalBalance: sql<string>`COALESCE(${latestLedgerSubquery.balance}, ${parties.openingBalance}, '0')`.as('totalBalance')
      })
      .from(parties)
      .leftJoin(
        latestLedgerSubquery,
        and(
          eq(parties.id, latestLedgerSubquery.partyId),
          eq(latestLedgerSubquery.rn, 1)
        )
      )
      .where(eq(parties.isActive, true))
      .orderBy(parties.name);

    return result;
  }

  // Crop methods
  async getCrops(): Promise<Crop[]> {
    return await db.select().from(crops).where(eq(crops.isActive, true)).orderBy(crops.name);
  }

  async getCrop(id: string): Promise<Crop | undefined> {
    const [crop] = await db.select().from(crops).where(eq(crops.id, id));
    return crop;
  }

  async createCrop(crop: InsertCrop): Promise<Crop> {
    const [newCrop] = await db.insert(crops).values(crop).returning();
    
    // Create initial inventory entry
    await db.insert(inventory).values({
      cropId: newCrop.id,
      openingStock: '0',
      currentStock: '0',
      averageRate: '0',
      stockValue: '0'
    });
    
    return newCrop;
  }

  async updateCrop(id: string, crop: Partial<InsertCrop>): Promise<Crop> {
    const [updatedCrop] = await db
      .update(crops)
      .set({ ...crop, updatedAt: new Date() })
      .where(eq(crops.id, id))
      .returning();
    return updatedCrop;
  }

  async deleteCrop(id: string): Promise<void> {
    await db.update(crops).set({ isActive: false }).where(eq(crops.id, id));
  }

  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.isActive, true)).orderBy(desc(transactions.date));
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    // Validate stock availability for sale transactions
    if (transaction.type === 'sale' && transaction.cropId && transaction.quantity) {
      await this.validateSaleInventory(transaction.cropId, parseFloat(transaction.quantity));
    }

    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    
    // Update inventory if it's a purchase or sale
    if ((transaction.type === 'purchase' || transaction.type === 'sale') && transaction.cropId && transaction.quantity) {
      await this.updateInventoryFromTransaction(transaction);
    }

    // Create ledger entry if party is involved
    if (transaction.partyId) {
      await this.createLedgerEntryFromTransaction(newTransaction);
    }

    return newTransaction;
  }

  async updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    // Get the old transaction to check if party changed
    const oldTransaction = await this.getTransaction(id);
    
    if (!oldTransaction) {
      throw new Error('Transaction not found');
    }
    
    // Build the updated transaction data for validation
    const updatedData = { ...oldTransaction, ...transaction };
    
    // Validate stock availability for sale transactions BEFORE making any changes
    if (updatedData.type === 'sale' && updatedData.cropId && updatedData.quantity) {
      // Calculate the net stock change after reversing the old transaction
      let stockAdjustment = 0;
      
      if (oldTransaction.cropId === updatedData.cropId) {
        if (oldTransaction.type === 'sale') {
          // Reversing a sale adds stock back
          stockAdjustment = parseFloat(oldTransaction.quantity || '0');
        } else if (oldTransaction.type === 'purchase') {
          // Reversing a purchase removes stock
          stockAdjustment = -parseFloat(oldTransaction.quantity || '0');
        }
      }
      
      await this.validateSaleInventory(updatedData.cropId, parseFloat(updatedData.quantity), stockAdjustment);
    }
    
    // Now update the database after validation passes
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    
    // Handle inventory updates for purchase/sale transactions
    // Reverse the old transaction's inventory effect if it was a purchase or sale
    if ((oldTransaction.type === 'purchase' || oldTransaction.type === 'sale') && 
        oldTransaction.cropId && oldTransaction.quantity) {
      await this.reverseInventoryFromTransaction(oldTransaction);
    }
    
    // Apply the new transaction's inventory effect if it's a purchase or sale
    if ((updatedTransaction.type === 'purchase' || updatedTransaction.type === 'sale') && 
        updatedTransaction.cropId && updatedTransaction.quantity) {
      await this.updateInventoryFromTransaction(updatedTransaction);
    }
    
    // Handle ledger updates
    if (oldTransaction) {
      const affectedParties = new Set<string>();
      
      // Delete old ledger entry if it existed
      if (oldTransaction.partyId) {
        await db.delete(partyLedger).where(eq(partyLedger.transactionId, id));
        affectedParties.add(oldTransaction.partyId);
      }
      
      // Create new ledger entry if new party exists
      if (updatedTransaction.partyId) {
        await this.createLedgerEntryFromTransaction(updatedTransaction);
        affectedParties.add(updatedTransaction.partyId);
      }
      
      // Recalculate all ledger balances for affected parties
      for (const partyId of Array.from(affectedParties)) {
        await this.recalculateLedgerBalances(partyId);
      }
    }
    
    return updatedTransaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    // Get the transaction before deleting to handle ledger cleanup
    const transaction = await this.getTransaction(id);
    
    // Soft delete the transaction
    await db.update(transactions).set({ isActive: false }).where(eq(transactions.id, id));
    
    // Handle inventory reversal for purchase/sale transactions
    if (transaction && (transaction.type === 'purchase' || transaction.type === 'sale')) {
      if (transaction.cropId && transaction.quantity) {
        await this.reverseInventoryFromTransaction(transaction);
      }
    }
    
    // Handle ledger cleanup if party was involved
    if (transaction && transaction.partyId) {
      // Delete the ledger entry for this transaction
      await db.delete(partyLedger).where(eq(partyLedger.transactionId, id));
      
      // Recalculate all ledger balances for this party
      await this.recalculateLedgerBalances(transaction.partyId);
    }
  }

  async restoreTransaction(id: string): Promise<void> {
    await db.update(transactions).set({ isActive: true }).where(eq(transactions.id, id));
  }

  async permanentlyDeleteTransaction(id: string): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  async getDeletedTransactions(): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.isActive, false))
      .orderBy(desc(transactions.date));
  }

  async getTransactionsByType(type: string): Promise<any[]> {
    return await db
      .select({
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
      })
      .from(transactions)
      .leftJoin(parties, eq(transactions.partyId, parties.id))
      .leftJoin(crops, eq(transactions.cropId, crops.id))
      .where(and(eq(transactions.type, type as any), eq(transactions.isActive, true)))
      .orderBy(desc(transactions.date));
  }

  async getTransactionsByParty(partyId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.partyId, partyId), eq(transactions.isActive, true)))
      .orderBy(desc(transactions.date));
  }

  async getTransactionsByCrop(cropId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.cropId, cropId), eq(transactions.isActive, true)))
      .orderBy(desc(transactions.date));
  }

  // Inventory methods
  async getInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }

  async getInventoryByCrop(cropId: string): Promise<Inventory | undefined> {
    const [inv] = await db.select().from(inventory).where(eq(inventory.cropId, cropId));
    return inv;
  }

  async updateInventory(cropId: string, inventoryData: Partial<InsertInventory>): Promise<Inventory> {
    const [updatedInventory] = await db
      .update(inventory)
      .set({ ...inventoryData, updatedAt: new Date() })
      .where(eq(inventory.cropId, cropId))
      .returning();
    return updatedInventory;
  }

  async getInventoryWithCrops(): Promise<any[]> {
    return await db
      .select({
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
      })
      .from(inventory)
      .leftJoin(crops, eq(inventory.cropId, crops.id))
      .where(eq(crops.isActive, true));
  }

  // Cash register methods
  async getCashRegister(): Promise<CashRegister[]> {
    return await db.select().from(cashRegister).orderBy(desc(cashRegister.date));
  }

  async getCashEntry(id: string): Promise<CashRegister | undefined> {
    const [entry] = await db.select().from(cashRegister).where(eq(cashRegister.id, id));
    return entry;
  }

  async createCashEntry(entry: InsertCashRegister): Promise<CashRegister> {
    const [newEntry] = await db.insert(cashRegister).values(entry).returning();
    
    // Create ledger entry if party is involved
    if (newEntry.partyId) {
      await this.createLedgerEntryFromCashTransaction(newEntry);
    }
    
    return newEntry;
  }

  async updateCashEntry(id: string, entry: Partial<InsertCashRegister>): Promise<CashRegister> {
    // Get the old entry to check if party changed
    const oldEntry = await this.getCashEntry(id);
    
    const [updatedEntry] = await db
      .update(cashRegister)
      .set(entry)
      .where(eq(cashRegister.id, id))
      .returning();
    
    // Recalculate cash register balances after update
    await this.recalculateCashRegisterBalances();
    
    const affectedParties = new Set<string>();
    
    // Delete old ledger entry if it existed
    if (oldEntry?.partyId) {
      // For cash entries, transactionId is null, so we need to find by description pattern
      await db.delete(partyLedger).where(
        and(
          eq(partyLedger.partyId, oldEntry.partyId),
          sql`${partyLedger.description} LIKE ${`%Ref: ${id}%`}`
        )
      );
      affectedParties.add(oldEntry.partyId);
    }
    
    // Create new ledger entry if party is involved
    if (updatedEntry.partyId) {
      await this.createLedgerEntryFromCashTransaction(updatedEntry);
      affectedParties.add(updatedEntry.partyId);
    }
    
    // Recalculate ledger balances for all affected parties
    for (const partyId of Array.from(affectedParties)) {
      await this.recalculateLedgerBalances(partyId);
    }
    
    // Get the updated entry with recalculated balance
    const finalEntry = await this.getCashEntry(id);
    return finalEntry!;
  }

  async getCashBalance(): Promise<number> {
    const result = await db
      .select({
        balance: sql<string>`COALESCE(MAX(balance), 0)`
      })
      .from(cashRegister);
    
    return parseFloat(result[0]?.balance || '0');
  }

  private async recalculateCashRegisterBalances() {
    // Get all cash register entries ordered by date (oldest first)
    const allEntries = await db
      .select()
      .from(cashRegister)
      .orderBy(cashRegister.date);

    // Recalculate balance for each entry
    let runningBalance = 0;
    
    for (const entry of allEntries) {
      const amount = parseFloat(entry.amount);
      
      if (entry.type === 'cash_in') {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }

      // Update the balance if it changed
      if (parseFloat(entry.balance) !== runningBalance) {
        await db
          .update(cashRegister)
          .set({ balance: runningBalance.toString() })
          .where(eq(cashRegister.id, entry.id));
      }
    }
  }

  // Ledger methods
  async getPartyLedger(partyId: string): Promise<PartyLedger[]> {
    return await db
      .select()
      .from(partyLedger)
      .where(eq(partyLedger.partyId, partyId))
      .orderBy(desc(partyLedger.date));
  }

  async getAllLedgerEntries(): Promise<any[]> {
    return await db
      .select({
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
      })
      .from(partyLedger)
      .leftJoin(parties, eq(partyLedger.partyId, parties.id))
      .orderBy(desc(partyLedger.date), desc(partyLedger.createdAt));
  }

  async createLedgerEntry(entry: InsertPartyLedger): Promise<PartyLedger> {
    const [newEntry] = await db.insert(partyLedger).values(entry).returning();
    return newEntry;
  }

  // Dashboard methods
  async getDashboardMetrics(): Promise<any> {
    const totalSales = await db
      .select({ value: sum(transactions.amount) })
      .from(transactions)
      .where(and(eq(transactions.type, 'sale'), eq(transactions.isActive, true)));

    const totalPurchases = await db
      .select({ value: sum(transactions.amount) })
      .from(transactions)
      .where(and(eq(transactions.type, 'purchase'), eq(transactions.isActive, true)));

    const totalExpenses = await db
      .select({ value: sum(transactions.amount) })
      .from(transactions)
      .where(and(eq(transactions.type, 'expense'), eq(transactions.isActive, true)));

    const inventoryValue = await db
      .select({ value: sum(inventory.stockValue) })
      .from(inventory);

    const totalCrops = await db
      .select({ count: count() })
      .from(crops)
      .where(eq(crops.isActive, true));

    const lowStockItems = await db
      .select({ count: count() })
      .from(inventory)
      .where(sql`current_stock <= min_stock_level`);

    return {
      totalSales: totalSales[0]?.value || '0',
      totalPurchases: totalPurchases[0]?.value || '0',
      totalExpenses: totalExpenses[0]?.value || '0',
      inventoryValue: inventoryValue[0]?.value || '0',
      netProfit: parseFloat(totalSales[0]?.value || '0') - parseFloat(totalPurchases[0]?.value || '0') - parseFloat(totalExpenses[0]?.value || '0'),
      totalCrops: totalCrops[0]?.count || 0,
      lowStockItems: lowStockItems[0]?.count || 0
    };
  }

  // Helper methods
  private async validateSaleInventory(cropId: string, saleQuantity: number, oldQuantity: number = 0): Promise<void> {
    const existingInventory = await this.getInventoryByCrop(cropId);
    
    if (!existingInventory) {
      const crop = await this.getCrop(cropId);
      const cropName = crop?.name || 'this item';
      throw new Error(`Cannot sell ${cropName}. No inventory record found. Please purchase this item first.`);
    }

    const currentStock = parseFloat(existingInventory.currentStock || '0');
    // If updating, add back the old quantity to get the actual available stock
    const availableStock = currentStock + oldQuantity;
    
    if (availableStock < saleQuantity) {
      const crop = await this.getCrop(cropId);
      const cropName = crop?.name || 'item';
      const unit = crop?.unit || 'units';
      throw new Error(`Insufficient stock for ${cropName}. Available: ${availableStock.toFixed(2)} ${unit}, Requested: ${saleQuantity.toFixed(2)} ${unit}`);
    }
  }

  private async updateInventoryFromTransaction(transaction: InsertTransaction) {
    if (!transaction.cropId || !transaction.quantity) return;

    const existingInventory = await this.getInventoryByCrop(transaction.cropId);
    if (!existingInventory) return;

    const currentStock = parseFloat(existingInventory.currentStock || '0');
    const transactionQty = parseFloat(transaction.quantity);
    const rate = parseFloat(transaction.rate || '0');

    let newStock: number;
    let newAverageRate: number;

    if (transaction.type === 'purchase') {
      newStock = currentStock + transactionQty;
      // Calculate weighted average rate
      const currentValue = currentStock * parseFloat(existingInventory.averageRate || '0');
      const newValue = transactionQty * rate;
      newAverageRate = (currentValue + newValue) / newStock;
    } else {
      newStock = currentStock - transactionQty;
      newAverageRate = parseFloat(existingInventory.averageRate || '0');
    }

    const stockValue = newStock * newAverageRate;

    await this.updateInventory(transaction.cropId, {
      currentStock: newStock.toString(),
      averageRate: newAverageRate.toString(),
      stockValue: stockValue.toString()
    });
  }

  private async reverseInventoryFromTransaction(transaction: InsertTransaction | Transaction) {
    if (!transaction.cropId || !transaction.quantity) return;

    const existingInventory = await this.getInventoryByCrop(transaction.cropId);
    if (!existingInventory) return;

    const currentStock = parseFloat(existingInventory.currentStock || '0');
    const transactionQty = parseFloat(transaction.quantity);
    const rate = parseFloat(transaction.rate || '0');

    let newStock: number;
    let newAverageRate: number;

    if (transaction.type === 'purchase') {
      // Reverse a purchase: subtract the quantity
      newStock = currentStock - transactionQty;
      // Recalculate weighted average rate
      const currentValue = currentStock * parseFloat(existingInventory.averageRate || '0');
      const purchaseValue = transactionQty * rate;
      if (newStock !== 0) {
        newAverageRate = (currentValue - purchaseValue) / newStock;
      } else {
        newAverageRate = 0;
      }
    } else {
      // Reverse a sale: add the quantity back
      newStock = currentStock + transactionQty;
      newAverageRate = parseFloat(existingInventory.averageRate || '0');
    }

    const stockValue = newStock * newAverageRate;

    await this.updateInventory(transaction.cropId, {
      currentStock: newStock.toString(),
      averageRate: newAverageRate.toString(),
      stockValue: stockValue.toString()
    });
  }

  private async createLedgerEntryFromTransaction(transaction: Transaction) {
    if (!transaction.partyId) return;

    // Get current balance for the party
    const existingEntries = await this.getPartyLedger(transaction.partyId);
    let currentBalance: number;
    
    if (existingEntries.length > 0) {
      currentBalance = parseFloat(existingEntries[0].balance);
    } else {
      // No existing entries, use party's opening balance
      const [party] = await db.select().from(parties).where(eq(parties.id, transaction.partyId));
      currentBalance = party ? parseFloat(party.openingBalance || '0') : 0;
    }

    let debit = 0;
    let credit = 0;
    let description = '';

    switch (transaction.type) {
      case 'purchase':
        credit = parseFloat(transaction.amount);
        description = `Purchase - ${transaction.invoiceNumber || 'N/A'}`;
        break;
      case 'sale':
        debit = parseFloat(transaction.amount);
        description = `Sale - ${transaction.invoiceNumber || 'N/A'}`;
        break;
      case 'expense':
        credit = parseFloat(transaction.amount);
        description = `Expense - ${transaction.category || 'N/A'}`;
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

  private async createLedgerEntryFromCashTransaction(cashEntry: CashRegister) {
    if (!cashEntry.partyId) return;

    // Get current balance for the party
    const existingEntries = await this.getPartyLedger(cashEntry.partyId);
    let currentBalance: number;
    
    if (existingEntries.length > 0) {
      currentBalance = parseFloat(existingEntries[0].balance);
    } else {
      // No existing entries, use party's opening balance
      const [party] = await db.select().from(parties).where(eq(parties.id, cashEntry.partyId));
      currentBalance = party ? parseFloat(party.openingBalance || '0') : 0;
    }

    let debit = 0;
    let credit = 0;
    let description = '';

    // Cash In from party = Payment received from customer = Credit (reduces receivable)
    // Cash Out to party = Payment made to supplier = Debit (reduces payable)
    if (cashEntry.type === 'cash_in') {
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

  private async recalculateLedgerBalances(partyId: string) {
    // Get party's opening balance
    const [party] = await db.select().from(parties).where(eq(parties.id, partyId));
    if (!party) return;

    const openingBalance = parseFloat(party.openingBalance || '0');

    // Get all ledger entries for this party ordered by date
    const ledgerEntries = await db
      .select()
      .from(partyLedger)
      .where(eq(partyLedger.partyId, partyId))
      .orderBy(partyLedger.date);

    // Recalculate balance for each entry
    let runningBalance = openingBalance;
    
    for (const entry of ledgerEntries) {
      const debit = parseFloat(entry.debit || '0');
      const credit = parseFloat(entry.credit || '0');
      runningBalance = runningBalance - debit + credit;

      // Update the balance if it changed
      if (parseFloat(entry.balance) !== runningBalance) {
        await db
          .update(partyLedger)
          .set({ balance: runningBalance.toString() })
          .where(eq(partyLedger.id, entry.id));
      }
    }
  }
}

export const storage = new DatabaseStorage();
