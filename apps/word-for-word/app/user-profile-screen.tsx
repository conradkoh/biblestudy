import { TText } from '@/src/components/core/TText';
import { TView } from '@/src/components/core/TView';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  TouchableOpacity,
  View
} from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Doc, Id } from '@backend/convex/_generated/dataModel';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView
} from '@gorhom/bottom-sheet';
import useBottomSheetBackdrop from '@/src/hooks/useBottomSheetBackdrop';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Maps backend friendship status to UI state
type UIFriendshipStatus = 'NOT_FRIENDS' | 'PENDING' | 'PENDING_RECEIVED' | 'FRIENDS' | 'CLOSE_FRIENDS';

const UserProfileScreen: FC = () => {
  const themeColors = useThemeColors();
  const { userId } = useLocalSearchParams<{ userId: Id<'users'> }>();
  const router = useRouter();

  const user = useQuery(api.users.getUserById, { userId }) as Doc<'users'> | undefined;
  const currentUser = useQuery(api.users.getCurrentUser);

  const [friendshipStatus, setFriendshipStatus] = useState<UIFriendshipStatus>('NOT_FRIENDS');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteId, setInviteId] = useState<Id<'userInvites'> | undefined>(undefined);

  const friendOptionSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['30%'], []);
  const renderBackdrop = useBottomSheetBackdrop();

  // Backend queries and mutations
  const sendFriendInvite = useMutation(api.invites.sendFriendInvite);
  const updateFriendInvite = useMutation(api.invites.updateFriendInvite);
  const getFriendshipStatus = useQuery(api.invites.getFriendshipStatus,
    { otherUserId: userId }
  );

  // Update the UI friendship status based on backend data
  useEffect(() => {
    // Default values when no data is available
    if (!getFriendshipStatus) {
      setInviteId(undefined);
      setFriendshipStatus('NOT_FRIENDS');
      return;
    }

    // Set the invite ID if available
    if (getFriendshipStatus.inviteId) {
      setInviteId(getFriendshipStatus.inviteId);
    } else {
      setInviteId(undefined);
    }

    // Map backend status to UI status
    const status = getFriendshipStatus.status;

    if (status === 'SELF') {
      // When viewing own profile
      setFriendshipStatus('NOT_FRIENDS'); // No friend button shown for self
    } else if (status === 'OUTGOING_INVITE') {
      setFriendshipStatus('PENDING');
    } else if (status === 'INCOMING_INVITE') {
      setFriendshipStatus('PENDING_RECEIVED');
    } else if (status === 'FRIEND') {
      setFriendshipStatus('FRIENDS');
    } else if (status === 'CLOSE_FRIEND') {
      setFriendshipStatus('CLOSE_FRIENDS');
    } else {
      // Default to NOT_FRIENDS for 'NONE' or any other status
      setFriendshipStatus('NOT_FRIENDS');
    }
  }, [getFriendshipStatus]);

  const handleAddFriend = useCallback(() => {
    // Open the friend option bottom sheet
    friendOptionSheetRef.current?.present();
  }, []);

  const handleAcceptInvite = useCallback(async () => {
    if (!inviteId) return;
    if (!user) return;

    setIsLoading(true);

    try {
      await updateFriendInvite({
        inviteId,
        status: 'ACCEPTED'
      });

      setFriendshipStatus('FRIENDS');
      Alert.alert('Success', `You are now friends with ${user.username || user.name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to accept friend request');
      console.error('Error accepting friend request:', error);
    } finally {
      setIsLoading(false);
    }
  }, [updateFriendInvite, inviteId, user]);

  const handleRejectInvite = useCallback(async () => {
    if (!inviteId) return;

    setIsLoading(true);

    try {
      await updateFriendInvite({
        inviteId,
        status: 'REJECTED'
      });

      setFriendshipStatus('NOT_FRIENDS');
      Alert.alert('Success', `Friend request rejected`);
    } catch (error) {
      Alert.alert('Error', 'Failed to reject friend request');
      console.error('Error rejecting friend request:', error);
    } finally {
      setIsLoading(false);
    }
  }, [updateFriendInvite, inviteId]);

  const sendInvite = useCallback(async (friendType: 'FRIEND' | 'CLOSE_FRIEND') => {
    if (!user?._id) return;

    setIsLoading(true);

    try {
      const result = await sendFriendInvite({
        receivedByUserId: user._id,
        friendType,
      });

      setFriendshipStatus('PENDING');
      setInviteId(result);
      Alert.alert('Success', `Friend request sent to ${user.username || user.name}`);

      // Close the bottom sheet
      friendOptionSheetRef.current?.dismiss();
    } catch (error) {
      Alert.alert('Error', 'Failed to send friend request');
      console.error('Error sending friend request:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sendFriendInvite, user]);

  const renderFriendshipButton = () => {
    // Don't show friend button when viewing own profile
    if (currentUser?._id === user?._id) {
      return null;
    }

    switch (friendshipStatus) {
      case 'PENDING':
        return (
          <TouchableOpacity
            className='px-4 py-2 rounded-full bg-gray-300'
            disabled={true}
          >
            <TText className='text-center'>Request Sent</TText>
          </TouchableOpacity>
        );
      case 'PENDING_RECEIVED':
        return (
          <View className='flex-row'>
            <TouchableOpacity
              className='px-4 py-2 rounded-full bg-gray-300 mr-2'
              onPress={handleRejectInvite}
              disabled={isLoading}
            >
              <TText className='text-center'>Decline</TText>
            </TouchableOpacity>
            <TouchableOpacity
              className='px-4 py-2 rounded-full'
              style={{ backgroundColor: themeColors.tint }}
              onPress={handleAcceptInvite}
              disabled={isLoading}
            >
              <TText className='text-center text-white'>
                {isLoading ? 'Processing...' : 'Accept'}
              </TText>
            </TouchableOpacity>
          </View>
        );
      case 'FRIENDS':
        return (
          <TouchableOpacity className='px-4 py-2 rounded-full bg-gray-300'>
            <TText className='text-center'>Friends</TText>
          </TouchableOpacity>
        );
      case 'CLOSE_FRIENDS':
        return (
          <TouchableOpacity className='px-4 py-2 rounded-full bg-gray-300'>
            <TText className='text-center'>Close Friends</TText>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity
            className='px-4 py-2 rounded-full'
            style={{ backgroundColor: themeColors.tint }}
            onPress={handleAddFriend}
          >
            <TText className='text-center text-white'>Add Friend</TText>
          </TouchableOpacity>
        );
    }
  };

  if (!user) {
    return (
      <SafeAreaView className='h-full'>
        <TView className='h-full justify-center items-center'>
          <ActivityIndicator size="large" color={themeColors.tint} />
        </TView>
      </SafeAreaView>
    );
  }

  // Show loading indicator while fetching friendship status
  if (user?._id && getFriendshipStatus === undefined) {
    return (
      <SafeAreaView className='h-full'>
        <TView className='h-full justify-center items-center'>
          <ActivityIndicator size="large" color={themeColors.tint} />
          <TText className='mt-4'>Loading profile...</TText>
        </TView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='h-full'>
      <TView className='h-full'>
        {/* Header with back button */}
        <View className='flex-row items-center px-4 py-3'>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={24} color={themeColors.text} />
          </TouchableOpacity>
          <TText className='ml-3 text-lg font-semibold'>Profile</TText>
        </View>

        {/* User Profile Content */}
        <View className='items-center px-4 pt-6'>
          {/* Profile Image */}
          <View className='w-24 h-24 rounded-full bg-gray-300 overflow-hidden justify-center items-center mb-4'>
            {user.image ? (
              <Image
                source={{ uri: user.image }}
                className='w-full h-full'
                resizeMode='cover'
              />
            ) : (
              <Ionicons name='person' size={50} color={themeColors.background} />
            )}
          </View>

          {/* User Name */}
          <TText className='text-2xl font-bold mb-1'>
            {user.name || 'No Name'}
          </TText>

          {/* Username */}
          <TText className='text-lg text-gray-500 mb-6'>
            @{user.username || 'username'}
          </TText>

          {/* Add Friend Button */}
          {renderFriendshipButton()}
        </View>

        {/* Stats Section */}
        <View className='flex-row justify-around mt-10 px-4 py-6 border-t border-b border-gray-200'>
          <View className='items-center'>
            <TText className='text-xl font-bold'>0</TText>
            <TText className='text-gray-500'>Friends</TText>
          </View>
          <View className='items-center'>
            <TText className='text-xl font-bold'>0</TText>
            <TText className='text-gray-500'>Groups</TText>
          </View>
        </View>
      </TView>

      {/* Friend Options Bottom Sheet */}
      <BottomSheetModal
        ref={friendOptionSheetRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: themeColors.text }}
      >
        <BottomSheetView className='px-4 py-4'>
          <TText className='text-lg font-bold mb-4'>Add as:</TText>

          <TouchableOpacity
            className='flex-row items-center py-3 border-b border-gray-200'
            onPress={() => sendInvite('FRIEND')}
            disabled={isLoading}
          >
            <Ionicons name='person' size={24} color={themeColors.text} />
            <TText className='ml-3 text-lg'>Friend</TText>
            {isLoading && <ActivityIndicator className='ml-auto' />}
          </TouchableOpacity>

          <TouchableOpacity
            className='flex-row items-center py-3'
            onPress={() => sendInvite('CLOSE_FRIEND')}
            disabled={isLoading}
          >
            <Ionicons name='star' size={24} color={themeColors.text} />
            <TText className='ml-3 text-lg'>Close Friend</TText>
            {isLoading && <ActivityIndicator className='ml-auto' />}
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default UserProfileScreen;
