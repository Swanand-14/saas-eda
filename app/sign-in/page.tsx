"use client";
import React, { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";




function SignIn() {
    const router = useRouter()
    const [emailAddress,setEmailAddress] = useState("")
    const [password,setpassword] = useState("")
    const [error,setError] = useState("")
    const {isLoaded,signIn,setActive} = useSignIn()
    const [passwordVisible, setPasswordVisible] = useState(false);
    if(!isLoaded){
        return null;
    }
    async function submit(e:React.FormEvent){
        e.preventDefault()
        if(!isLoaded){
            return null;
        }
        try {
            const result = await signIn.create({
                identifier:emailAddress,password
            })
            if(result.status === 'complete'){
                await setActive({session:result.createdSessionId})
                router.push("/dashboard")
            }else{
                console.log(JSON.stringify(result,null,2))
            }
        } catch (error:any) {
            console.log("Error",error.errors[0].message)
            setError(error.errors[0].message)
            
            
        }
    }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">
          Sign In
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              required
            />
          </div>

          {/* Password Input with toggle */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <Input
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {passwordVisible ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </CardContent>
    </Card>
  </div>
  )
}

export default SignIn