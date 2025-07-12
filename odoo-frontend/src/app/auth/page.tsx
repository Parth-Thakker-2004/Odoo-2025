'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page
    router.push('/auth/login')
  }, [router])

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Redirecting...</h2>
        <p className="text-gray-600">Taking you to the login page</p>
      </div>
    </div>
  )
}

export default AuthPage