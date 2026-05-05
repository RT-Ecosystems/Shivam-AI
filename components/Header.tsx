import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, MODELS } from '../constants/Colors';
import { ModelKey } from '../constants/types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  currentModel: ModelKey;
  onToggleModel: () => void;
}

export default function Header({
  onToggleSidebar,
  onNewChat,
  currentModel,
  onToggleModel,
}: HeaderProps) {
  const model = MODELS[currentModel];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconBtn} onPress={onToggleSidebar}>
        <Ionicons name="menu" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Shivam AI</Text>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity style={[styles.modelBadge, { borderColor: model.color + '60' }]} onPress={onToggleModel}>
          <Text style={styles.modelIcon}>{model.icon}</Text>
          <Text style={[styles.modelName, { color: model.color }]}>{model.name}</Text>
          <Ionicons name="chevron-down" size={12} color={model.color} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onNewChat}>
          <Ionicons name="add" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: Colors.bgCard,
  },
  modelIcon: {
    fontSize: 11,
  },
  modelName: {
    fontSize: 11,
    fontWeight: '600',
  },
});
