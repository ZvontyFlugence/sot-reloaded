/*
  Warnings:

  - You are about to alter the column `xp` on the `User` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `strength` on the `User` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `militaryRank` on the `User` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `totalDmg` on the `User` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `xp` INTEGER NOT NULL DEFAULT 0,
    MODIFY `strength` INTEGER NOT NULL DEFAULT 0,
    MODIFY `militaryRank` INTEGER NOT NULL DEFAULT 0,
    MODIFY `totalDmg` INTEGER NOT NULL DEFAULT 0;
