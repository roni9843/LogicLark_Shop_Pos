import React, {useEffect, useState} from 'react';
import {BackHandler, StyleSheet, Text, View} from 'react-native';
import {API_URL} from '../api_link';
import DueHistoryDetails from './DueHistoryDetails';
import DueHistoryScreen from './DueHistoryScreen';

const DueLayout = ({onBack}) => {
  let pageStateLocal = 'history';

  const [pageState, setPageState] = useState(pageStateLocal);

  const [individualUserDue, setIndividualUserDue] = useState();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, [pageState]);

  const handleBackPress = () => {
    if (pageState === 'details') {
      setPageState('history');
      console.log('Switching to history');
      return true; // Prevent default back behavior
    } else if (pageState === 'history') {
      onBack();
      console.log('Calling onBack');
      return true; // Prevent default back behavior
    }

    // In any other case, let the default back behavior happen
    return false;
  };

  const [allUserInfo, setAllUserInfo] = useState([]);

  useEffect(() => {
    callFetch();
  }, []);

  const callFetch = async () => {
    try {
      const response = await fetch(`${API_URL}/findAllPhoneWithDue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        // Handle the data received from the API
        console.log('Data from API:', data);
        setAllUserInfo(data);
      } else {
        console.error('Failed to fetch data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const cardData = [
    {
      name: 'John Doe',
      phoneNumber: '123-456-7890',
      dueHistory: 'Due history for John Doe',
    },
    {
      name: 'Jane Smith',
      phoneNumber: '987-654-3210',
      dueHistory: 'Due history for Jane Smith',
    },
    // Add more sample data as needed
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.textLabel}>Bell</Text>
        <Text style={styles.balanceTitle}>Hasan's Store</Text>
        <Text style={styles.textLabel}>User</Text>
      </View>

      {pageState === 'history' ? (
        <DueHistoryScreen
          setIndividualUserDue={setIndividualUserDue}
          allUserInfo={allUserInfo}
          setPageState={setPageState}
        />
      ) : (
        <DueHistoryDetails
          callFetchParent={callFetch}
          individualUserDue={individualUserDue}
          setPageState={setPageState}
          onBack={onBack}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 0,
    paddingHorizontal: 5,
    backgroundColor: '#F5F5F5', // Light gray background
    //marginBottom: 70,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 3,
  },
  balanceTitle: {
    fontSize: 24,
    color: '#4F8EF7',
    fontWeight: 'bold',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default DueLayout;
