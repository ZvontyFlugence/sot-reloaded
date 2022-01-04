/*
  Warnings:

  - You are about to alter the column `currencyId` on the `FundsBalance` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(3)`.
  - You are about to alter the column `currencyCode` on the `TreasuryBalanace` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(3)`.
  - A unique constraint covering the columns `[currencyId]` on the table `FundsBalance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `FundsBalance` MODIFY `currencyId` VARCHAR(3) NOT NULL;

-- AlterTable
ALTER TABLE `TreasuryBalanace` MODIFY `currencyCode` VARCHAR(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `FundsBalance_currencyId_key` ON `FundsBalance`(`currencyId`);
