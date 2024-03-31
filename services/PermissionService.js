import AsyncStorage from '@react-native-async-storage/async-storage';

const setPermissionOnLocalStorage = async (userID, userTimeLimit) => {
  try {
    await AsyncStorage.setItem('userPermission', JSON.stringify(userID));
    console.log('permission Data saved successfully');
  } catch (error) {
    console.log('Error saving data:', error);
  }
};

const getPermissionOnLocalStorage = async () => {
  try {
    let userPermission = await AsyncStorage.getItem('userPermission');

    userPermission = await JSON.parse(userPermission);

    if (userPermission !== null) {
      return userPermission;
    } else {
      console.log('No data found');
      return null;
    }
  } catch (error) {
    console.log('Error retrieving data:', error);
    return null;
  }
};

export {getPermissionOnLocalStorage, setPermissionOnLocalStorage};
