
// import { PrismaClient } from '@prisma/client'

// let prisma: PrismaClient

// if (process.env.NODE_ENV === 'production') {
//   prisma = new PrismaClient()
// } else {
//   if (!global.prisma) {
//     global.prisma = new PrismaClient()
//   }
//   prisma = global.prisma
// }
// export default prisma

import { PrismaClient, EquipmentType } from '@prisma/client'

export const prisma =
    global.prisma ||
    new PrismaClient({
        // log: ['query']
    })

export const equipmentType = EquipmentType

if (process.env.NODE_ENV !== 'production') global.prisma = prisma