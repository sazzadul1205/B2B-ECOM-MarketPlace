-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 13, 2026 at 06:36 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `b2b-ecom-database`
--

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED NOT NULL,
  `receiver_id` bigint(20) UNSIGNED NOT NULL,
  `rfq_id` bigint(20) UNSIGNED DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `rfq_id`, `message`, `is_read`, `created_at`, `updated_at`) VALUES
(1, 2, 3, NULL, 'Your order #ORD-202603-0002 status has been updated from confirmed to processing.', 0, '2026-03-12 22:09:53', '2026-03-12 22:09:53'),
(2, 2, 3, 1, 'We have submitted a quote for your RFQ #RFQ-202603-0001. Quote Number: Q-202603-0001', 0, '2026-03-12 22:32:30', '2026-03-12 22:32:30'),
(3, 2, 3, 2, 'We have submitted a quote for your RFQ #RFQ-202603-0002. Quote Number: Q-202603-0002', 0, '2026-03-12 22:41:37', '2026-03-12 22:41:37'),
(4, 3, 2, 2, 'gagwg', 1, '2026-03-12 22:59:55', '2026-03-12 23:00:09'),
(5, 2, 3, NULL, 'ytyl', 0, '2026-03-12 23:00:15', '2026-03-12 23:00:15'),
(6, 2, 3, NULL, 'ytyl', 0, '2026-03-12 23:02:28', '2026-03-12 23:02:28');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_reset_tokens_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2026_03_11_060136_create_suppliers_table', 1),
(6, '2026_03_11_060200_create_products_table', 1),
(7, '2026_03_11_060214_create_product_bulk_prices_table', 1),
(8, '2026_03_11_060228_create_rfqs_table', 1),
(9, '2026_03_11_060249_create_rfq_quotes_table', 1),
(10, '2026_03_11_060305_create_messages_table', 1),
(11, '2026_03_11_060319_create_orders_table', 1),
(12, '2026_03_11_060339_create_order_items_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_number` varchar(255) NOT NULL,
  `buyer_id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `rfq_id` bigint(20) UNSIGNED DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `shipping_address` varchar(255) NOT NULL,
  `payment_status` enum('pending','paid') NOT NULL DEFAULT 'pending',
  `order_status` enum('pending_confirmation','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending_confirmation',
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `buyer_id`, `supplier_id`, `rfq_id`, `total_amount`, `shipping_address`, `payment_status`, `order_status`, `confirmed_at`, `created_at`, `updated_at`) VALUES
(1, 'ORD-202603-0001', 3, 1, NULL, 125000.00, 'Default Address', 'paid', 'confirmed', '2026-03-12 22:01:52', '2026-03-12 21:55:28', '2026-03-12 22:01:52'),
(2, 'ORD-202603-0002', 3, 2, NULL, 86700.00, 'Default Address', 'paid', 'processing', '2026-03-12 22:09:33', '2026-03-12 22:09:14', '2026-03-12 22:09:53');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `total_price`, `created_at`, `updated_at`) VALUES
(1, 1, 6, 'Saf1 Pink Dream Floor Cleaner | 1 ltr', 500, 250.00, 125000.00, '2026-03-12 21:55:28', '2026-03-12 21:55:28'),
(2, 2, 5, 'Evian Natural Mineral Water | 500 ml', 300, 289.00, 86700.00, '2026-03-12 22:09:14', '2026-03-12 22:09:14');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`email`, `token`, `created_at`) VALUES
('admin@example.com', '$2y$12$9wxTGdSnJA4Jjq4r6Bt4K.sNL4sYBCx3p.Z08Du0rt5QYTO5tKUwa', '2026-03-12 04:16:52');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(255) NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `minimum_order_quantity` int(11) NOT NULL DEFAULT 1,
  `unit` varchar(255) NOT NULL DEFAULT 'piece',
  `bulk_prices` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bulk_prices`)),
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `main_image` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `supplier_id`, `name`, `slug`, `description`, `category`, `base_price`, `minimum_order_quantity`, `unit`, `bulk_prices`, `stock_quantity`, `main_image`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 'DDR5', 'ddr5-69b2ec0b1c27e', 'DDR% is the fifth generation of Double Data Rate synchronous dynamic random-access memory used in modern computers. It provides significantly higher data transfer speeds, increased memory capacity, and improved power efficiency compared to previous generations such as DDR4. DDR5 is designed to handle demanding workloads, faster data processing, and better multitasking in modern computing systems.', 'Electronics', 7000.00, 20, 'piece', NULL, 10000, 'products/main/ZOi0sdOLQACStS7VKWEuZWr6bjn8LuaxoNjlQSPc.jpg', 'approved', '2026-03-12 10:38:35', '2026-03-12 11:50:44'),
(2, 2, 'LCD monitor 241V8/69 | Philips', 'lcd-monitor-241v869-philips-69b2fbad56c0d', 'Philips 241V8/69 LCD monitor with 24-inch Full HD display, slim design, and crisp visuals for everyday computing and productivity', 'Electronics', 12500.00, 10, 'piece', NULL, 20000, 'products/main/viBaCiblRyMBNYd2RN1LmmjfMkYrNSOZXd8leVhn.webp', 'approved', '2026-03-12 11:45:17', '2026-03-12 11:50:44'),
(3, 2, '200 ml Coca cola Can', '200-ml-coca-cola-can-69b2fc459b55f', 'Refreshing 200 ml Coca-Cola can, perfect for a quick cool drink anytime.', 'Food & Beverages', 30.00, 1000, 'piece', NULL, 1200000, 'products/main/M13delMMJc3Ebgb72F1trX0ecjt9hVMOJurKj7so.jpg', 'approved', '2026-03-12 11:47:49', '2026-03-12 11:50:44'),
(4, 1, 'Frutika Mango Juice | 1li', 'frutika-mango-juice-1li-69b3839da62ab', 'Frutika Mango Juice is manufactured by Akij Food and Beverage Limited. Frutika is made with treated water, mango pulp, refined sugar, citric acid, sodium citrate, sodium benzoate, and mango flavor. Frutika Mango Juice is fresh, tasty, and healthy.', 'Food & Beverages', 90.00, 100, 'piece', NULL, 100000, 'products/main/lmovdOxFAvJeQpXNArloFB7YGeop94o5i1yUkk3F.webp', 'approved', '2026-03-12 21:25:17', '2026-03-12 21:31:52'),
(5, 1, 'Evian Natural Mineral Water | 500 ml', 'evian-natural-mineral-water-500-ml-69b38409dbf06', 'Evian Natural Mineral Water is renowned for its purity and exceptional taste, sourced from the pristine springs of the French Alps. This 500 ml bottle of Evian is a refreshing and natural way to quench your thirst and stay hydrated throughout the day. Evian\'s balanced mineral composition and natural taste make it a favorite choice for those who appreciate the essence of pristine water. Trust in Evian to deliver a pure and refreshing drinking experience.', 'Food & Beverages', 289.00, 100, 'box', NULL, 200000, 'products/main/2pny5SAEU9UeGFkqil0cOLsQ1mTIPxuAD5bo9V0g.webp', 'approved', '2026-03-12 21:27:05', '2026-03-12 21:31:52'),
(6, 1, 'Saf1 Pink Dream Floor Cleaner | 1 ltr', 'saf1-pink-dream-floor-cleaner-1-ltr-69b384a65e27a', 'Keep your floors sparkling clean with Saf1 Floor Cleaner (Pink Dreams). Its effective cleaning formula removes dirt and grime while leaving a pleasant, long-lasting fragrance. Suitable for all types of floors, it ensures a fresh, shiny, and hygienic home environment with every use.', 'Chemicals', 250.00, 100, 'piece', NULL, 500000, 'products/main/Vh2XDyhpOo6Dwqme7KXn91ipE0rD7CqtMvkKfkyk.webp', 'approved', '2026-03-12 21:29:42', '2026-03-12 21:32:15'),
(7, 1, 'Evian Natural Mineral Water | 500 ml (Copy)', 'evian-natural-mineral-water-500-ml-copy-69b416518207c', 'Evian Natural Mineral Water is renowned for its purity and exceptional taste, sourced from the pristine springs of the French Alps. This 500 ml bottle of Evian is a refreshing and natural way to quench your thirst and stay hydrated throughout the day. Evian\'s balanced mineral composition and natural taste make it a favorite choice for those who appreciate the essence of pristine water. Trust in Evian to deliver a pure and refreshing drinking experience.', 'Food & Beverages', 289.00, 100, 'box', NULL, 200000, 'products/main/2pny5SAEU9UeGFkqil0cOLsQ1mTIPxuAD5bo9V0g.webp', 'pending', '2026-03-13 07:51:13', '2026-03-13 07:51:13');

