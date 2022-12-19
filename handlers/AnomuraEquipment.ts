import { EquipmentMetadataSetHandler, TransferHandler, } from "../generated/handlers";
import { ethers } from "ethers";
import prisma from "../prisma";
import axios from "axios";

import { EquipmentRarity, EquipmentType } from "@prisma/client";

const handleEquipmentMetadataSetHandler: EquipmentMetadataSetHandler = async (event, context) => {

    try {
        // console.log(event)
     
        let collectionAddress = ethers.utils.getAddress(event.address.toString());// || process.env.ANOMURA_EQUIPMENT_ADDRESS);
        let equipmentId = parseInt(event.params.equipmentId.toString());
        let equipmentName = event.params.equipmentName;
        let equipmentType = event.params.equipmentType;
        let equipmentRarity = event.params.equipmentRarity;

        let equipmentQuery = await prisma.equipment.findUnique({
            where: {
                collectionAddress_equipmentId: { collectionAddress, equipmentId },
            },
        });

        // Only process if not reveal yet
        if (!equipmentQuery?.isReveal) {
            let equipmentPostApi = `${process.env.ANOMURA_WEBSITE}/api/equipment/post/${equipmentId}`;
            console.log(`Trying to reveal equipmentId: ${equipmentId}`);

            let newEquipmentOp = await axios.post(
                equipmentPostApi,
                {
                    collectionAddress,
                    equipmentName,
                    equipmentType,
                    equipmentRarity,
                },
                {
                    headers: {
                        Authorization: `Bot ${process.env.ANOMURA_WEBSITE_SECRET}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (newEquipmentOp) {
                console.log(`Reveal done, track in log to not process again`);
            }
        } else {
            console.log(`Equipment ${equipmentId} revealed. No need to upsert`);
        }
    } catch (error) {
        console.log("error posting new equipmnent to nextjs website: " + error);
    }
};

const handleOnTransferAsMint: TransferHandler = async (event, context) => {
    // console.log("equipmentId: ", parseInt(event.params.tokenId.toString()));

    try {
        let fromAddress = event.params.from.toString();

        if (fromAddress === `0x0000000000000000000000000000000000000000`) {
            let toAddress = event.params.to.toString();
            let equipmentId = parseInt(event.params.tokenId.toString());
            let collectionAddress = ethers.utils.getAddress(event.address.toString())//process.env.ANOMURA_EQUIPMENT_ADDRESS);

            let equipmentQuery = await prisma.equipment.findUnique({
                where: {
                    collectionAddress_equipmentId: { collectionAddress, equipmentId },
                },
            });

            if (!equipmentQuery) {
                console.log(`Creating new equipment that not reveal - equipmentId: ${equipmentId}`);

                let mintOp = await prisma.equipment.upsert({
                    where: {
                        collectionAddress_equipmentId: { collectionAddress, equipmentId },
                    },
                    create: {
                        equipmentId,
                        collectionAddress,
                        equipmentName: "Mystery Rune of DeepSea",
                    },
                    update: {
                        owner: "",
                    }, // do nothing
                });
            } else {
                console.log(`Equipment existed. No need to create`);
            }
        }
    } catch (error) {
        console.log("error saving new equipment: " + error);
    }
};

export const AnomuraEquipment = {
    EquipmentMetadataSet: handleEquipmentMetadataSetHandler,
    Transfer: handleOnTransferAsMint,
};

// const getEquipmentType = (type: EquipmentType) => {
//     switch (type) {
//         case 0:
//             return EquipmentType.BODY;
//         case 1:
//             return EquipmentType.CLAWS;
//         case 2:
//             return EquipmentType.LEGS;
//         case 3:
//             return EquipmentType.SHELL;
//         case 4:
//             return EquipmentType.HEADPIECES;
//         case 5:
//             return EquipmentType.HABITAT;
//         default:
//             console.log(type);
//             throw new Error(`invalid equipment type map`);
//     }
// };
// const getEquipmentRarity = (rarity: EquipmentRarity) => {
//     switch (rarity) {
//         case 0:
//             return EquipmentRarity.NORMAL;
//         case 1:
//             return EquipmentRarity.MAGIC;
//         case 2:
//             return EquipmentRarity.RARE;
//         case 3:
//             return EquipmentRarity.LEGENDARY;
//         default:
//             throw new Error(`invalid equipment rarity map`);
//     }
// };
