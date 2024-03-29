// BluetoothStorage.js
// import {AsyncStorage} from '@react-native-async-storage/async-storage';
//import {AsyncStorage} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to set Bluetooth data in local storage
export const setBluetoothData = async data => {
  console.log(data);

  try {
    await AsyncStorage.setItem('bluetoothData', JSON.stringify(data));
    console.log('Bluetooth data set successfully ', data);
  } catch (error) {
    //console.error('Error setting Bluetooth data:', error);
  }
};

// Function to get Bluetooth data from local storage
export const getBluetoothData = async () => {
  try {
    const storedData = await AsyncStorage.getItem('bluetoothData');
    if (storedData !== null) {
      // Parse the stored data from JSON to an object before returning
      return JSON.parse(storedData);
    } else {
      console.log('No Bluetooth data found');
      return null;
    }
  } catch (error) {
    // console.error('Error getting Bluetooth data:', error);
    return null;
  }
};

// Function to delete Bluetooth data from local storage
export const deleteBluetoothData = async () => {
  try {
    await AsyncStorage.removeItem('bluetoothData');
    console.log('Bluetooth data deleted successfully');
  } catch (error) {
    // console.error('Error deleting Bluetooth data:', error);
  }
};
