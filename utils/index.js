
import { EquipmentType, EquipmentRarity } from '@prisma/client'

export const getEquipmentType = (type) => {
  switch (type) {
    case 0:
      return EquipmentType.BODY;
    case 1:
      return EquipmentType.CLAWS;
    case 2:
      return EquipmentType.LEGS;
    case 3:
      return EquipmentType.SHELL;
    case 4:
      return EquipmentType.HEADPIECES;
    case 5:
      return EquipmentType.HABITAT;
    default:
      console.log(type);
      throw new Error(`invalid equipment type map`);
  }
};
export const getEquipmentRarity = (rarity) => {
  switch (rarity) {
    case 0:
      return EquipmentRarity.NORMAL;
    case 1:
      return EquipmentRarity.MAGIC;
    case 2:
      return EquipmentRarity.RARE;
    case 3:
      return EquipmentRarity.LEGENDARY;
    default:
      throw new Error(`invalid equipment rarity map`);
  }
};