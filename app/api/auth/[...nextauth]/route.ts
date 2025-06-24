import NextAuth from 'next-auth'

// Simplified auth options for now to avoid dependency issues
const authOptions = {
  providers: [
    // Will be configured when environment variables are set
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/signin',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 