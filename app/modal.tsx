import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { ActivityItem } from '@/components/activity-item';
import { Container } from '@/components/container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useActivity } from '@/hooks/use-activity';

export default function ModalScreen() {
  const {
    data,
    isLoading,
    isFetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useActivity();

  const items = data?.pages.flatMap((page) => page.items);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
      fetchNextPage();
    }
  };

  let footer = null;
  if (isFetchingNextPage) {
    footer = <ActivityIndicator accessibilityLabel="Loading more" style={styles.footer} />;
  } else if (isFetchNextPageError) {
    footer = (
      <Pressable accessibilityRole="button" onPress={() => fetchNextPage()} style={styles.button}>
        <ThemedText type="link">Failed to load more. Try again</ThemedText>
      </Pressable>
    );
  }

  let body;
  if (!items && isLoading) {
    body = <ActivityIndicator accessibilityLabel="Loading" />;
  } else if (!items) {
    body = (
      <ThemedView>
        <ThemedText>Something went wrong loading activity.</ThemedText>
        {isFetching ? (
          <ActivityIndicator accessibilityLabel="Retrying" style={styles.button} />
        ) : (
          <Pressable accessibilityRole="button" onPress={() => refetch()} style={styles.button}>
            <ThemedText type="link">Try again</ThemedText>
          </Pressable>
        )}
      </ThemedView>
    );
  } else {
    body = (
      <FlatList
        testID="activity-list"
        style={styles.list}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityItem item={item} detailed />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={footer}
      />
    );
  }

  return (
    <Container>
      <ThemedText type="title" style={styles.title}>
        Activity
      </ThemedText>
      {body}
    </Container>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 16 },
  list: { flex: 1 },
  footer: { paddingVertical: 16 },
  button: { paddingVertical: 12 },
});
