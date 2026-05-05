import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, MODELS } from '../constants/Colors';
import { ModelKey } from '../constants/types';

interface ModelPickerProps {
  visible: boolean;
  currentModel: ModelKey;
  onSelect: (model: ModelKey) => void;
  onClose: () => void;
}

export default function ModelPicker({
  visible,
  currentModel,
  onSelect,
  onClose,
}: ModelPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Select Model</Text>
          {(Object.keys(MODELS) as ModelKey[]).map((key) => {
            const m = MODELS[key];
            const isActive = key === currentModel;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.option, isActive && { borderColor: m.color + '60', backgroundColor: m.bgColor }]}
                onPress={() => { onSelect(key); onClose(); }}
              >
                <View style={[styles.iconBox, { backgroundColor: m.bgColor }]}>
                  <Text style={styles.icon}>{m.icon}</Text>
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.modelName, { color: isActive ? m.color : Colors.textPrimary }]}>
                    {m.name}
                  </Text>
                  <Text style={styles.modelSub}>{m.subtitle}</Text>
                  <Text style={styles.modelId} numberOfLines={1}>{m.id}</Text>
                </View>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={20} color={m.color} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 20 },
  optionText: { flex: 1 },
  modelName: {
    fontSize: 15,
    fontWeight: '600',
  },
  modelSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  modelId: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
