'use client'

import { Button } from "@heroui/button"
import Link from "next/link"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Welcome</h1>
        <p className="text-gray-500">Please choose an option to continue</p>

        <div className="flex flex-col gap-4">
          <Link href="/sign-in">
            <Button color="secondary" className="w-full">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button color="primary" variant="bordered" className="w-full">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