-- --------------------------------------------------------

--
-- Table structure for table `product_bulk_prices`
--

CREATE TABLE `product_bulk_prices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `min_quantity` int(11) NOT NULL,
  `max_quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_bulk_prices`
--

INSERT INTO `product_bulk_prices` (`id`, `product_id`, `min_quantity`, `max_quantity`, `price`, `created_at`, `updated_at`) VALUES
(1, 1, 20, 50, 6900.00, '2026-03-12 10:38:35', '2026-03-12 10:38:35'),
(2, 1, 50, 100, 6800.00, '2026-03-12 10:38:35', '2026-03-12 10:38:35'),
(3, 1, 100, 1000, 6699.00, '2026-03-12 10:38:35', '2026-03-12 10:38:35'),
(4, 2, 20, 50, 12300.00, '2026-03-12 11:45:17', '2026-03-12 11:45:17'),
(5, 2, 50, 100, 12000.00, '2026-03-12 11:45:17', '2026-03-12 11:45:17'),
(6, 3, 5000, 10000, 29.00, '2026-03-12 11:47:49', '2026-03-12 11:47:49'),
(7, 3, 10000, 50000, 28.00, '2026-03-12 11:47:49', '2026-03-12 11:47:49'),
(8, 3, 50000, 100000, 27.00, '2026-03-12 11:47:49', '2026-03-12 11:47:49'),
(9, 4, 500, 1000, 89.00, '2026-03-12 21:25:17', '2026-03-12 21:25:17'),
(10, 4, 1000, 5000, 88.00, '2026-03-12 21:25:17', '2026-03-12 21:25:17'),
(11, 5, 500, 1000, 188.00, '2026-03-12 21:27:05', '2026-03-12 21:27:05'),
(12, 5, 1001, 5000, 187.00, '2026-03-12 21:27:06', '2026-03-12 21:27:06'),
(13, 6, 500, 1000, 245.00, '2026-03-12 21:29:42', '2026-03-12 21:29:42'),
(14, 6, 1000, 5000, 240.00, '2026-03-12 21:29:42', '2026-03-12 21:29:42'),
(15, 6, 5000, 10000, 235.00, '2026-03-12 21:29:42', '2026-03-12 21:29:42'),
(16, 7, 500, 1000, 188.00, '2026-03-13 07:51:13', '2026-03-13 07:51:13'),
(17, 7, 1001, 5000, 187.00, '2026-03-13 07:51:13', '2026-03-13 07:51:13');

-- --------------------------------------------------------

--
-- Table structure for table `rfqs`
--

CREATE TABLE `rfqs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `rfq_number` varchar(255) NOT NULL,
  `buyer_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `products_requested` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`products_requested`)),
  `quantity` int(11) NOT NULL,
  `required_by_date` date NOT NULL,
  `status` enum('open','quoted','closed') NOT NULL DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rfqs`
