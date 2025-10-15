-- KCAgri-Trade Database Backup
-- Generated: $(date)
-- Database: PostgreSQL

-- =====================
-- TABLE: users
-- =====================
-- Structure: id, username, email, password, name, role, is_active, created_at, updated_at

INSERT INTO users (id, username, email, password, name, role, is_active, created_at, updated_at) VALUES
('60f54927-4e4e-4029-98b0-61aae6cab05a', 'admin', 'admin@example.com', '$2b$10$iUAHZi/f81D.wtB5Ec1ZGem40.PH0VgTmpILHPxF2uqIjS4Haykfy', 'Admin User', 'admin', true, '2025-10-02 18:23:56.568993', '2025-10-02 18:23:56.568993');

-- =====================
-- TABLE: states
-- =====================
INSERT INTO states (id, name, code, is_active, created_at) VALUES
('17d72383-382f-4d08-bfe9-8b2aa22ec1fc', 'Maharashtra-HXi2YR', 'MH', true, '2025-10-02 18:40:11.787781'),
('5b052383-88e5-4367-a6b7-bcacfaf08c4c', 'Maharashtra-awE6bR', 'MH', true, '2025-10-02 18:29:59.579029');

-- =====================
-- TABLE: cities
-- =====================
INSERT INTO cities (id, name, state_id, is_active, created_at) VALUES
('bf1fd2ae-065b-4ac2-9625-77dc92fcdfab', 'Mumbai-KdJTtT', '17d72383-382f-4d08-bfe9-8b2aa22ec1fc', true, '2025-10-02 18:41:20.627304'),
('6f11990a-e7a0-40ca-aed0-f8c9cfa86d1e', 'Mumbai-tvgyyC', '5b052383-88e5-4367-a6b7-bcacfaf08c4c', true, '2025-10-02 18:31:36.310403');

-- =====================
-- TABLE: parties
-- =====================
INSERT INTO parties (id, name, code, type, phone, email, gst_number, address, state_id, city_id, opening_balance, balance_type, is_active, created_at, updated_at, aadhar_card) VALUES
('9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', 'Ramesh kumar', 'P021', 'farmer', '8756412345', 'abc@gmail.com', NULL, NULL, '17d72383-382f-4d08-bfe9-8b2aa22ec1fc', 'bf1fd2ae-065b-4ac2-9625-77dc92fcdfab', 0.00, 'credit', true, '2025-10-10 19:17:36.838495', '2025-10-10 19:17:36.838495', NULL),
('515e665d-5381-4b37-8ab3-8cf759f4ffcb', 'Supplier-iMtFuQ9876543210supplier@test.com0', 'P001', 'buyer', '9876543210', NULL, NULL, NULL, NULL, NULL, 0.00, 'credit', true, '2025-10-02 18:44:48.07954', '2025-10-02 18:44:48.07954', NULL),
('183632e9-da41-4948-9e45-00717dfcfd0c', 'kulwinder', 'P011', 'farmer', '8975645666', 'abc@gmail.com', NULL, NULL, '17d72383-382f-4d08-bfe9-8b2aa22ec1fc', 'bf1fd2ae-065b-4ac2-9625-77dc92fcdfab', 2000.00, 'credit', true, '2025-10-02 18:54:30.498974', '2025-10-02 20:20:47.185', NULL);

-- =====================
-- TABLE: crops
-- =====================
INSERT INTO crops (id, name, variety, category, unit, description, is_active, created_at, updated_at) VALUES
('d963a8d7-5c99-4351-8a96-79405b9340fd', 'Cotton', 'variety new', 'other', 'quintal', NULL, true, '2025-10-10 19:18:09.540703', '2025-10-10 19:18:09.540703'),
('7e30e4f8-ade9-4d70-b3b3-68cb8528586d', 'Wheat-OrJv0D', 'Lokwan', NULL, 'quintal', 'Test crop created by automated test', true, '2025-10-02 18:32:29.41733', '2025-10-02 18:32:29.41733'),
('29f1d7ba-2bb3-4c87-a574-47d7598d060a', 'Wheat-UqkLbe', 'LokwanTest crop created by automated test', NULL, 'quintal', NULL, true, '2025-10-02 18:42:50.466199', '2025-10-02 18:42:50.466199');

-- =====================
-- TABLE: inventory
-- =====================
INSERT INTO inventory (id, crop_id, opening_stock, current_stock, average_rate, stock_value, min_stock_level, updated_at) VALUES
('21dd76e4-891f-49c7-a06d-96abaa607732', '29f1d7ba-2bb3-4c87-a574-47d7598d060a', 0.000, 0.000, 0.00, 0.00, 0.000, '2025-10-02 18:42:50.615777'),
('e91e3576-e5ec-4c36-bac4-de7d48aaed82', 'd963a8d7-5c99-4351-8a96-79405b9340fd', 0.000, 90.000, 1000.00, 90000.00, 0.000, '2025-10-15 21:55:05.963'),
('716953ce-c9e1-4fd0-8768-6be664f7e81e', '7e30e4f8-ade9-4d70-b3b3-68cb8528586d', 0.000, 219.000, 72.21, 15813.60, 0.000, '2025-10-15 21:55:24.619');

