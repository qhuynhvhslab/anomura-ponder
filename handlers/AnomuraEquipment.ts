import { EquipmentMetadataSetHandler, TransferHandler, } from "../generated/handlers";
import { ethers } from "ethers";
import {prisma} from "../prisma";
import axios from "axios";

import { EquipmentRarity, EquipmentType } from "@prisma/client";

const handleEquipmentMetadataSetHandler: EquipmentMetadataSetHandler = async (event, context) => {
    // console.log("\nRevealing equipment Id: ", parseInt(event.params.equipmentId.toString()));
    // console.log("Name: ", event.params.equipmentName);
    // console.log("Type: ", event.params.equipmentType);
    // console.log("Rarity: ", event.params.equipmentRarity);
    let equipmentId = parseInt(event.params.equipmentId.toString());
    try {
  
        let collectionAddress = ethers.utils.getAddress(event.address.toString());// || process.env.ANOMURA_EQUIPMENT_ADDRESS);
        
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
            console.log(`Trying to reveal equipmentId: ${equipmentId} with attributes: ${equipmentName} ${equipmentType} ${equipmentRarity}`);

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
            ).then(r =>r.data);
            sleep();
            if (!newEquipmentOp?.isError) {
            
                console.log(`Reveal done, track in log to not process again`);
            }
            else{
                console.log(`found error`);
                console.log(newEquipmentOp?.isError);
            }
        } else {
            console.log(`Equipment ${equipmentId} revealed. No need to upsert`);
        }
    } catch (error) {
        console.log("error posting new equipmnent to nextjs website: " + error);

        let message;
        if (error instanceof Error) message = error.message;
        else message = String(error);

        let url = `Catch error on handleEquipmentMetadataSetHandler at equipmentId ${equipmentId}`, referer ="", userAgent="";

        await prisma.logError.create({
            data: {
                url,
                referer,
                userAgent,
                content: {
                    message
                }
            }
        })
    }
};

const handleOnTransferAsMint: TransferHandler = async (event, context) => {
    let equipmentId = parseInt(event.params.tokenId.toString());
    try {
        let fromAddress = event.params.from.toString();

        if (fromAddress === `0x0000000000000000000000000000000000000000`) {
            let toAddress = event.params.to.toString();
            
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
                        equipmentName: "Mystery Rune of The DeepSea",
                    },
                    update: {
                        owner: "",
                    }, // do nothing
                });
                sleep();
            } else {
                console.log(`Equipment ${equipmentId} existed. No need to create`);
            }
        }
    } catch (error) {
        console.log("error saving new equipment: " + error);
 
        let message;
        if (error instanceof Error) message = error.message;
        else message = String(error);

        let url = `Catch error on handleOnTransferAsMint at equipmentId ${equipmentId}`, referer ="", userAgent="";

        await prisma.logError.create({
            data: {
                url,
                referer,
                userAgent,
                content: {
                    message
                }
            }
        })
    }
};

function sleep(ms = 1000) {
    return new Promise((res) => setTimeout(res, ms));
  }

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
