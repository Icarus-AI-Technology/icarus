/**
 * ICARUS Mobile - Root Layout
 * 
 * Layout principal do app com providers.
 */

import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'

import { Colors } from '../constants/Colors'

// Prevenir splash screen de esconder automaticamente
SplashScreen.preventAutoHideAsync()

// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos
      retry: 2,
    },
  },
})

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'dark']

  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontFamily: 'Inter-SemiBold',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="cirurgia/[id]"
          options={{
            title: 'Detalhes da Cirurgia',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="scanner"
          options={{
            title: 'Scanner',
            presentation: 'modal',
          }}
        />
      </Stack>
    </QueryClientProvider>
  )
}

