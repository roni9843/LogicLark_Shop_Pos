import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ItemList from './ItemList';
import SamplePrint from './SamplePrint';
import {
  deleteBluetoothData,
  setBluetoothData,
} from './services/BluetoothService';
import {styles} from './styles';

const PrinterScreen = ({
  onBack,
  bleOpend,
  boundAddress,
  scanBluetoothDevice,
  unPair,
  connect,
  pairedDevices,
  loading,
  name,
}) => {
  /// ??? -------------------------------------------- back handel
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    console.log('back press');
    onBack();
    return true; // Default behavior (exit the app)
  };

  return (
    <View style={{flex: 1}}>
      <View style={stylesMake.backButtonContainer}>
        <TouchableOpacity onPress={onBack}>
          <Text style={stylesMake.backButtonText}>👈 Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={stylesMake.container}>
        <View style={{padding: 20}}>
          <Text style={styles.bluetoothStatus(bleOpend ? '#47BF34' : 'red')}>
            Bluetooth {bleOpend ? 'ON' : 'OFF'}
          </Text>
          {!bleOpend && (
            <Text
              style={[
                styles.bluetoothInfo,
                {color: '#E9493F', lineHeight: 24},
              ]}>
              Please enable your Bluetooth
            </Text>
          )}
          <Text
            style={[styles.sectionTitle, {color: '#000000', marginTop: 20}]}>
            Printers connected to the application:
          </Text>

          {boundAddress.length > 0 && (
            <ItemList
              label={name}
              value={boundAddress}
              onPress={() => {
                unPair(boundAddress);

                deleteBluetoothData();
              }}
              actionText="Disconnect"
              color="#E9493F"
            />
          )}

          {boundAddress.length < 1 && (
            <Text
              style={[styles.printerInfo, {color: '#e74c3c', lineHeight: 24}]}>
              No printers connected yet
            </Text>
          )}

          {boundAddress.length > 1 && (
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: 'green',
                  marginTop: 0,
                  fontSize: 15,
                  alignItems: 'center',
                  textAlign: 'center',
                },
              ]}>
              Bluetooth devices connected to this phone:
            </Text>
          )}

          {/* Scanner Button */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginTop: 20,
            }}>
            <TouchableOpacity
              onPress={() => scanBluetoothDevice()}
              style={stylesMake.scanButton}>
              <Text style={{color: '#FFFFFF', fontWeight: 'bold'}}>Scan</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator animating={true} color="#00BCD4" />
          ) : null}
          <View style={{marginTop: 10}}>
            {pairedDevices.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 10,
                }}>
                <View style={{flex: 1}}>
                  <ItemList
                    onPress={() => {
                      connect(item);

                      setBluetoothData(item);
                    }}
                    label={item.name}
                    value={item.address}
                    connected={item.address === boundAddress}
                    actionText="Connect"
                    color="#00BCD4"
                  />
                </View>
              </View>
            ))}
          </View>
          <SamplePrint />

          <View style={{height: 100}} />
        </View>
      </ScrollView>
    </View>
  );
};

const stylesMake = StyleSheet.create({
  bluetoothStatus: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bluetoothInfo: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 20,
  },
  printerInfo: {
    marginTop: 10,
  },
  scanButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },

  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    paddingTop: 60, // Adjust according to your header height
  },
  backButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default PrinterScreen;
