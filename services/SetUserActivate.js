import AsyncStorage from '@react-native-async-storage/async-storage';

const saveUserApi = async userApi => {
  try {
    await AsyncStorage.setItem('userApi', JSON.stringify(userApi));

    console.log('save user userApi');
  } catch (error) {
    console.log('Error saving data:', error);
  }
};
const saveUserData = async userTimeLimit => {
  try {
    await AsyncStorage.setItem('userTimeLimit', JSON.stringify(userTimeLimit));
    console.log('save user time limit');
  } catch (error) {
    console.log('Error saving data:', error);
  }
};

const getUserApi = async () => {
  try {
    let userApi = await AsyncStorage.getItem('userApi');

    userApi = await JSON.parse(userApi);

    if (userApi !== null) {
      return userApi;
    } else {
      console.log('No data found');
      return null;
    }
  } catch (error) {
    console.log('Error retrieving data:', error);
    return null;
  }
};
const getUserData = async () => {
  try {
    let userTimeLimit = await AsyncStorage.getItem('userTimeLimit');

    userTimeLimit = await JSON.parse(userTimeLimit);

    if (userTimeLimit !== null) {
      return userTimeLimit;
    } else {
      console.log('No data found');
      return null;
    }
  } catch (error) {
    console.log('Error retrieving data:', error);
    return null;
  }
};

export {getUserApi, getUserData, saveUserApi, saveUserData};
