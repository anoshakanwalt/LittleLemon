import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { MarkaziText_400Regular, MarkaziText_500Medium } from '@expo-google-fonts/markazi-text';
import { Karla_400Regular, Karla_500Medium, Karla_700Bold } from '@expo-google-fonts/karla';

import Onboarding from './Screens/Onboarding';
import Profile from './Screens/Profile';
import Splash from './Screens/Splash';
import Home from './Screens/Home';
import ItemDetails from './Screens/ItemDetails';
import Cart from './Screens/Cart';
import Reservations from './Screens/Reservations';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import { colors, fonts } from './theme';

const Stack = createNativeStackNavigator();

const LogoTitle = () => (
  <Image source={require('./assets/Logo.png')} style={{ width: 160, height: 44 }} resizeMode="contain" />
);

const subScreenOptions = {
  headerTitleAlign: 'center',
  headerBackButtonDisplayMode: 'minimal',
  headerTintColor: colors.primary,
  headerShadowVisible: false,
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    MarkaziText_400Regular,
    MarkaziText_500Medium,
    Karla_400Regular,
    Karla_500Medium,
    Karla_700Bold,
  });

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('onboardingCompleted');
        setIsOnboardingCompleted(value === 'true');
      } catch (e) {
        console.log('Error reading onboarding status', e);
      }
      setIsLoading(false);
    };
    checkOnboarding();
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      setIsOnboardingCompleted(true);
    } catch (e) {
      console.log('Error saving onboarding status', e);
    }
  };

  // Clearing storage AND flipping this state is what swaps the navigator back to
  // Onboarding. (Navigating to a screen that isn't mounted would crash.)
  const logout = async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.log('Error clearing storage', e);
    }
    setIsOnboardingCompleted(false);
  };

  if (isLoading || (!fontsLoaded && !fontError)) {
    return <Splash />;
  }

  return (
    <ErrorBoundary>
    <SafeAreaProvider>
      <CartProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {isOnboardingCompleted ? (
            <>
              <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
              <Stack.Screen
                name="ItemDetails"
                component={ItemDetails}
                options={{ ...subScreenOptions, headerTitle: () => <LogoTitle /> }}
              />
              <Stack.Screen
                name="Cart"
                component={Cart}
                options={{
                  ...subScreenOptions,
                  title: 'Your order',
                  headerTitleStyle: { fontFamily: fonts.display, fontSize: 28, color: colors.primary },
                }}
              />
              <Stack.Screen
                name="Reservations"
                component={Reservations}
                options={{
                  ...subScreenOptions,
                  title: 'Reserve a table',
                  headerTitleStyle: { fontFamily: fonts.display, fontSize: 28, color: colors.primary },
                }}
              />
              <Stack.Screen
                name="Profile"
                options={{ ...subScreenOptions, headerTitle: () => <LogoTitle /> }}
              >
                {(props) => <Profile {...props} onLogout={logout} />}
              </Stack.Screen>
            </>
          ) : (
            <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
              {(props) => <Onboarding {...props} onDone={completeOnboarding} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
    </ErrorBoundary>
  );
}
