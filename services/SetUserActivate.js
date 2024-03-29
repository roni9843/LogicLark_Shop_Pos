import AsyncStorage from '@react-native-async-storage/async-storage';

const saveUserData = async (userID, userTimeLimit) => {
  console.log('local data 99', userID, userTimeLimit);

  try {
    await AsyncStorage.setItem('userID', JSON.stringify(userID));
    await AsyncStorage.setItem('userTimeLimit', JSON.stringify(userTimeLimit));
    console.log('Data saved successfully');
  } catch (error) {
    console.log('Error saving data:', error);
  }
};

const getUserData = async () => {
  try {
    let userID = await AsyncStorage.getItem('userID');

    userID = await JSON.parse(userID);

    let userTimeLimit = await AsyncStorage.getItem('userTimeLimit');

    userTimeLimit = await JSON.parse(userTimeLimit);

    if (userID !== null && userTimeLimit !== null) {
      return {userID, userTimeLimit};
    } else {
      console.log('No data found');
      return null;
    }
  } catch (error) {
    console.log('Error retrieving data:', error);
    return null;
  }
};

export {getUserData, saveUserData};
