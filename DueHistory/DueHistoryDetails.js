import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DueHistoryDetails = ({individualUserDue}) => {
  // Check if individualUserDue is undefined or null
  if (!individualUserDue) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F0F2F5',
        }}>
        <Text style={{fontSize: 18, color: '#333'}}>No data available</Text>
      </View>
    );
  }

  // Check if individualUserDue.user is undefined or null
  if (!individualUserDue.user) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F0F2F5',
        }}>
        <Text style={{fontSize: 18, color: '#333'}}>
          User details not available
        </Text>
      </View>
    );
  }

  const formatDate = dateString => {
    const date = new Date(dateString);
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const formattedDate = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${formatTime(date)}`;

    return formattedDate;
  };

  const formatTime = date => {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Add leading zero if the number is less than 10
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes}`;
  };

  const [receivedAmount, setReceivedAmount] = useState('');

  const handleButtonPress = () => {
    // Implement the logic for the button press here
    console.log('Button pressed!');
  };

  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: '#F0F2F5',
        paddingHorizontal: 20,
        paddingBottom: 20,
      }}>
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
        <Text
          style={{
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 10,
            color: '#4F8EF7',
          }}>
          User Details
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <Text style={{flex: 1, fontWeight: 'bold', color: '#555'}}>
            Name:
          </Text>
          <Text style={{flex: 2, color: '#333', fontWeight: 'bold'}}>
            {individualUserDue.user.user_name
              ? individualUserDue.user.user_name
              : 'N/A'}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <Text style={{flex: 1, fontWeight: 'bold', color: '#555'}}>
            Phone Number:
          </Text>
          <Text style={{flex: 2, color: '#333', fontWeight: 'bold'}}>
            {individualUserDue.user.user_phone
              ? individualUserDue.user.user_phone
              : 'N/A'}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <Text style={{flex: 1, fontWeight: 'bold', color: '#555'}}>
            Total Due:
          </Text>
          <Text style={{flex: 2, color: '#333'}}>200</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <Text style={{flex: 1, fontWeight: 'bold', color: '#555'}}>
            Received:
          </Text>
          <TextInput
            style={{
              flex: 2,
              borderWidth: 1,
              borderColor: '#999',
              padding: 8,
              borderRadius: 5,
              backgroundColor: '#FFF',
            }}
            placeholder="Enter received amount"
            keyboardType="numeric"
            // Add onChangeText handler here
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: '#4F8EF7',
            paddingVertical: 10,
            borderRadius: 5,
            alignItems: 'center',
          }}
          onPress={() => {
            // Add your button press logic here
          }}>
          <Text style={{color: '#FFF', fontWeight: 'bold'}}>Submit</Text>
        </TouchableOpacity>
      </View>

      {individualUserDue.dues.map((due, index) => (
        <View
          key={index}
          style={{
            marginBottom: 20,
            backgroundColor: '#FFF',
            borderRadius: 10,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 3,
          }}>
          {/* Display user details */}

          {/* Display due details */}

          {/* Add your icon here */}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              marginBottom: 5,
            }}>
            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: '#4F8EF7',
                  marginBottom: 5,
                }}>
                🖨️
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 5,
            }}>
            <Text style={{fontSize: 22, fontWeight: 'bold', color: '#4F8EF7'}}>
              Items
            </Text>
            <Text style={{color: 'gray', fontSize: 14, textAlign: 'right'}}>
              Date: {due.buyDate ? formatDate(due.buyDate) : 'N/A'}
            </Text>
          </View>
          {/* Iterate over dues */}
          <View
            style={{
              backgroundColor: '#F0F2F5',
              padding: 10,
              borderRadius: 5,
              marginBottom: 10,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 1,
              elevation: 1,
              flexDirection: 'row', // Align items horizontally
              alignItems: 'center', // Center items vertically
              justifyContent: 'space-between', // Space between items
              borderBottomWidth: 2,
              borderBottomColor: '#ccc',
            }}>
            <Text style={{color: '#333', fontWeight: 'bold', flex: 1}}>
              Name
            </Text>
            <Text style={{color: '#333', fontWeight: 'bold', flex: 1}}>
              Price
            </Text>
            <Text style={{color: '#333', fontWeight: 'bold', flex: 1}}>
              Qty
            </Text>
            <Text
              style={{
                color: '#333',
                fontWeight: 'bold',
                textAlign: 'right',
                flex: 1,
              }}>
              Total
            </Text>
          </View>
          {due.details.map((detail, i) => (
            <View
              key={i}
              style={{
                backgroundColor: '#FFF',
                padding: 5,
                borderRadius: 5,
                borderBottomColor: 'gray',
                borderBottomWidth: 1,
                marginBottom: 5,
                shadowColor: '#000',
                // shadowOffset: {width: 0, height: 2},
                // shadowOpacity: 0.1,
                shadowRadius: 1,
                // elevation: 1,
                flexDirection: 'row', // Align items horizontally
                alignItems: 'center', // Center items vertically
                justifyContent: 'space-between', // Space between items
              }}>
              <Text style={{color: '#333', fontWeight: 'bold', flex: 1}}>
                {detail.name ? detail.name : 'N/A'}
              </Text>
              <Text style={{color: '#333', flex: 1}}>
                {detail.price ? detail.price : 'N/A'}
              </Text>
              <Text style={{color: '#333', flex: 1}}>
                {detail.qty ? detail.qty : 'N/A'}
              </Text>
              <Text
                style={{
                  color: '#333',
                  fontWeight: 'bold',
                  textAlign: 'right',
                  flex: 1,
                }}>
                {detail.total ? detail.total : 'N/A'}
              </Text>
            </View>
          ))}
          {/* Display other due details */}
          <View
            style={{
              backgroundColor: '#FFF',
              padding: 5,
              borderRadius: 5,
              // marginBottom: 10,
              //  shadowOffset: {width: 0, height: 2},
              //  shadowOpacity: 0.1,
              //  shadowRadius: 1,
              // elevation: 1,
              flexDirection: 'row', // Arrange items horizontally
              justifyContent: 'space-between', // Space between items
            }}>
            <View>
              <Text
                style={{color: '#333', fontWeight: 'bold', marginBottom: 5}}>
                Subtotal:
              </Text>
              <Text
                style={{color: '#333', fontWeight: 'bold', marginBottom: 5}}>
                Discount:
              </Text>
              <Text
                style={{color: '#333', fontWeight: 'bold', marginBottom: 5}}>
                Total:
              </Text>
              <Text
                style={{color: '#333', fontWeight: 'bold', marginBottom: 5}}>
                Account Received:
              </Text>
              <Text
                style={{color: '#333', fontWeight: 'bold', marginBottom: 5}}>
                Due:
              </Text>
            </View>
            <View>
              <Text
                style={{
                  color: '#333',
                  fontWeight: 'bold',
                  marginBottom: 5,
                  textAlign: 'right',
                }}>
                ৳{due.subTotal ? due.subTotal : 'N/A'}
              </Text>
              <Text
                style={{
                  color: '#333',
                  fontWeight: 'bold',
                  marginBottom: 5,
                  textAlign: 'right',
                }}>
                - ৳{due.discount ? due.discount : 'N/A'}
              </Text>
              <Text
                style={{
                  color: '#333',
                  fontWeight: 'bold',
                  marginBottom: 5,
                  textAlign: 'right',
                }}>
                ৳{due.total ? due.total : 'N/A'}
              </Text>
              <Text
                style={{
                  color: '#333',
                  fontWeight: 'bold',
                  marginBottom: 5,
                  textAlign: 'right',
                }}>
                ৳{due.accountReceived ? due.accountReceived : 'N/A'}
              </Text>
              <Text
                style={{
                  color: '#333',
                  fontWeight: 'bold',
                  marginBottom: 5,
                  textAlign: 'right',
                }}>
                ৳{due.due ? due.due : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default DueHistoryDetails;
