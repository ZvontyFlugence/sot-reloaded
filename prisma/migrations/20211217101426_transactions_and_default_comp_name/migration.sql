/*
  Warnings:

  - You are about to alter the column `image` on the `Company` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Company` MODIFY `image` VARCHAR(191) NOT NULL DEFAULT 'default-comp.png';
