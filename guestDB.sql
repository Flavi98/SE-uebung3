-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server Version:               11.3.0-MariaDB - mariadb.org binary distribution
-- Server Betriebssystem:        Win64
-- HeidiSQL Version:             12.3.0.6589
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Exportiere Datenbank Struktur für guestdb
DROP DATABASE IF EXISTS `guestdb`;
CREATE DATABASE IF NOT EXISTS `guestdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `guestdb`;

-- Exportiere Struktur von Tabelle guestdb.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `username` varchar(50) NOT NULL,
  `firstname` varchar(50) DEFAULT NULL,
  `lastname` varchar(50) DEFAULT NULL,
  `passwort` varchar(50) DEFAULT NULL,
  `isAdmin` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Exportiere Daten aus Tabelle guestdb.users: ~5 rows (ungefähr)
REPLACE INTO `users` (`username`, `firstname`, `lastname`, `passwort`, `isAdmin`) VALUES
	('Admin', '', '', '123', 1),
	('flavi', 'Flavius', 'Stoianov', '123', 0),
	('marco', 'Marco', 'Kuvi', '123', 0),
	('paolino', 'Paolino', 'Merlin Valdez', '123', 0),
	('steve', 'Stefan', 'Hammerschmied', '123', 0);

-- Exportiere Struktur von Tabelle guestdb.veranstaltungen
DROP TABLE IF EXISTS `veranstaltungen`;
CREATE TABLE IF NOT EXISTS `veranstaltungen` (
  `id` int(50) NOT NULL AUTO_INCREMENT,
  `eventname` char(50) DEFAULT NULL,
  `users` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`users`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Exportiere Daten aus Tabelle guestdb.veranstaltungen: ~5 rows (ungefähr)
REPLACE INTO `veranstaltungen` (`id`, `eventname`, `users`) VALUES
	(1, 'Fussball', '["flavi", "marco"]'),
	(2, 'Tennis', '["flavi", "steve"]'),
	(3, 'Zocken', '["paolino"]'),
	(4, 'Lernen', '[]'),
	(5, 'Schwimmen', '[""]');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
