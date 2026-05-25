import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { useDeepLinks } from '../hooks/useDeepLinks';

import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';

import UsernameScreen from '../screens/onboarding/UsernameScreen';
import BirthdateScreen from '../screens/onboarding/BirthdateScreen';
import ProfilePhotoScreen from '../screens/onboarding/ProfilePhotoScreen';
import LocationScreen from '../screens/onboarding/LocationScreen';
import FamilyCompositionScreen from '../screens/onboarding/FamilyCompositionScreen';
import InterestsScreen from '../screens/onboarding/InterestsScreen';
import BioScreen from '../screens/onboarding/BioScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';

import HomeScreen from '../screens/home/HomeScreen';
import FamilyProfileScreen from '../screens/home/FamilyProfileScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import FeedScreen from '../screens/community/FeedScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type AuthStackParams = {
  SignIn: undefined;
  SignUp: undefined;
};

export type HomeStackParams = {
  HomeMain: undefined;
  FamilyProfile: { userId: string; displayName: string; compatibilityScore?: number };
};

export type MainTabParams = {
  Home: undefined;
  Explore: undefined;
  ChatTab: undefined;
  Community: undefined;
  Profile: undefined;
};

export type ChatStackParams = {
  ChatList: undefined;
  Chat: { conversationId: string; participantName: string };
};

export type ProfileSetupStackParams = {
  VerifyEmail: undefined;
  Username: undefined;
  Birthdate: undefined;
  ProfilePhoto: undefined;
  Location: undefined;
  FamilyComposition: undefined;
  Interests: undefined;
  Bio: undefined;
  Welcome: undefined;
};

export type RootStackParams = {
  Splash: { onFinish: () => void };
  Onboarding: { onFinish: () => void };
  Auth: undefined;
  ProfileSetup: undefined;
  Main: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const HomeStack = createNativeStackNavigator<HomeStackParams>();
const Tab = createBottomTabNavigator<MainTabParams>();
const ChatStack = createNativeStackNavigator<ChatStackParams>();
const ProfileSetupStack = createNativeStackNavigator<ProfileSetupStackParams>();
const RootStack = createNativeStackNavigator<RootStackParams>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="FamilyProfile" component={FamilyProfileScreen} />
    </HomeStack.Navigator>
  );
}

function ChatNavigator() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
      <ChatStack.Screen name="Chat" component={ChatScreen} />
    </ChatStack.Navigator>
  );
}

function MainTabs() {
  const unread = useUnreadCount();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#c6a7f8',
        tabBarInactiveTintColor: '#8c8c8c',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopWidth: 0, elevation: 0 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{ tabBarLabel: 'Familias', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>&#x1F3E0;</Text> }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ tabBarLabel: 'Explorar', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>&#x1F50D;</Text> }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatNavigator}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>&#x1F4AC;</Text>,
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarBadgeStyle: { backgroundColor: '#c6a7f8' },
        }}
      />
      <Tab.Screen
        name="Community"
        component={FeedScreen}
        options={{ tabBarLabel: 'Comunidad', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>&#x1F33F;</Text> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>&#x1F464;</Text> }}
      />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function ProfileSetupNavigator() {
  const store = useOnboardingStore();

  return (
    <ProfileSetupStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: 'slide_from_right',
        animationDuration: 280,
      }}
    >
      <ProfileSetupStack.Screen name="VerifyEmail">
        {({ navigation }) => (
          <VerifyEmailScreen
            onNext={() => navigation.navigate('Username')}
            onBack={() => navigation.getParent()?.navigate('Auth')}
          />
        )}
      </ProfileSetupStack.Screen>

      <ProfileSetupStack.Screen name="Username">
        {({ navigation }) => (
          <UsernameScreen
            onNext={(username) => {
              store.setUsername(username);
              navigation.navigate('Birthdate');
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </ProfileSetupStack.Screen>

      <ProfileSetupStack.Screen name="Birthdate">
        {({ navigation }) => (
          <BirthdateScreen
            onNext={(birthdate) => {
              store.setBirthdate(birthdate);
              navigation.navigate('ProfilePhoto');
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </ProfileSetupStack.Screen>

      <ProfileSetupStack.Screen name="ProfilePhoto">
        {({ navigation }) => (
          <ProfilePhotoScreen
            onNext={(photoURL) => {
              store.setPhotoURL(photoURL);
              navigation.navigate('Location');
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </ProfileSetupStack.Screen>

      <ProfileSetupStack.Screen name="Location">
        {({ navigation }) => (
          <LocationScreen
            onNext={(location) => {
              store.setLocation(location);
              navigation.navigate('FamilyComposition');
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </ProfileSetupStack.Screen>

      <ProfileSetupStack.Screen name="FamilyComposition">
        {({ navigation }) => (
          <FamilyCompositionScreen
            onNext={(composition) => {
              store.setComposition(composition);
              navigation.navigate('Interests');
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </ProfileSetupStack.Screen>

      <ProfileSetupStack.Screen name="Interests">
        {({ navigation }) => (
          <InterestsScreen
            onNext={(interests) => {
              store.setInterests(interests);
              navigation.navigate('Bio');
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </ProfileSetupStack.Screen>

      <ProfileSetupStack.Screen name="Bio">
        {({ navigation }) => (
          <BioScreen
            onNext={async (bio) => {
              store.setBio(bio);
              await store.submit();
              navigation.navigate('Welcome');
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </ProfileSetupStack.Screen>

      <ProfileSetupStack.Screen name="Welcome">
        {({ navigation }) => (
          <WelcomeScreen
            onFinish={() => {
              store.reset();
              navigation.getParent()?.navigate('Main');
            }}
          />
        )}
      </ProfileSetupStack.Screen>
    </ProfileSetupStack.Navigator>
  );
}

function DeepLinkHandler() {
  useDeepLinks();
  return null;
}

export default function Navigation() {
  const { firebaseUser, isInitialized, profileComplete } = useAuthStore();
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('onboarding_seen').then(val => {
      setOnboardingSeen(val === 'true');
    });
  }, []);

  if (!isInitialized || onboardingSeen === null) return null;

  return (
    <NavigationContainer>
      <DeepLinkHandler />
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 350,
        }}
      >
        {firebaseUser ? (
          profileComplete ? (
            <RootStack.Screen name="Main" component={MainTabs} />
          ) : (
            <>
              <RootStack.Screen name="ProfileSetup" component={ProfileSetupNavigator} />
              <RootStack.Screen name="Main" component={MainTabs} />
            </>
          )
        ) : (
          <>
            <RootStack.Screen
              name="Splash"
              children={({ navigation }) => (
                <SplashScreen
                  onFinish={() => {
                    if (onboardingSeen) {
                      navigation.replace('Auth');
                    } else {
                      navigation.replace('Onboarding', {
                        onFinish: async () => {
                          await AsyncStorage.setItem('onboarding_seen', 'true');
                          setOnboardingSeen(true);
                          navigation.replace('Auth');
                        },
                      });
                    }
                  }}
                />
              )}
            />
            <RootStack.Screen
              name="Onboarding"
              children={({ route }) => (
                <OnboardingScreen onFinish={route.params.onFinish} />
              )}
            />
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
