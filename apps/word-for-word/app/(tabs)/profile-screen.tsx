import React from 'react';
import UserProfileScreen from "../user-profile-screen";
import { useQuery } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import { TView } from '@/src/components/core/TView';
import { TSafeAreaView } from '@/src/components/core/TSafeAreaView';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeColors } from '@/src/hooks/useThemeColors';
export default function ProfileScreen() {

  const themeColors = useThemeColors();
  const currentUser = useQuery(api.users.getCurrentUser);

  if (!currentUser) {
    return null;
  }

  return <TSafeAreaView edges={['top']}>
    <TView className="px-4 py-2 flex-row justify-end ">
      <TouchableOpacity onPress={() => router.push('/settings-screen')}>
        <Ionicons name="settings" size={24} color={themeColors.textSecondary} />
      </TouchableOpacity>
    </TView>
    <UserProfileScreen userId={currentUser._id} isTab />
  </TSafeAreaView>;
} 
