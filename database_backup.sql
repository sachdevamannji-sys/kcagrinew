--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_party_id_parties_id_fk;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_crop_id_crops_id_fk;
ALTER TABLE IF EXISTS ONLY public.party_ledger DROP CONSTRAINT IF EXISTS party_ledger_transaction_id_transactions_id_fk;
ALTER TABLE IF EXISTS ONLY public.party_ledger DROP CONSTRAINT IF EXISTS party_ledger_party_id_parties_id_fk;
ALTER TABLE IF EXISTS ONLY public.parties DROP CONSTRAINT IF EXISTS parties_state_id_states_id_fk;
ALTER TABLE IF EXISTS ONLY public.parties DROP CONSTRAINT IF EXISTS parties_city_id_cities_id_fk;
ALTER TABLE IF EXISTS ONLY public.inventory DROP CONSTRAINT IF EXISTS inventory_crop_id_crops_id_fk;
ALTER TABLE IF EXISTS ONLY public.cities DROP CONSTRAINT IF EXISTS cities_state_id_states_id_fk;
ALTER TABLE IF EXISTS ONLY public.cash_register DROP CONSTRAINT IF EXISTS cash_register_party_id_parties_id_fk;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.states DROP CONSTRAINT IF EXISTS states_pkey;
ALTER TABLE IF EXISTS ONLY public.states DROP CONSTRAINT IF EXISTS states_name_unique;
ALTER TABLE IF EXISTS ONLY public.party_ledger DROP CONSTRAINT IF EXISTS party_ledger_pkey;
ALTER TABLE IF EXISTS ONLY public.parties DROP CONSTRAINT IF EXISTS parties_pkey;
ALTER TABLE IF EXISTS ONLY public.parties DROP CONSTRAINT IF EXISTS parties_code_unique;
ALTER TABLE IF EXISTS ONLY public.inventory DROP CONSTRAINT IF EXISTS inventory_pkey;
ALTER TABLE IF EXISTS ONLY public.crops DROP CONSTRAINT IF EXISTS crops_pkey;
ALTER TABLE IF EXISTS ONLY public.cities DROP CONSTRAINT IF EXISTS cities_pkey;
ALTER TABLE IF EXISTS ONLY public.cash_register DROP CONSTRAINT IF EXISTS cash_register_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.states;
DROP TABLE IF EXISTS public.party_ledger;
DROP TABLE IF EXISTS public.parties;
DROP TABLE IF EXISTS public.inventory;
DROP TABLE IF EXISTS public.crops;
DROP TABLE IF EXISTS public.cities;
DROP TABLE IF EXISTS public.cash_register;
DROP TYPE IF EXISTS public.transaction_type;
DROP TYPE IF EXISTS public.payment_status;
DROP TYPE IF EXISTS public.payment_mode;
DROP TYPE IF EXISTS public.party_type;
--
-- Name: party_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.party_type AS ENUM (
    'farmer',
    'buyer',
    'trader',
    'contractor',
    'thekedar',
    'company',
    'other'
);


--
-- Name: payment_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_mode AS ENUM (
    'cash',
    'credit',
    'bank_transfer',
    'cheque'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'completed'
);


