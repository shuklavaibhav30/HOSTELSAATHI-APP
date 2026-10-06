import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { COLORS } from '../constants/colors';

export const CustomDropdown = ({ label, options, value, onSelect, placeholder = 'Select an option' }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const getItemLabel = (item) => (typeof item === 'object' && item !== null ? item.label : item);
  const getItemValue = (item) => (typeof item === 'object' && item !== null ? item.value : item);

  const selectedItem = options.find((item) => getItemValue(item) === value);
  const displayTriggerText = selectedItem ? getItemLabel(selectedItem) : value ? value : placeholder;

  const handleSelect = (item) => {
    const itemVal = getItemValue(item);
    onSelect(itemVal);
    setModalVisible(false);
  };

  return (
    <View style={styles.fieldContainer}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.triggerText, !value && styles.placeholderText]}>
          {displayTriggerText}
        </Text>
        <ChevronDown size={18} color={COLORS.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item, index) => getItemValue(item) || index.toString()}
              renderItem={({ item }) => {
                const itemVal = getItemValue(item);
                const itemLbl = getItemLabel(item);
                const isSelected = value === itemVal;
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.selectedOption]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                      {itemLbl}
                    </Text>
                    {isSelected ? <Check size={16} color={COLORS.primary} /> : null}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    gap: 6,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    height: 48,
  },
  triggerText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '500',
  },
  placeholderText: {
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayBg,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  selectedOption: {
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
  },
  optionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  selectedOptionText: {
    color: '#0f172a',
    fontWeight: '700',
  },
});
