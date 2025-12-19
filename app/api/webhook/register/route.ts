import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
export async function POST(req:Request){
   const WEB_HOOK_SECRET =  process.env.WEB_HOOK_SECRET;
   if(!WEB_HOOK_SECRET){
    throw new Error("Please add secret")
   }
   const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");
if(!svix_id || !svix_signature || svix_timestamp){
    return new Response("Invalid webhook")
}
const payload = await req.json()
const body = JSON.stringify(payload)
const wh = new Webhook(WEB_HOOK_SECRET)
let evt:WebhookEvent;
try {
    evt = wh.verify(body,{
        "svix-id":svix_id,
        "svix-signature":svix_signature,
        "svix-timestamp":svix_timestamp
    }) as WebhookEvent;

    
} catch (error) {
    console.error("Error verifying webhook",error)
    
}
    const {id} = evt.data
    const eventType = evt.type

    if(eventType === 'user.created'){
        try {
            const {email_addresses,primary_email_address_id} = evt.data;

            const primaryEmail = email_addresses.find((email)=>email.id === primary_email_address_id)
            if(!primaryEmail){
                return new Response("No primary Email Found",{status:400})


            }

            const newuser = await prisma.user.create({
                data:{
                    id:evt.data.id!,
                    email:primaryEmail.email_address,
                    isSubscribed:false
                }
            })
            console.log("New User Created",newuser)
        } catch (error) {
            return new Response("Error in creating user in database",{status:400});


            
        }
    }

    return new Response("Webhook recieved successfully",{status:200})

}