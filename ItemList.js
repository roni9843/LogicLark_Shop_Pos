import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const ItemList = ({
  label,
  value,
  onPress,
  connected,
  actionText,
  color = '#00BCD4',
}) => {
  return (
    <View
      style={[
        styles.container,
        {borderColor: connected ? '#47BF34' : '#00BCD4'},
      ]}>
      <View>
        <Text style={styles.label}>{label || 'UNKNOWN'}</Text>
        <Text style={{color: 'black'}}>{value}</Text>
      </View>
      {connected ? (
        <Text style={styles.connected}>Connected</Text>
      ) : (
        <TouchableOpacity
          onPress={onPress}
          style={[styles.button, {backgroundColor: color}]}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 2,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: 'black',
  },
  connected: {
    fontWeight: 'bold',
    color: '#47BF34',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ItemList;
