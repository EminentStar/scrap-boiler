CREATE DATABASE IF NOT EXISTS testdb;
USE testdb;
CREATE TABLE IF NOT EXISTS repltest(id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY);
GRANT REPLICATION SLAVE ON *.* TO repluser@'%' IDENTIFIED BY '0000';
FLUSH PRIVILEGES;

