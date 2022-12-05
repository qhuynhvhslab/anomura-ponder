
import { PrismaClient, EquipmentRarity, EquipmentType } from '@prisma/client'

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}
export default prisma

export const EquipmentRarity = EquipmentRarity; 
export const EquipmentType =EquipmentType;