-- =====================
-- TABLE: transactions
-- =====================
INSERT INTO transactions (id, type, date, invoice_number, party_id, crop_id, quantity, rate, amount, payment_mode, notes, category, is_active, created_at, updated_at, payment_status, quality) VALUES
('1d7c15bf-ca50-4c8c-a745-d7e385d7b7de', 'purchase', '2025-10-15 00:00:00', NULL, '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', '7e30e4f8-ade9-4d70-b3b3-68cb8528586d', 14.000, 12.00, 168.00, 'cash', NULL, NULL, true, '2025-10-15 21:55:24.397876', '2025-10-15 21:55:24.397876', 'pending', NULL),
('e9cb8422-2699-45ce-bba9-5476a4083b77', 'purchase', '2025-10-15 00:00:00', NULL, '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', 'd963a8d7-5c99-4351-8a96-79405b9340fd', 100.000, 1000.00, 100000.00, 'cash', NULL, NULL, true, '2025-10-15 21:55:05.736072', '2025-10-15 21:55:05.736072', 'pending', NULL),
('916d3fe5-3ead-46b0-9cd4-c2a3d5000b15', 'expense', '2025-10-10 00:00:00', NULL, '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', NULL, NULL, NULL, 1000.00, 'credit', 'Expense for purchase ', 'Labor', true, '2025-10-10 19:28:19.439749', '2025-10-10 19:28:19.439749', 'pending', NULL),
('02f044d7-741c-4174-90ef-f18cdff020ca', 'expense', '2025-10-10 00:00:00', NULL, '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', NULL, NULL, NULL, 500.00, 'cash', 'Expense for purchase ', 'Transportation', true, '2025-10-10 19:18:51.885834', '2025-10-10 19:18:51.885834', 'pending', NULL),
('18e97e45-5276-423c-b7e0-87f89742ab8b', 'expense', '2025-10-02 00:00:00', 'INV-TEST-001-EXP', '515e665d-5381-4b37-8ab3-8cf759f4ffcb', NULL, NULL, NULL, 400.00, 'cash', 'Expense for purchase INV-TEST-001', 'Transportation', true, '2025-10-02 19:26:32.816389', '2025-10-02 21:05:35.103', 'pending', NULL);

-- =====================
-- TABLE: cash_register
-- =====================
INSERT INTO cash_register (id, date, type, description, reference, amount, balance, party_id, created_at) VALUES
('2eb7d845-a453-4bf2-aa14-52d24332bc4e', '2025-10-11 00:00:00', 'cash_out', 'bill clear ramesh', NULL, 10000.00, 21001.00, '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', '2025-10-10 19:22:36.276886'),
('9ab6a937-ec74-4cda-bfcb-971094d5c879', '2025-10-11 00:00:00', 'cash_in', 'cash added rokar', NULL, 15000.00, 31501.00, NULL, '2025-10-10 19:22:02.944542'),
('dd818050-d376-4719-9b1f-1ac3b9e100e9', '2025-10-11 00:00:00', 'cash_out', 'given to trasnporter', NULL, 500.00, 31001.00, NULL, '2025-10-10 19:24:05.84767'),
('2dee7b95-b17a-41fb-a95d-5e2a4833529b', '2025-10-06 00:00:00', 'cash_in', 'descrption test', NULL, 5000.00, 21501.00, '183632e9-da41-4948-9e45-00717dfcfd0c', '2025-10-06 16:25:47.199665'),
('c3cdfdad-cc4e-4573-9a5c-4199ae97b60c', '2025-10-06 00:00:00', 'cash_out', 'desc', NULL, 5000.00, 16501.00, '183632e9-da41-4948-9e45-00717dfcfd0c', '2025-10-06 16:47:42.274426'),
('005584f8-6780-4852-9e5c-87ea5a980687', '2025-10-06 00:00:00', 'cash_in', 'desc', NULL, 2500.00, 12501.00, '183632e9-da41-4948-9e45-00717dfcfd0c', '2025-10-06 16:44:29.104795'),
('519eb997-ea7b-4fd3-bd0a-45c4387222b9', '2025-10-06 00:00:00', 'cash_in', 'desc', NULL, 4000.00, 16501.00, '183632e9-da41-4948-9e45-00717dfcfd0c', '2025-10-06 16:40:12.5562'),
('03002224-fa2a-4c62-b861-90ac2acf8aa4', '2025-10-03 00:00:00', 'cash_in', 'descriptin', NULL, 10001.00, 10001.00, '183632e9-da41-4948-9e45-00717dfcfd0c', '2025-10-02 20:42:06.913344');

