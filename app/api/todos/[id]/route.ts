import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

export async function DELETE(req:NextRequest,{params}:{params:{id:string}}){
    const {userId} = await auth()
    if(!userId){
        return NextResponse.json({error:"Unauthorised"},{status:401})
    }
    try {
        const todoId = params.id
       const todo =  await prisma.todo.findUnique({where:{id:todoId}})
       if(!todo){
        return NextResponse.json({error:"Todo not found"},{status:400})
       }
       if(todo.userId!==userId){
        return NextResponse.json({error:"You are not authorised to delete"},{status:404})
       }
       await prisma.todo.delete({where:{id:todoId}})

       return NextResponse.json({message:"Todo deleted successfully"},{status:200})
    } catch (error) {
        return NextResponse.json({error:"Internal server error"},{status:500})

        
    }
}

export async function PUT(req:NextRequest,{params}:{params:{id:string}}){
    const {userId} = await auth()
    if(!userId){
        return NextResponse.json({error:"Unauthorised"},{status:401})
    }
    try {
        const todoId = params.id
        const body = await req.json()
        const {completed} = body;
       const todo =  await prisma.todo.findUnique({where:{id:todoId}})
       if(!todo){
        return NextResponse.json({error:"Todo not found"},{status:400})
       }
       if(todo.userId!==userId){
        return NextResponse.json({error:"You are not authorised to delete"},{status:404})
       }
       await prisma.todo.update({where:{id:todoId},data:{completed}})

       return NextResponse.json({message:"Todo updated successfully"},{status:200})
    } catch (error) {
        return NextResponse.json({error:"Internal server error"},{status:500})

        
    }
}

