import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveDataToLocalStorage = async newData => {
  try {
    // Get existing data from local storage
    const existingDataString = await AsyncStorage.getItem('my-key');
    let existingData = existingDataString ? JSON.parse(existingDataString) : [];

    // Merge old data with new data
    const mergedData = [...existingData, ...newData];

    console.log(mergedData);

    // Save the merged data back to local storage
    await AsyncStorage.setItem('my-key', JSON.stringify(mergedData));
  } catch (error) {
    // Handle the error
    console.error('Error saving data to local storage:', error);
  }
};

export const getDataFromLocalStorage = async () => {
  try {
    // Get existing data from local storage
    const existingDataString = await AsyncStorage.getItem('my-key');
    let existingData = existingDataString
      ? await JSON.parse(existingDataString)
      : [];

    return existingData;
  } catch (e) {
    // error reading value
  }
};

export const deleteDataFromLocalStorage = async () => {
  try {
    // Retrieve the data from local storage
    const jsonValue = await AsyncStorage.getItem('my-key');

    // Parse the data (if exists)
    const existingData = jsonValue != null ? JSON.parse(jsonValue) : null;

    // Log the name (or any property you want to log)
    console.log(existingData?.name);

    // Delete the data from local storage
    await AsyncStorage.removeItem('my-key');

    console.log('Data deleted successfully');
  } catch (error) {
    // Handle the error
    console.error('Error deleting data from local storage:', error);
  }
};
