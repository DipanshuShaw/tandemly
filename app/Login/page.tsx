import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/LoginForm"
import LoginImage from "@/public/LoginImage.png"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="size-8 rounded-lg bg-gradient-to-br from-green-700 via-lime-600  to-orange-600 flex items-center justify-center text-primary-foreground">
              T
            </div>
            Tandemly
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src={LoginImage}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover "
        />
      </div>
    </div>
  )
}