--

INSERT INTO `rfqs` (`id`, `rfq_number`, `buyer_id`, `title`, `description`, `products_requested`, `quantity`, `required_by_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'RFQ-202603-0001', 3, 'erer hertherwh htrhhrtw', 'rjrwejer jryjwe trjetrjy w', '[{\"name\":\"Evian Natural Mineral Water | 500 ml\",\"quantity\":20000,\"unit\":\"box\",\"specifications\":\"ae hethrj  jej5 j jejejet5j 5j5j7j e\",\"category\":\"Food & Beverages\"}]', 20000, '2026-03-27', 'open', '2026-03-12 22:12:11', '2026-03-12 22:12:11'),
(2, 'RFQ-202603-0002', 3, 'aegwae', 'agwergweg', '[{\"name\":\"Saf1 Pink Dream Floor Cleaner | 1 ltr\",\"quantity\":1000,\"unit\":\"piece\",\"specifications\":\"ergheraherh\",\"category\":\"Chemicals\"}]', 1000, '2026-03-20', 'closed', '2026-03-12 22:40:55', '2026-03-12 22:41:46');

-- --------------------------------------------------------

--
-- Table structure for table `rfq_quotes`
--

CREATE TABLE `rfq_quotes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quote_number` varchar(255) NOT NULL,
  `rfq_id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `product_breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`product_breakdown`)),
  `valid_until` date NOT NULL,
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rfq_quotes`
--

INSERT INTO `rfq_quotes` (`id`, `quote_number`, `rfq_id`, `supplier_id`, `total_amount`, `product_breakdown`, `valid_until`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Q-202603-0001', 1, 2, 4000000.00, '[{\"product_id\":6,\"name\":\"Saf1 Pink Dream Floor Cleaner | 1 ltr\",\"quantity\":20000,\"unit_price\":200,\"total_price\":4000000}]', '2026-03-26', 'rejected', '2026-03-12 22:32:30', '2026-03-12 22:39:58'),
(2, 'Q-202603-0002', 2, 2, 80000.00, '[{\"product_id\":4,\"name\":\"Frutika Mango Juice | 1li\",\"quantity\":1000,\"unit_price\":80,\"total_price\":80000}]', '2026-03-28', 'accepted', '2026-03-12 22:41:37', '2026-03-12 22:41:46');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `trade_license_number` varchar(255) NOT NULL,
  `company_phone` varchar(255) NOT NULL,
  `company_email` varchar(255) NOT NULL,
  `company_address` text NOT NULL,
  `city` varchar(255) NOT NULL,
  `verification_status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `user_id`, `company_name`, `trade_license_number`, `company_phone`, `company_email`, `company_address`, `city`, `verification_status`, `created_at`, `updated_at`) VALUES
(1, 2, 'PT Supplier Makmur', 'SIUP-12345-2024', '021-5551234', 'contact@suppliermakmur.com', 'Jl. Industri Raya No. 45, Jakarta Barat', 'Jakarta', 'verified', '2026-03-12 04:01:27', '2026-03-12 04:01:27'),
(2, 5, 'PT Supplier Makmur', 'PPT-221331', '01917335945', 'psazzadul1205@gmail.com', 'grawe hgera gherdhgaerdgh', 'derahaderhaedrherh', 'verified', '2026-03-12 10:30:24', '2026-03-12 10:30:55');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','supplier','buyer') NOT NULL DEFAULT 'buyer',
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin@example.com', '$2y$12$LNDU1NhpmWCWDI.b/gR/LulnB9nWCKDAGhXajnQM2HP2GJ.K3RQIm', 'admin', 1, '2026-03-12 04:01:24', '2026-03-12 04:01:24'),
(2, 'Supplier User', 'supplier@example.com', '$2y$12$VATNk7RTZFkqkBYnuoFZxuH9p7dvXxyZsdWxqpMzNgolExWVy45Ui', 'supplier', 1, '2026-03-12 04:01:25', '2026-03-12 04:01:25'),
(3, 'Buyer User', 'buyer@example.com', '$2y$12$DXM0Rc0Ms/sw9m6PBQKHyOyz3gtEB.HBKQvarx84MnaMI6yRhWSCS', 'buyer', 1, '2026-03-12 04:01:25', '2026-03-12 04:01:25'),
(4, 'Md Shafikul Islam ii', 'psazzadul@gmail.com', '$2y$12$jTut3.WlGlj/wqq7JMoYz.oJT320NZX1cire.OAkxIEKKtrs.JS.G', 'buyer', 1, '2026-03-12 04:18:09', '2026-03-12 10:31:43'),
(5, 'Pritom Admin', 'pritom1205@gmail.com', '$2y$12$89d072e608ApQDCMWXV7kek9dkw0F8I7VRhT8M2XpNVZ7pfRy0pJi', 'supplier', 1, '2026-03-12 10:30:24', '2026-03-12 10:30:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_sender_id_foreign` (`sender_id`),
  ADD KEY `messages_receiver_id_foreign` (`receiver_id`),
  ADD KEY `messages_rfq_id_foreign` (`rfq_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_order_number_unique` (`order_number`),
  ADD KEY `orders_buyer_id_foreign` (`buyer_id`),
  ADD KEY `orders_supplier_id_foreign` (`supplier_id`),
  ADD KEY `orders_rfq_id_foreign` (`rfq_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_foreign` (`order_id`),
  ADD KEY `order_items_product_id_foreign` (`product_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`),
  ADD KEY `products_supplier_id_foreign` (`supplier_id`);

--
-- Indexes for table `product_bulk_prices`
--
ALTER TABLE `product_bulk_prices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_bulk_prices_product_id_foreign` (`product_id`);

--
-- Indexes for table `rfqs`
--
ALTER TABLE `rfqs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rfqs_rfq_number_unique` (`rfq_number`),
  ADD KEY `rfqs_buyer_id_foreign` (`buyer_id`);

--
-- Indexes for table `rfq_quotes`
--
ALTER TABLE `rfq_quotes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rfq_quotes_rfq_id_supplier_id_unique` (`rfq_id`,`supplier_id`),
  ADD UNIQUE KEY `rfq_quotes_quote_number_unique` (`quote_number`),
  ADD KEY `rfq_quotes_supplier_id_foreign` (`supplier_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `suppliers_user_id_foreign` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `product_bulk_prices`
--
ALTER TABLE `product_bulk_prices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `rfqs`
--
ALTER TABLE `rfqs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `rfq_quotes`
--
ALTER TABLE `rfq_quotes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_receiver_id_foreign` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `messages_rfq_id_foreign` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_buyer_id_foreign` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_rfq_id_foreign` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_bulk_prices`
--
ALTER TABLE `product_bulk_prices`
  ADD CONSTRAINT `product_bulk_prices_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rfqs`
--
ALTER TABLE `rfqs`
  ADD CONSTRAINT `rfqs_buyer_id_foreign` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `rfq_quotes`
--
ALTER TABLE `rfq_quotes`
  ADD CONSTRAINT `rfq_quotes_rfq_id_foreign` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rfq_quotes_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD CONSTRAINT `suppliers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