--
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transaction_type AS ENUM (
    'purchase',
    'sale',
    'expense',
    'cash_in',
    'cash_out'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cash_register; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cash_register (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    date timestamp without time zone NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    reference text,
    amount numeric(15,2) NOT NULL,
    balance numeric(15,2) NOT NULL,
    party_id character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    state_id character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: crops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crops (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    variety text,
    category text,
    unit text DEFAULT 'quintal'::text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    crop_id character varying NOT NULL,
    opening_stock numeric(15,3) DEFAULT '0'::numeric,
    current_stock numeric(15,3) DEFAULT '0'::numeric,
    average_rate numeric(15,2) DEFAULT '0'::numeric,
    stock_value numeric(15,2) DEFAULT '0'::numeric,
    min_stock_level numeric(15,3) DEFAULT '0'::numeric,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: parties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parties (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text,
    type public.party_type NOT NULL,
    phone text NOT NULL,
    email text,
    gst_number text,
    address text,
    state_id character varying,
    city_id character varying,
    opening_balance numeric(15,2) DEFAULT '0'::numeric,
    balance_type text DEFAULT 'credit'::text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    aadhar_card text
);


--
-- Name: party_ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.party_ledger (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    party_id character varying NOT NULL,
    transaction_id character varying,
    date timestamp without time zone NOT NULL,
    description text NOT NULL,
    debit numeric(15,2) DEFAULT '0'::numeric,
    credit numeric(15,2) DEFAULT '0'::numeric,
    balance numeric(15,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.states (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    type public.transaction_type NOT NULL,
    date timestamp without time zone NOT NULL,
    invoice_number text,
    party_id character varying,
    crop_id character varying,
    quantity numeric(15,3),
    rate numeric(15,2),
    amount numeric(15,2) NOT NULL,
    payment_mode public.payment_mode DEFAULT 'cash'::public.payment_mode,
    notes text,
    category text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status,
    quality text
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role text DEFAULT 'admin'::text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Data for Name: cash_register; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cash_register (id, date, type, description, reference, amount, balance, party_id, created_at) VALUES
	('03002224-fa2a-4c62-b861-90ac2acf8aa4', '2025-10-03 00:00:00', 'cash_in', 'descriptin', NULL, 10001.00, 10001.00, '183632e9-da41-4948-9e45-00717dfcfd0c', '2025-10-02 20:42:06.913344'),
	('005584f8-6780-4852-9e5c-87ea5a980687', '2025-10-06 00:00:00', 'cash_in', 'desc', NULL, 2500.00, 12501.00, '183632e9-da41-4948-9e45-00717dfcfd0c', '2025-10-06 16:44:29.104795'),
	('519eb997-ea7b-4fd3-bd0a-45c4387222b9', '2025-10-06 00:00:00', 'cash_in', 'desc', NULL, 4000.00, 16501.00, '183632e9-da41-4948-9e45-00717dfcfd0c', '2025-10-06 16:40:12.5562'),
	('2dee7b95-b17a-41fb-a95d-5e2a4833529b', '2025-10-06 00:00:00', 'cash_in', 'descrption test', NULL, 5000.00, 21501.00, '183632e9-da41-4948-9e45-00717dfcfd0c', '2025-10-06 16:25:47.199665'),
	('c3cdfdad-cc4e-4573-9a5c-4199ae97b60c', '2025-10-06 00:00:00', 'cash_out', 'desc', NULL, 5000.00, 16501.00, '183632e9-da41-4948-9e45-00717dfcfd0c', '2025-10-06 16:47:42.274426'),
	('9ab6a937-ec74-4cda-bfcb-971094d5c879', '2025-10-11 00:00:00', 'cash_in', 'cash added rokar', NULL, 15000.00, 31501.00, NULL, '2025-10-10 19:22:02.944542'),
	('dd818050-d376-4719-9b1f-1ac3b9e100e9', '2025-10-11 00:00:00', 'cash_out', 'given to trasnporter', NULL, 500.00, 31001.00, NULL, '2025-10-10 19:24:05.84767'),
	('2eb7d845-a453-4bf2-aa14-52d24332bc4e', '2025-10-11 00:00:00', 'cash_out', 'bill clear ramesh', NULL, 10000.00, 21001.00, '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', '2025-10-10 19:22:36.276886');


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cities (id, name, state_id, is_active, created_at) VALUES
	('6f11990a-e7a0-40ca-aed0-f8c9cfa86d1e', 'Mumbai-tvgyyC', '5b052383-88e5-4367-a6b7-bcacfaf08c4c', true, '2025-10-02 18:31:36.310403'),
	('bf1fd2ae-065b-4ac2-9625-77dc92fcdfab', 'Mumbai-KdJTtT', '17d72383-382f-4d08-bfe9-8b2aa22ec1fc', true, '2025-10-02 18:41:20.627304');


--
-- Data for Name: crops; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.crops (id, name, variety, category, unit, description, is_active, created_at, updated_at) VALUES
	('7e30e4f8-ade9-4d70-b3b3-68cb8528586d', 'Wheat-OrJv0D', 'Lokwan', NULL, 'quintal', 'Test crop created by automated test', true, '2025-10-02 18:32:29.41733', '2025-10-02 18:32:29.41733'),
	('29f1d7ba-2bb3-4c87-a574-47d7598d060a', 'Wheat-UqkLbe', 'LokwanTest crop created by automated test', NULL, 'quintal', NULL, true, '2025-10-02 18:42:50.466199', '2025-10-02 18:42:50.466199'),
	('d963a8d7-5c99-4351-8a96-79405b9340fd', 'Cotton', 'variety new', 'other', 'quintal', NULL, true, '2025-10-10 19:18:09.540703', '2025-10-10 19:18:09.540703');


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.inventory (id, crop_id, opening_stock, current_stock, average_rate, stock_value, min_stock_level, updated_at) VALUES
	('21dd76e4-891f-49c7-a06d-96abaa607732', '29f1d7ba-2bb3-4c87-a574-47d7598d060a', 0.000, 0.000, 0.00, 0.00, 0.000, '2025-10-02 18:42:50.615777'),
	('e91e3576-e5ec-4c36-bac4-de7d48aaed82', 'd963a8d7-5c99-4351-8a96-79405b9340fd', 0.000, 10.000, 1000.00, 10000.00, 0.000, '2025-10-10 19:18:50.969'),
	('716953ce-c9e1-4fd0-8768-6be664f7e81e', '7e30e4f8-ade9-4d70-b3b3-68cb8528586d', 0.000, 190.000, 76.32, 14500.00, 0.000, '2025-10-10 19:28:18.68');


--
-- Data for Name: parties; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.parties (id, name, code, type, phone, email, gst_number, address, state_id, city_id, opening_balance, balance_type, is_active, created_at, updated_at, aadhar_card) VALUES
	('515e665d-5381-4b37-8ab3-8cf759f4ffcb', 'Supplier-iMtFuQ9876543210supplier@test.com0', 'P001', 'buyer', '9876543210', NULL, NULL, NULL, NULL, NULL, 0.00, 'credit', true, '2025-10-02 18:44:48.07954', '2025-10-02 18:44:48.07954', NULL),
	('183632e9-da41-4948-9e45-00717dfcfd0c', 'kulwinder', 'P011', 'farmer', '8975645666', 'abc@gmail.com', NULL, NULL, '17d72383-382f-4d08-bfe9-8b2aa22ec1fc', 'bf1fd2ae-065b-4ac2-9625-77dc92fcdfab', 2000.00, 'credit', true, '2025-10-02 18:54:30.498974', '2025-10-02 20:20:47.185', NULL),
	('9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', 'Ramesh kumar', 'P021', 'farmer', '8756412345', 'abc@gmail.com', NULL, NULL, '17d72383-382f-4d08-bfe9-8b2aa22ec1fc', 'bf1fd2ae-065b-4ac2-9625-77dc92fcdfab', 0.00, 'credit', true, '2025-10-10 19:17:36.838495', '2025-10-10 19:17:36.838495', NULL);


--
-- Data for Name: party_ledger; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.party_ledger (id, party_id, transaction_id, date, description, debit, credit, balance, created_at) VALUES
	('2162bba1-0e24-4f9a-8252-b68d51237253', '515e665d-5381-4b37-8ab3-8cf759f4ffcb', '4e4197fd-40ba-4b15-a30a-6d9b871dbee9', '2025-10-02 00:00:00', 'Purchase - INV-TEST-001', 0.00, 5100.00, 5100.00, '2025-10-02 20:32:42.311121'),
	('3363e258-1bdc-4e3d-bafb-15ea0ac2de70', '515e665d-5381-4b37-8ab3-8cf759f4ffcb', '18e97e45-5276-423c-b7e0-87f89742ab8b', '2025-10-02 00:00:00', 'Expense - Transportation', 0.00, 400.00, 5500.00, '2025-10-02 21:05:35.614476'),
	('60dd03c6-5aaf-4b3c-addb-455017239569', '515e665d-5381-4b37-8ab3-8cf759f4ffcb', 'd9e3f781-2825-429b-8215-191782687ac5', '2025-10-02 00:00:00', 'Sale - 1', 2000.00, 0.00, 3100.00, '2025-10-02 21:31:23.232782'),
	('94c38718-d2f4-47d9-8d7a-f3d4b6ae87f5', '183632e9-da41-4948-9e45-00717dfcfd0c', NULL, '2025-10-03 00:00:00', 'Cash In - descriptin (Ref: 03002224-fa2a-4c62-b861-90ac2acf8aa4)', 0.00, 10001.00, 12001.00, '2025-10-06 16:54:12.293495'),
	('a6260632-b0f2-4fc8-8840-563875dacb14', '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', NULL, '2025-10-11 00:00:00', 'Cash Out - bill clear ramesh (Ref: 2eb7d845-a453-4bf2-aa14-52d24332bc4e)', 10000.00, 0.00, 500.00, '2025-10-10 19:25:23.531238'),
	('3338a96b-5c24-4849-aa12-c459a394a25f', '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', 'c10c9c64-8ad8-4ba6-8aad-6f699c12494d', '2025-10-10 00:00:00', 'Purchase - N/A', 0.00, 10000.00, 10000.00, '2025-10-10 19:19:27.916999'),
	('284b5e1b-2f16-4355-ab0c-c5e3bd72461e', '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', '02f044d7-741c-4174-90ef-f18cdff020ca', '2025-10-10 00:00:00', 'Expense - Transportation', 0.00, 500.00, 10500.00, '2025-10-10 19:18:52.17911'),
	('81184602-8123-4a2d-84e8-51d8ae6447bc', '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', 'd14fa72d-c94d-41e1-80de-2f2adf5ed487', '2025-10-10 00:00:00', 'Purchase - N/A', 0.00, 10000.00, 10500.00, '2025-10-10 19:28:19.039731'),
	('cd460b60-c71e-4811-a584-4095cf0ab409', '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', '916d3fe5-3ead-46b0-9cd4-c2a3d5000b15', '2025-10-10 00:00:00', 'Expense - Labor', 0.00, 1000.00, 1500.00, '2025-10-10 19:28:19.727266'),
	('562b9a3e-2bb1-4b17-8368-66c05e060128', '183632e9-da41-4948-9e45-00717dfcfd0c', NULL, '2025-10-06 00:00:00', 'Cash In - desc (Ref: 005584f8-6780-4852-9e5c-87ea5a980687)', 0.00, 2500.00, 14501.00, '2025-10-06 16:54:26.947401'),
	('013de1c1-0d69-4106-9cab-85a54c506d4f', '183632e9-da41-4948-9e45-00717dfcfd0c', NULL, '2025-10-06 00:00:00', 'Cash In - desc (Ref: 519eb997-ea7b-4fd3-bd0a-45c4387222b9)', 0.00, 4000.00, 18501.00, '2025-10-06 16:54:34.44047'),
	('a419b664-419e-48d4-aa82-6f93612616a6', '183632e9-da41-4948-9e45-00717dfcfd0c', NULL, '2025-10-06 00:00:00', 'Cash In - descrption test (Ref: 2dee7b95-b17a-41fb-a95d-5e2a4833529b)', 0.00, 5000.00, 23501.00, '2025-10-06 16:54:45.708848'),
	('574576d2-f92b-4809-bef4-ce8e93cf0aa5', '183632e9-da41-4948-9e45-00717dfcfd0c', NULL, '2025-10-06 00:00:00', 'Cash Out - desc (Ref: c3cdfdad-cc4e-4573-9a5c-4199ae97b60c)', 5000.00, 0.00, 18501.00, '2025-10-06 16:54:54.135251');


--
-- Data for Name: states; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.states (id, name, code, is_active, created_at) VALUES
	('5b052383-88e5-4367-a6b7-bcacfaf08c4c', 'Maharashtra-awE6bR', 'MH', true, '2025-10-02 18:29:59.579029'),
	('17d72383-382f-4d08-bfe9-8b2aa22ec1fc', 'Maharashtra-HXi2YR', 'MH', true, '2025-10-02 18:40:11.787781');


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.transactions (id, type, date, invoice_number, party_id, crop_id, quantity, rate, amount, payment_mode, notes, category, is_active, created_at, updated_at, payment_status, quality) VALUES
	('4e4197fd-40ba-4b15-a30a-6d9b871dbee9', 'purchase', '2025-10-02 00:00:00', 'INV-TEST-001', '515e665d-5381-4b37-8ab3-8cf759f4ffcb', '7e30e4f8-ade9-4d70-b3b3-68cb8528586d', 100.000, 51.00, 5100.00, 'cash', NULL, NULL, true, '2025-10-02 19:26:32.00463', '2025-10-02 20:32:41.802', 'pending', NULL),
	('18e97e45-5276-423c-b7e0-87f89742ab8b', 'expense', '2025-10-02 00:00:00', 'INV-TEST-001-EXP', '515e665d-5381-4b37-8ab3-8cf759f4ffcb', NULL, NULL, NULL, 400.00, 'cash', 'Expense for purchase INV-TEST-001', 'Transportation', true, '2025-10-02 19:26:32.816389', '2025-10-02 21:05:35.103', 'pending', NULL),
	('d9e3f781-2825-429b-8215-191782687ac5', 'sale', '2025-10-02 00:00:00', '1', '515e665d-5381-4b37-8ab3-8cf759f4ffcb', '7e30e4f8-ade9-4d70-b3b3-68cb8528586d', 10.000, 200.00, 2000.00, 'cash', NULL, NULL, true, '2025-10-02 21:31:22.648213', '2025-10-02 21:31:22.648213', 'pending', NULL),
	('02f044d7-741c-4174-90ef-f18cdff020ca', 'expense', '2025-10-10 00:00:00', NULL, '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', NULL, NULL, NULL, 500.00, 'cash', 'Expense for purchase ', 'Transportation', true, '2025-10-10 19:18:51.885834', '2025-10-10 19:18:51.885834', 'pending', NULL),
	('c10c9c64-8ad8-4ba6-8aad-6f699c12494d', 'purchase', '2025-10-10 00:00:00', NULL, '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', 'd963a8d7-5c99-4351-8a96-79405b9340fd', 10.000, 1000.00, 10000.00, 'cash', NULL, NULL, true, '2025-10-10 19:18:50.746721', '2025-10-10 19:19:27.412', 'pending', NULL),
	('d14fa72d-c94d-41e1-80de-2f2adf5ed487', 'purchase', '2025-10-10 00:00:00', NULL, '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', '7e30e4f8-ade9-4d70-b3b3-68cb8528586d', 100.000, 100.00, 10000.00, 'credit', NULL, NULL, true, '2025-10-10 19:28:18.460752', '2025-10-10 19:28:18.460752', 'pending', NULL),
	('916d3fe5-3ead-46b0-9cd4-c2a3d5000b15', 'expense', '2025-10-10 00:00:00', NULL, '9d9c055a-9bcd-4da8-80a8-a3b7aaa547c9', NULL, NULL, NULL, 1000.00, 'credit', 'Expense for purchase ', 'Labor', true, '2025-10-10 19:28:19.439749', '2025-10-10 19:28:19.439749', 'pending', NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, username, email, password, name, role, is_active, created_at, updated_at) VALUES
	('60f54927-4e4e-4029-98b0-61aae6cab05a', 'admin', 'admin@example.com', '$2b$10$tX5LNaseieok1CRvaelbXuzvQb3Agm0wdcS5nkw.C0RTXdp/qvYAS', 'Admin User', 'admin', true, '2025-10-02 18:23:56.568993', '2025-10-02 18:23:56.568993');


--
-- Name: cash_register cash_register_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_register
    ADD CONSTRAINT cash_register_pkey PRIMARY KEY (id);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: crops crops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crops
    ADD CONSTRAINT crops_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: parties parties_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parties
    ADD CONSTRAINT parties_code_unique UNIQUE (code);


--
-- Name: parties parties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parties
    ADD CONSTRAINT parties_pkey PRIMARY KEY (id);


--
-- Name: party_ledger party_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.party_ledger
    ADD CONSTRAINT party_ledger_pkey PRIMARY KEY (id);


--
-- Name: states states_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT states_name_unique UNIQUE (name);


--
-- Name: states states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT states_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: cash_register cash_register_party_id_parties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_register
    ADD CONSTRAINT cash_register_party_id_parties_id_fk FOREIGN KEY (party_id) REFERENCES public.parties(id);


--
-- Name: cities cities_state_id_states_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_state_id_states_id_fk FOREIGN KEY (state_id) REFERENCES public.states(id);


--
-- Name: inventory inventory_crop_id_crops_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_crop_id_crops_id_fk FOREIGN KEY (crop_id) REFERENCES public.crops(id);


--
-- Name: parties parties_city_id_cities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parties
    ADD CONSTRAINT parties_city_id_cities_id_fk FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: parties parties_state_id_states_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parties
    ADD CONSTRAINT parties_state_id_states_id_fk FOREIGN KEY (state_id) REFERENCES public.states(id);


--
-- Name: party_ledger party_ledger_party_id_parties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.party_ledger
    ADD CONSTRAINT party_ledger_party_id_parties_id_fk FOREIGN KEY (party_id) REFERENCES public.parties(id);


--
-- Name: party_ledger party_ledger_transaction_id_transactions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.party_ledger
    ADD CONSTRAINT party_ledger_transaction_id_transactions_id_fk FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: transactions transactions_crop_id_crops_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_crop_id_crops_id_fk FOREIGN KEY (crop_id) REFERENCES public.crops(id);


--
-- Name: transactions transactions_party_id_parties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_party_id_parties_id_fk FOREIGN KEY (party_id) REFERENCES public.parties(id);


--
-- PostgreSQL database dump complete
--

