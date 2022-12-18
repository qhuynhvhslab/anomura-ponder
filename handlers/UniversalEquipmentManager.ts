import { UniversalBindHandler, UniversalUnbindHandler } from "../generated/handlers";
import { ethers } from "ethers";
import prisma from "../prisma";

import { Equipment, EquipmentRarity, EquipmentType } from "@prisma/client";

const handleUniversalBindHandler: UniversalBindHandler = async (event, context) => {
    console.log("Handling Bind Event!");

    try {
        let anomuraAddress = ethers.utils.getAddress(event.params.fromAddress);
        let anomuraId = parseInt(event.params.fromToken.toString());
        let equipmentCollectionAddress = ethers.utils.getAddress(event.params.toAddress);
        let equipmentId = parseInt(event.params.toToken.toString());
        let sender = ethers.utils.getAddress(event.params.user);

        let transactionHash = event.transactionHash;
        let blockNumber = event.blockNumber;
        let blockHash = event.blockHash;
        let logId = event.logId;

        let universalManagerLogQuery = await prisma.universalEquipmentManagerLog.findUnique({
            where: {
                blockNumber_blockHash_transactionHash_logId: {
                    blockNumber,
                    blockHash,
                    transactionHash,
                    logId,
                },
            },
        });

        // Only process if not in UniversalManager Contract Log yet
        if (universalManagerLogQuery) {
            console.log(`This transaction# ${transactionHash} has been processed`);
        } else {
            console.log(
                `This bind transaction# ${transactionHash} has NOT been processed. Going to Bind`
            );

            console.log(
                `Anomura Address: ${anomuraAddress}\nanomuraId: ${anomuraId} \nequipmentCollectionAddress: ${equipmentCollectionAddress} \nequipmentId: ${equipmentId} \nsender: ${sender}\n`
            );
            console.log(
                `transactionHash: ${transactionHash}\nblockNumber: ${blockNumber} \nblockHash: ${blockHash} \nlogId: ${logId}\n`
            );
            // query id of the equipmentId as we connect to its unique Id, not the equipmentId that may be same as other collection
            let equipment = await prisma.equipment.findUnique({
                where: {
                    collectionAddress_equipmentId: {
                        collectionAddress: equipmentCollectionAddress,
                        equipmentId,
                    },
                },
            });

            if (!equipment) {
                console.log(
                    `The equipment # ${equipmentId} of collection ${equipmentCollectionAddress} cannot be queried`
                );
                // catch to error
                return;
            }

            let bindOp = prisma.anomuras.update({
                where: {
                    crabId: anomuraId,
                },
                data: {
                    equipments: {
                        connect: { id: equipment.id },
                    },
                },
            });

            let contractLogOp = prisma.universalEquipmentManagerLog.create({
                data: {
                    transactionHash,
                    blockNumber,
                    blockHash,
                    logId,
                    fromAddress: anomuraAddress,
                    fromTokenId: anomuraId,
                    toAddress: equipmentCollectionAddress,
                    toTokenId: equipmentId,
                    sender,
                    action: "Bind",
                },
            });

            await prisma.$transaction([bindOp, contractLogOp]);
        }
    } catch (error) {
        console.log("Bind error!");
        let message;
        if (error instanceof Error) message = error.message;
        else message = String(error);

        await prisma.universalEquipmentManagerLogError.create({
            data: {
                transactionHash,
                fromAddress: anomuraAddress,
                fromTokenId: anomuraId,
                toAddress: equipmentCollectionAddress,
                toTokenId: equipmentId,
                sender,
                error: `Bind error: ${message}`,
                action: "Bind",
            },
        });
    }
};

const handleUniversalUnbindHandler: UniversalUnbindHandler = async (event, context) => {
    console.log("Handling Unbind Event!");
    
    try {
        let anomuraAddress = ethers.utils.getAddress(event.params.fromAddress);
        let anomuraId = parseInt(event.params.fromToken.toString());
        let equipmentCollectionAddress = ethers.utils.getAddress(event.params.toAddress);
        let equipmentId = parseInt(event.params.toToken.toString());
        let sender = ethers.utils.getAddress(event.params.user);

        let transactionHash = event.transactionHash;
        let blockNumber = event.blockNumber;
        let blockHash = event.blockHash;
        let logId = event.logId;

        let universalManagerLogQuery = await prisma.universalEquipmentManagerLog.findUnique({
            where: {
                blockNumber_blockHash_transactionHash_logId: {
                    blockNumber,
                    blockHash,
                    transactionHash,
                    logId,
                },
            },
        });

        // Only process if not in UniversalManager Contract Log yet
        if (universalManagerLogQuery) {
            console.log(`This Unbind transaction# ${transactionHash} has been processed`);
        } else {
            console.log(
                `This Unbind transaction# ${transactionHash} has NOT been processed. Going to Unbind.`
            );

            console.log(
                `Anomura Address: ${anomuraAddress}\nanomuraId: ${anomuraId} \nequipmentCollectionAddress: ${equipmentCollectionAddress} \nequipmentId: ${equipmentId} \nsender: ${sender}\n`
            );
            console.log(
                `transactionHash: ${transactionHash}\nblockNumber: ${blockNumber} \nblockHash: ${blockHash} \nlogId: ${logId} \n`
            );
            // query id of the equipmentId as we connect / disconnect to its unique Id, not the equipmentId that may be same as other collection
            let equipment = await prisma.equipment.findUnique({
                where: {
                    collectionAddress_equipmentId: {
                        collectionAddress: equipmentCollectionAddress,
                        equipmentId,
                    },
                },
            });

            if (!equipment) {
                console.log(
                    `The equipment # ${equipmentId} of collection ${equipmentCollectionAddress} cannot be queried`
                );
                // catch to error
                return;
            }
            // Update to isEquipped FALSE many
            let updateIsEquipToFalseOp = prisma.equipment.update({
                where: {
                    id: equipment.id,
                },
                data: {
                    isEquipped: false,
                },
            });

            let unbindOp = prisma.anomuras.update({
                where: {
                    crabId: anomuraId,
                },
                data: {
                    equipments: {
                        disconnect: { id: equipment.id },
                    },
                },
            });

            let contractLogOp = prisma.universalEquipmentManagerLog.create({
                data: {
                    transactionHash,
                    blockNumber,
                    blockHash,
                    logId,
                    fromAddress: anomuraAddress,
                    fromTokenId: anomuraId,
                    toAddress: equipmentCollectionAddress,
                    toTokenId: equipmentId,
                    sender,
                    action: "Unbind",
                },
            });

            await prisma.$transaction([unbindOp, updateIsEquipToFalseOp, contractLogOp]);
        }
    } catch (error) {
        console.log("Unbind error!");
        let message;
        if (error instanceof Error) message = error.message;
        else message = String(error);

        await prisma.universalEquipmentManagerLogError.create({
            data: {
                transactionHash,
                fromAddress: anomuraAddress,
                fromTokenId: anomuraId,
                toAddress: equipmentCollectionAddress,
                toTokenId: equipmentId,
                sender,
                error: `Unbind error: ${message}`,
                action: "Unbind",
            },
        });
    }
};

export const UniversalEquipmentManager = {
    UniversalBind: handleUniversalBindHandler,
    UniversalUnbind: handleUniversalUnbindHandler,
};
