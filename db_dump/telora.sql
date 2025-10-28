-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 28, 2025 at 01:53 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `telora`
--

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `id` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `messid` text NOT NULL,
  `content` text DEFAULT NULL,
  `is_reply` int(11) NOT NULL DEFAULT 0,
  `ts` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `amt` text DEFAULT NULL,
  `ts` text DEFAULT NULL,
  `chatid` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `chatid` varchar(20) NOT NULL,
  `metadata` text DEFAULT NULL,
  `reg_ts` text NOT NULL,
  `total_mess` int(11) NOT NULL DEFAULT 0,
  `total_rep` int(11) NOT NULL DEFAULT 0,
  `is_prem` int(11) NOT NULL DEFAULT 0,
  `prem_exp` text DEFAULT NULL,
  `last_rep_ts` text DEFAULT NULL,
  `curr_rep_count` int(11) NOT NULL DEFAULT 0,
  `summary` text DEFAULT NULL,
  `rep_since_summ` int(11) NOT NULL DEFAULT 0,
  `last_summ_ts` text DEFAULT NULL,
  `is_blocked` int(11) NOT NULL DEFAULT 0,
  `is_infer` int(11) NOT NULL DEFAULT 0,
  `is_infer_ts` text CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `temp_mess` text DEFAULT NULL,
  `pur_mess_id` text DEFAULT NULL,
  `temp_lang` text DEFAULT NULL,
  `temp_name` text DEFAULT NULL,
  `temp_mess_id` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`),
  ADD KEY `message_user_FK` (`userid`);

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_unique` (`chatid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `message_user_FK` FOREIGN KEY (`userid`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
