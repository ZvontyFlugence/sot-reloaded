/*
  Warnings:

  - You are about to drop the column `currencyCode` on the `Country` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[countryId]` on the table `Currency` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `countryId` to the `Currency` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Country_currencyCode_key` ON `Country`;

-- AlterTable
ALTER TABLE `Country` DROP COLUMN `currencyCode`,
    ADD COLUMN `gold` DECIMAL(65, 30) NOT NULL DEFAULT 500.00;

-- AlterTable
ALTER TABLE `Currency` ADD COLUMN `countryId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `TreasuryBalanace` (
    `id` VARCHAR(191) NOT NULL,
    `countryId` INTEGER NOT NULL,
    `currencyCode` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL DEFAULT 10000.00,

    UNIQUE INDEX `TreasuryBalanace_currencyCode_key`(`currencyCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Currency_countryId_key` ON `Currency`(`countryId`);
