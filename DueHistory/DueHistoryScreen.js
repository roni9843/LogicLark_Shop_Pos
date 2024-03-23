import React, {useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DueHistoryScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [data, setData] = useState([
    {
      id: '1',
      name: 'John Doe',
      address: '123 Main St',
      time: '10:00 AM',
      amount: 50,
      receivedAmount: 30,
      products: ['Product 1', 'Product 2', 'Product 3'],
    },
  ]);

  const getTotalDue = () => {
    let totalDue = 0;
    data.forEach(item => {
      totalDue += item.amount - item.receivedAmount;
    });
    return totalDue;
  };

  const renderItem = ({item}) => (
    <View
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
      }}>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <Text style={{color: '#FFD600', marginRight: 5, fontWeight: 'bold'}}>
          Time:
        </Text>
        <Text style={{color: '#37474F'}}>{item.time}</Text>
      </View>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <Text style={{color: '#FFD600', marginRight: 5, fontWeight: 'bold'}}>
          Total Amount:
        </Text>
        <Text style={{color: '#FF6D00'}}>{'$' + item.amount}</Text>
        {/* Orange total amount */}
      </View>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <Text style={{color: '#FFD600', marginRight: 5, fontWeight: 'bold'}}>
          Received Amount:
        </Text>
        <Text style={{color: '#FF6D00'}}>{'$' + item.receivedAmount}</Text>
        {/* Orange received amount */}
      </View>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <Text style={{color: '#FFD600', marginRight: 5, fontWeight: 'bold'}}>
          Due Amount:
        </Text>
        <Text style={{color: '#F44336'}}>
          {'$' + (item.amount - item.receivedAmount)}
        </Text>
        {/* Red due amount */}
      </View>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <Text style={{color: '#FFD600', marginRight: 5, fontWeight: 'bold'}}>
          Products:
        </Text>
        <Text style={{color: '#37474F'}}>{item.products.join(', ')}</Text>
      </View>
    </View>
  );

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
          placeholder="Enter Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <TouchableOpacity
          style={{
            backgroundColor: '#4CAF50',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          onPress={() => console.log('Search button pressed')}>
          <Text style={{color: '#FFF', fontWeight: 'bold'}}>Search</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}>
        <View style={{flex: 1, alignItems: 'flex-start'}}>
          <Text style={{color: '#546E7A', marginRight: 5, fontWeight: 'bold'}}>
            Mobile Number:
          </Text>
          <Text style={{color: '#37474F'}}>{phoneNumber}</Text>
        </View>
        <View style={{flex: 1, alignItems: 'flex-start'}}>
          <Text style={{color: '#546E7A', marginRight: 5, fontWeight: 'bold'}}>
            Total Due:
          </Text>
          <Text style={{color: '#4CAF50'}}>{'$' + getTotalDue()}</Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}>
        <View style={{flex: 1, alignItems: 'flex-start'}}>
          <Text style={{color: '#546E7A', marginRight: 5, fontWeight: 'bold'}}>
            Name:
          </Text>
          <Text style={{color: '#37474F'}}>{phoneNumber}</Text>
        </View>
        <View style={{flex: 1, alignItems: 'flex-start'}}>
          <Text style={{color: '#546E7A', marginRight: 5, fontWeight: 'bold'}}>
            Address:
          </Text>
          <Text style={{color: '#4CAF50'}}>{'$' + getTotalDue()}</Text>
        </View>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
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
