import {EquipmentMetadataSet, Transfer} from "../generated/handlers";
import { ethers } from "ethers";
import prisma from "../prisma";

const handleEquipmentMetadataSet: EquipmentMetadataSet = async (event: any, context) => {
  // console.log("new equipment metadataset!");

  // context.entities.GobbledArt.insert(`${event.params.nft}-${event.params.id}`, {
  //   id: `${event.params.nft}-${event.params.id}`,
  //   user: event.params.user,
  // });

  // console.log(`Block Log id: `, event.logId)
  // console.log(`BlocK number: `, event.blockNumber)
  // console.log("Test!!!!!!")
  // console.log(`equipmentId: ${event.params.equipmentId.toString()}`)
  // console.log(`equipmentName: ${event.params.equipmentName}`)
  // const collectionAddress = "0xE394Ac77f89FbFAF464FC5796f90C2E192c2f2de"

  // let equipmentId = parseInt(event.params.equipmentId.toString());
  // let equipmentQuery = await prisma.equipment.findUnique({
  //   where: {
  //     collectionAddress_equipmentId: {collectionAddress, equipmentId}
  //   }
  // })
  // console.log("equipment Query: " , equipmentQuery)
  
  return;
};

const  handleOnTransferAsMint: Transfer = async (event: any, context) => {
  // console.log(`Block Log id: `, event.logId)
  // console.log(`BlocK number: `, event.blockNumber)

  let fromAddress = event.params.from.toString();
  if(fromAddress === `0x0000000000000000000000000000000000000000`){
    let toAddress = event.params.to.toString();
    let equipmentId =  parseInt(event.params.tokenId.toString());
    let collectionAddress = ethers.utils.getAddress(event.address)
    console.log(event);
    console.log("equipmentId: ", equipmentId)
    console.log("collectionAddress: ", collectionAddress)

  //   let equipmentQuery = await prisma.equipment.findUnique({
  //   where: {
  //     collectionAddress_equipmentId: {collectionAddress, equipmentId}
  //   }
  // })

  let mintOp = await prisma.equipment.upsert({
    where: {
      collectionAddress_equipmentId: {collectionAddress, equipmentId}
    },
    create:{
      equipmentId,
      collectionAddress,
      equipmentName: "Mystery Rune of DeepSea",
      
    }, 
    update:{
      owner: ""
    } // do nothing
  })
  console.log("block#: ", event.blockNumber)
  }

}
export const AnomuraEquipment = {
  EquipmentMetadataSet: handleEquipmentMetadataSet,
  Transfer: handleOnTransferAsMint
};
// deploy: 7990478
// last mint 7991047
