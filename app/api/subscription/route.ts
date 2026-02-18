import { NextResponse } from "next/server";
import { auth ,clerkClient} from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

export async function POST(){
    const {userId} =  await auth();
    if(!userId){
        return NextResponse.json({error:"Unauthorised"},{status:401})

    }

    try {
        const user = await prisma.user.findUnique({where:{id:userId}})
        if(!user){
        return NextResponse.json({error:"User not found"},{status:401})
        

    }
    const subscriptionEnds = new Date()
    subscriptionEnds.setMonth(subscriptionEnds.getMonth()+1)
    const updatedUser = await prisma.user.update({where:{id:userId},data:{
        isSubscribed:true,
        subscriptionEnds:subscriptionEnds
    }});
    return NextResponse.json({
        message:"Subscription successfully"
    })
    } catch (error) {
        return NextResponse.json({error:"Internal Server Timeout"},{status:500})
    }
}

export async function GET(){
     const { userId } = await auth();
       console.log("Clerk userId:", userId);
    if(!userId){
        return NextResponse.json({error:"Unauthorised"},{status:401})

    }
    try {
        let user = await prisma.user.findUnique({where:{id:userId},select:{isSubscribed:true,subscriptionEnds:true}})
        if(!user){
        const clerkUser = await clerkClient.users.getUser(userId);
       const newUser = await prisma.user.create({
    data: {
      id: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      isSubscribed: false,
      subscriptionEnds: null,
    },
  });
  return NextResponse.json({
    isSubscribed: newUser.isSubscribed,
    subscriptionEnds: newUser.subscriptionEnds,
  });
        

    }
    const now = new Date()
    if(user.subscriptionEnds && user.subscriptionEnds<now){
        await prisma.user.update({where:{id:userId},data:{
            isSubscribed:false,
            subscriptionEnds:null
        }});
        return NextResponse.json({isSubscribed:false,subscriptionEnds:null})
    }
    return NextResponse.json({
        isSubscribed:user.isSubscribed,
        subscriptionEnds:user.subscriptionEnds
    })
    } catch (error) {
        return NextResponse.json({error:"Internal Server Error"},{status:500})
        
    }
}
///s/