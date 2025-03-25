import { TText } from '@/src/components/core/TText';
import { TView } from '@/src/components/core/TView';
import SearchUserBottomSheet from '@/src/components/search-user-bottom-sheet';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Doc, Id } from '@backend/convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, { FC, useCallback, useRef, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  View
} from 'react-native';

type FriendsScreenProps = unknown;


type UserGroup = {
  id: string;
  name: string;
  // Add other group properties as needed
};

const FriendsScreen: FC<FriendsScreenProps> = () => {
  const themeColors = useThemeColors();
  const router = useRouter();
  const searchUserBottomSheetRef = useRef<BottomSheetModal>(null);

  // Placeholder data until backend is implemented
  const [friends, setFriends] = useState<Doc<'users'>[]>([
    { id: '1', username: 'johndoe' },
    { id: '2', username: 'janedoe' },
    { id: '3', username: 'bobsmith' },
  ]);

  const [userGroups, setUserGroups] = useState<UserGroup[]>([
    { id: '1', name: 'Bible Study Group' },
    { id: '2', name: 'Prayer Group' },
    { id: '3', name: 'Youth Group' },
  ]);

  const openAddFriendSheet = useCallback(() => {
    searchUserBottomSheetRef.current?.present();
  }, []);

  const navigateToUserProfile = useCallback((userId: Id<'users'>) => {
    router.push({
      pathname: '/user-profile-screen',
      params: { userId }
    });
  }, [router]);

  const navigateToGroup = useCallback((group: UserGroup) => {
    // Navigate to group details
    console.log('Navigate to group:', group);
    // In a real implementation, you would navigate to the group's details
  }, []);

  const renderFriendItem = useCallback(({ item }: { item: Doc<'users'> }) => (
    <TouchableOpacity
      onPress={() => navigateToUserProfile(item)}
      className='p-3 flex-row items-center border-b border-gray-200'
    >
      <View className='w-10 h-10 rounded-full bg-gray-300 justify-center items-center mr-3'>
        <TText className='text-lg font-bold'>{item.username.charAt(0).toUpperCase()}</TText>
      </View>
      <TText className='font-bold'>@{item.username}</TText>
    </TouchableOpacity>
  ), [navigateToUserProfile]);

  const renderGroupItem = useCallback(({ item }: { item: UserGroup }) => (
    <TouchableOpacity
      onPress={() => navigateToGroup(item)}
      className='p-3 flex-row items-center border-b border-gray-200'
    >
      <View className='w-10 h-10 rounded-full bg-gray-200 justify-center items-center mr-3'>
        <Ionicons name='people' size={18} color={themeColors.text} />
      </View>
      <TText className='font-bold'>{item.name}</TText>
    </TouchableOpacity>
  ), [navigateToGroup, themeColors.text]);

  return (
    <SafeAreaView className='h-full'>
      <TView className='h-full'>
        {/* Header */}
        <View className='flex-row items-center justify-between px-4 py-3 border-b border-gray-200'>
          <TText className='text-xl font-bold'>Friends & Groups</TText>
          <TouchableOpacity onPress={openAddFriendSheet}>
            <Ionicons name='person-add' size={24} color={themeColors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className='flex-1'>
          {/* Friends Section - Top Half */}
          <View className='flex-1'>
            <View className='flex-row items-center justify-between px-4 py-2 bg-gray-100'>
              <TText className='font-bold'>Friends</TText>
              <TText className='text-sm'>{friends.length} friends</TText>
            </View>
            <FlatList
              data={friends}
              keyExtractor={(item) => item.id}
              renderItem={renderFriendItem}
              className='flex-1'
              ListEmptyComponent={
                <TView className='p-4 items-center justify-center'>
                  <TText>You don't have any friends yet.</TText>
                  <TouchableOpacity
                    onPress={openAddFriendSheet}
                    className='mt-2 p-2 bg-gray-200 rounded-md'
                  >
                    <TText>Add Friends</TText>
                  </TouchableOpacity>
                </TView>
              }
            />
          </View>

          {/* Groups Section - Bottom Half */}
          <View className='flex-1'>
            <View className='flex-row items-center justify-between px-4 py-2 bg-gray-100'>
              <TText className='font-bold'>Groups</TText>
              <TText className='text-sm'>{userGroups.length} groups</TText>
            </View>
            <FlatList
              data={userGroups}
              keyExtractor={(item) => item.id}
              renderItem={renderGroupItem}
              className='flex-1'
              ListEmptyComponent={
                <TView className='p-4 items-center justify-center'>
                  <TText>You're not part of any groups yet.</TText>
                </TView>
              }
            />
          </View>
        </View>
      </TView>

      {/* Bottom Sheet for searching and adding friends */}
      <SearchUserBottomSheet
        ref={searchUserBottomSheetRef}
        onSelectUser={navigateToUserProfile}
      />
    </SafeAreaView>
  );
};

export default FriendsScreen;
