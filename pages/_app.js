import 'lib/css/style.css'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import UserContext from 'lib/ui/UserContext'
import { supabase, fetchUserRoles } from 'lib/api/Store'
import { MantineProvider } from '@mantine/core';



export default function SupabaseSlackClone({ Component, pageProps }) {
  const [userLoaded, setUserLoaded] = useState(false)
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [userRoles, setUserRoles] = useState([])
  const router = useRouter()

  useEffect(() => {
    function saveSession(
      /** @type {Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']} */
      session
    ) {
      setSession(session)
      const currentUser = session?.user
      setUser(currentUser ?? null)
      setUserLoaded(!!currentUser)
      if (currentUser) {
        signIn(currentUser.id, currentUser.email)
        // router.push('/projects/[id]', '/projects/1')
      }
    }

    supabase.auth.getSession().then(({ data: { session }}) => saveSession(session))

    const { subscription: authListener } = supabase.auth.onAuthStateChange(async (event, session) => saveSession(session))

    return () => {
      authListener.unsubscribe()
    }
  }, [])

  const signIn = async () => {
    await fetchUserRoles((userRoles) => setUserRoles(userRoles.map((userRole) => userRole.role)))
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/')
    }
  }

  return (
    // <SafeHydrate>

      <UserContext.Provider
      value={{
        userLoaded,
        user,
        userRoles,
        signIn,
        signOut,
      }}
    >
       <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: 'light',
        }}
      >
      <Component {...pageProps} />

      </MantineProvider>
    </UserContext.Provider>
  )
}
