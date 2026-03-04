"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {

  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  useEffect(()=>{

    const checkSession = async ()=>{

      const { data } = await supabase.auth.getSession();

      if(data.session){
        router.push("/admin");
      }

    };

    checkSession();

  },[router]);

  const handleLogin = async ()=>{

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if(error){

      setError(error.message);

    }else{

      router.push("/admin");

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="bg-white p-6 rounded-xl shadow w-full max-w-sm space-y-4">

        <h1 className="text-2xl font-bold text-center">
          Admin Login
        </h1>

        {error && (
          <p className="text-red-600 text-sm text-center">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full border rounded p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full border rounded p-2"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-sm text-center space-y-1">

          <div>
            <Link
              href="/admin/signup"
              className="text-blue-600 hover:underline"
            >
              Create new account
            </Link>
          </div>

          <div>
            <Link
              href="/admin/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Forgot password
            </Link>
          </div>

        </div>

      </div>

    </div>

  );

}