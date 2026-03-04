"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupPage() {

  const router = useRouter();

  const [name,setName] = useState("");
  const [mobile,setMobile] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleSignup = async (e:any) => {

    e.preventDefault();

    const { data,error } = await supabase.auth.signUp({
      email,
      password
    });

    if(error){
      alert(error.message);
      return;
    }

    await supabase
      .from("users")
      .insert({
        name,
        mobile,
        email,
        status:"Pending"
      });

    alert("Signup successful. Wait for admin approval.");

    router.push("/admin/login");

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleSignup}
        className="bg-white p-6 rounded-lg w-[380px] space-y-4"
      >

        <h2 className="text-xl font-semibold">
          Create Account
        </h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Mobile"
          value={mobile}
          onChange={(e)=>setMobile(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Sign Up
        </button>

      </form>

    </div>
  );
}