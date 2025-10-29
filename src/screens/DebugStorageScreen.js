import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Debug screen to view and manage AsyncStorage data
 * Access this from Settings → Developer Options
 */
export default function DebugStorageScreen() {
  const { theme } = useTheme();
  const [storageData, setStorageData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    loadAllStorage();
  }, []);

  const loadAllStorage = async () => {
    setRefreshing(true);
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);

      let size = 0;
      const data = stores.map(([key, value]) => {
        const bytes = new Blob([value]).size;
        size += bytes;
        return {
          key,
          value,
          size: bytes,
          parsedValue: tryParseJSON(value),
        };
      });

      setStorageData(data);
      setTotalSize(size);
    } catch (error) {
      Alert.alert('Error', 'Failed to load storage data');
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const tryParseJSON = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const viewItem = (item) => {
    Alert.alert(
      item.key,
      typeof item.parsedValue === 'object'
        ? JSON.stringify(item.parsedValue, null, 2)
        : String(item.value),
      [
        { text: 'Copy Key', onPress: () => console.log('Key:', item.key) },
        { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.key) },
        { text: 'Close' },
      ]
    );
  };

  const deleteItem = async (key) => {
    Alert.alert(
      'Delete Storage Item',
      `Are you sure you want to delete "${key}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(key);
              loadAllStorage();
              Alert.alert('Success', 'Item deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const clearAllStorage = () => {
    Alert.alert(
      'Clear All Storage',
      'This will delete ALL app data. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              loadAllStorage();
              Alert.alert('Success', 'All storage cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear storage');
            }
          },
        },
      ]
    );
  };

  const exportData = () => {
    const exportObj = {};
    storageData.forEach(item => {
      exportObj[item.key] = item.parsedValue;
    });
    console.log('EXPORT DATA:', JSON.stringify(exportObj, null, 2));
    Alert.alert(
      'Data Exported',
      'Check the console for exported data (React Native Debugger or Metro logs)'
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          AsyncStorage Debug 🔍
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {storageData.length} keys • {formatBytes(totalSize)}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={loadAllStorage}
        >
          <Text style={styles.actionButtonText}>🔄 Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.accent }]}
          onPress={exportData}
        >
          <Text style={styles.actionButtonText}>📤 Export to Console</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.error }]}
          onPress={clearAllStorage}
        >
          <Text style={styles.actionButtonText}>🗑️ Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Storage Items */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadAllStorage} />
        }
      >
        {storageData.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No data in AsyncStorage
            </Text>
          </View>
        ) : (
          storageData.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.storageItem, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => viewItem(item)}
            >
              <View style={styles.itemHeader}>
                <Text style={[styles.itemKey, { color: theme.text }]} numberOfLines={1}>
                  {item.key}
                </Text>
                <Text style={[styles.itemSize, { color: theme.textSecondary }]}>
                  {formatBytes(item.size)}
                </Text>
              </View>
              <Text style={[styles.itemPreview, { color: theme.textSecondary }]} numberOfLines={2}>
                {typeof item.parsedValue === 'object'
                  ? JSON.stringify(item.parsedValue).substring(0, 100) + '...'
                  : String(item.value).substring(0, 100)}
              </Text>
              <View style={styles.itemFooter}>
                <Text style={[styles.itemType, { color: theme.primary }]}>
                  {typeof item.parsedValue === 'object'
                    ? Array.isArray(item.parsedValue)
                      ? `Array (${item.parsedValue.length} items)`
                      : 'Object'
                    : typeof item.parsedValue}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  storageItem: {
    margin: 10,
    marginTop: 5,
    marginBottom: 5,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemKey: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  itemSize: {
    fontSize: 12,
    marginLeft: 10,
  },
  itemPreview: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemType: {
    fontSize: 11,
    fontWeight: '600',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