-- =====================
-- TABLE: party_ledger
-- =====================
INSERT INTO party_ledger (id, party_id, transaction_id, date, description, debit, credit, balance, created_at) VALUES
('bedd9b0b-4a43-4033-9bf1-9d0ebdb221a2', '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', '1d7c15bf-ca50-4c8c-a745-d7e385d7b7de', '2025-10-15 00:00:00', 'Purchase - N/A', 0.00, 168.00, 91668.00, '2025-10-15 21:55:24.979202'),
('11441198-94ba-410a-8050-9ffa5da612a1', '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', 'e9cb8422-2699-45ce-bba9-5476a4083b77', '2025-10-15 00:00:00', 'Purchase - N/A', 0.00, 100000.00, 91500.00, '2025-10-15 21:55:06.333719'),
('a6260632-b0f2-4fc8-8840-563875dacb14', '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', NULL, '2025-10-11 00:00:00', 'Cash Out - bill clear ramesh (Ref: 2eb7d845-a453-4bf2-aa14-52d24332bc4e)', 10000.00, 0.00, -8500.00, '2025-10-10 19:25:23.531238'),
('cd460b60-c71e-4811-a584-4095cf0ab409', '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', '916d3fe5-3ead-46b0-9cd4-c2a3d5000b15', '2025-10-10 00:00:00', 'Expense - Labor', 0.00, 1000.00, 1500.00, '2025-10-10 19:28:19.727266'),
('284b5e1b-2f16-4355-ab0c-c5e3bd72461e', '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', '02f044d7-741c-4174-90ef-f18cdff020ca', '2025-10-10 00:00:00', 'Expense - Transportation', 0.00, 500.00, 500.00, '2025-10-10 19:18:52.17911'),
('574576d2-f92b-4809-bef4-ce8e93cf0aa5', '183632e9-da41-4948-9e45-00717dfcfd0c', NULL, '2025-10-06 00:00:00', 'Cash Out - desc (Ref: c3cdfdad-cc4e-4573-9a5c-4199ae97b60c)', 5000.00, 0.00, 18501.00, '2025-10-06 16:54:54.135251'),
('a419b664-419e-48d4-aa82-6f93612616a6', '183632e9-da41-4948-9e45-00717dfcfd0c', NULL, '2025-10-06 00:00:00', 'Cash In - descrption test (Ref: 2dee7b95-b17a-41fb-a95d-5e2a4833529b)', 0.00, 5000.00, 23501.00, '2025-10-06 16:54:45.708848'),
('013de1c1-0d69-4106-9cab-85a54c506d4f', '183632e9-da41-4948-9e45-00717dfcfd0c', NULL, '2025-10-06 00:00:00', 'Cash In - desc (Ref: 519eb997-ea7b-4fd3-bd0a-45c4387222b9)', 0.00, 4000.00, 18501.00, '2025-10-06 16:54:34.44047'),
('562b9a3e-2bb1-4b17-8368-66c05e060128', '183632e9-da41-4948-9e45-00717dfcfd0c', NULL, '2025-10-06 00:00:00', 'Cash In - desc (Ref: 005584f8-6780-4852-9e5c-87ea5a980687)', 0.00, 2500.00, 14501.00, '2025-10-06 16:54:26.947401'),
('94c38718-d2f4-47d9-8d7a-f3d4b6ae87f5', '183632e9-da41-4948-9e45-00717dfcfd0c', NULL, '2025-10-03 00:00:00', 'Cash In - descriptin (Ref: 03002224-fa2a-4c62-b861-90ac2acf8aa4)', 0.00, 10001.00, 12001.00, '2025-10-06 16:54:12.293495'),
('3363e258-1bdc-4e3d-bafb-15ea0ac2de70', '515e665d-5381-4b37-8ab3-8cf759f4ffcb', '18e97e45-5276-423c-b7e0-87f89742ab8b', '2025-10-02 00:00:00', 'Expense - Transportation', 0.00, 400.00, 400.00, '2025-10-02 21:05:35.614476');

-- =====================
-- Database Summary
-- =====================
-- Total Users: 1
-- Total States: 2
-- Total Cities: 2
-- Total Parties: 3
-- Total Crops: 3
-- Total Inventory Items: 3
-- Total Transactions: 5 (active)
-- Total Cash Register Entries: 8
-- Total Party Ledger Entries: 11

-- Admin Login: admin@example.com / admin123
-- Current Cash Balance: ₹31,501
-- Total Inventory Value: ₹1,05,813.60

