import React, { useCallback, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { TText } from '@/src/components/core/TText';
import { TView } from '@/src/components/core/TView';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetFlatList, BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Id } from '@backend/convex/_generated/dataModel';
import { usePaginatedQuery } from "convex/react";
import { api } from '@backend/convex/_generated/api';
import useBottomSheetBackdrop from '@/src/hooks/useBottomSheetBackdrop';

type SearchUserBottomSheetProps = {
  onSelectUser?: (userId: Id<'users'>) => void;
};

export const SearchUserBottomSheet = React.forwardRef<BottomSheetModal, SearchUserBottomSheetProps>(
  ({ onSelectUser }, ref) => {
    const [searchText, setSearchText] = useState('');
    const snapPoints = useMemo(() => ['50%', '80%'], []);
    const themeColors = useThemeColors();
    const renderBackdrop = useBottomSheetBackdrop();

    const { results, status, loadMore } = usePaginatedQuery(
      api.users.searchUser,
      { username: searchText },
      { initialNumItems: 10 },
    );

    const handleSelectUser = useCallback((userId: Id<'users'>) => {
      onSelectUser?.(userId);
      (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
    }, [onSelectUser, ref]);

    const renderItem = useCallback(
      ({ item }: { item: any }) => (
        <TView key={item._id} className='p-3 border-b' style={{ backgroundColor: themeColors.backgroundSecondary }}>
          <TouchableOpacity onPress={() => handleSelectUser(item._id)}>
            <TText className='font-bold' type='link'>
              @{item.username}
            </TText>
          </TouchableOpacity>
        </TView>
      ),
      [handleSelectUser, themeColors]
    );

    const handleLoadMore = useCallback(() => {
      if (status === 'CanLoadMore') {
        loadMore(5);
      }
    }, [status, loadMore]);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: themeColors.text }}
      >
        <View className='px-4 py-2'>
          <TText className='text-lg font-bold mb-2'>Search Users</TText>
          <View className='flex-row items-center px-3 py-2 mb-2 rounded-md' style={{ backgroundColor: themeColors.backgroundSecondary }}>
            <Ionicons name='search' size={16} color={themeColors.text} />
            <BottomSheetTextInput
              className='ml-2 flex-1 font-medium'
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search by username"
              placeholderTextColor={themeColors.secondaryText}
            />
          </View>
        </View>

        <BottomSheetFlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </BottomSheetModal>
    );
  }
);

export default SearchUserBottomSheet;
