// Simplified auth configuration for build compatibility
// Full configuration will be enabled when database is connected

export const authOptions = {
  providers: [
    // Providers will be configured when environment variables are available
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
} 