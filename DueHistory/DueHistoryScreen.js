import React, {useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DueHistoryScreen = ({
  setPageState,
  allUserInfo,
  setIndividualUserDue,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUserInfo = allUserInfo.filter(item => {
    return (
      item.user.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.user_phone.includes(searchQuery)
    );
  });
  const renderItem = ({item}) => {
    // Calculate total due for the user
    let totalDue = 0;
    item.dues.forEach(due => {
      totalDue += due.due;
    });

    return (
      <TouchableOpacity
        onPress={() => {
          setIndividualUserDue(item);
          setPageState('details');
        }}
        style={{
          backgroundColor: '#FFF9E7', // Light golden background
          borderRadius: 10,
          marginBottom: 15,
          shadowColor: '#FFD600', // Golden shadow
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.5, // Increased shadow opacity
          shadowRadius: 5, // Increased shadow radius
          elevation: 5,
          padding: 15,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View style={{flex: 1}}>
          <Text style={{color: '#37474F', fontWeight: 'bold'}}>
            {item.user.user_name}
          </Text>
          <Text style={{color: '#546E7A', marginBottom: 5}}>
            {item.user.user_phone}
          </Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={{color: '#F44336', fontWeight: 'bold', fontSize: 18}}>
            Total Due: ৳ {totalDue}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleSearch = text => {
    setSearchQuery(text);
  };

  const renderListEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#1ACAF7" />
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
        backgroundColor: '#ECEFF1',
      }}>
      <View
        style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#B0BEC5',
            paddingVertical: 12,
            paddingHorizontal: 15,
            borderRadius: 25,
            marginRight: 10,
            backgroundColor: '#FFF',
            color: '#37474F',
          }}
          placeholder="Enter Phone Number or Name"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={searchQuery ? filteredUserInfo : allUserInfo}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderListEmptyComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#ECEFF1',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#B0BEC5',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#FFF',
    color: '#37474F',
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  innerContainer: {
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    color: '#546E7A',
    marginRight: 5,
  },
  text: {
    color: '#37474F',
  },
  green: {
    color: '#4CAF50',
  },
  red: {
    color: 'red',
  },
  yellowGray: {
    color: '#BDBDBD',
  },
  bold: {
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
});

export default DueHistoryScreen;
