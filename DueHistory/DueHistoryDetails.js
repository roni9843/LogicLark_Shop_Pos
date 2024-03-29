import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {BluetoothEscposPrinter} from 'react-native-bluetooth-escpos-printer';
import {API_URL} from '../api_link';

const DueHistoryDetails = ({individualUserDue, callFetchParent}) => {
  console.log('this is id :', individualUserDue);

  useEffect(() => {
    callFetch();
  }, [individualUserDue]);

  const [userInfo, setUserInfo] = useState({});
  const [userDueAndInvoiceHistory, setUserDueAndInvoiceHistory] = useState([]);

  const callFetch = async () => {
    try {
      const apiUrl = await API_URL;

      console.log('5555555555555555555555555555 ', apiUrl);

      const response = await fetch(`${apiUrl}/findAndCheckDue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: individualUserDue,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Handle the data received from the API
        console.log('Data from API:', data);

        // Sort the merged array by date in descending order (from new to old)
        // Set the sorted array to state
        setUserInfo(data);

        const modifiedData = {
          ...data,
          invoiceHistories: data.invoiceHistories.map(invoice => ({
            ...invoice,
            date: invoice.buyDate,
          })),
        };

        const mergedArray = [
          ...modifiedData.dueReceived,
          ...modifiedData.invoiceHistories,
        ];

        setUserDueAndInvoiceHistory(
          mergedArray.sort((a, b) => new Date(b.date) - new Date(a.date)),
        );
      } else {
        console.error('Failed to fetch data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const [userAmount, setUserAmount] = useState('');

  const handleAmountChange = text => {
    // Ensure only numeric input and up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(text) || text === '') {
      // Check if the entered amount is less than or equal to 40
      if (
        (parseFloat(text) <= userInfo?.user?.due_amount || text === '') &&
        (text === '' || text[text.length - 1] !== '+')
      ) {
        // Update the amount if it's valid
        setUserAmount(text);
      }
    }
  };

  const [btnDisable, setBtnDisable] = useState(false);

  const sendDataToBackend = async () => {
    setBtnDisable(true);

    try {
      const timestamp = Date.now(); // Get current timestamp in milliseconds
      const id = timestamp.toString(16);

      // Object to send to the backend
      const dataToSend = {
        receive_id: id,
        userId: individualUserDue,
        date: new Date(),
        received_amount: parseInt(userAmount),
        previous_due: parseInt(userInfo?.user?.due_amount - userAmount),
        due_history: parseInt(userInfo?.user?.due_amount),
      };

      const apiUrl = await API_URL;

      console.log('8888888888888888888888888888888 -> ', `${apiUrl}/createDue`);

      // Sending the object to the backend URL
      const response = await fetch(`${apiUrl}/createDue`, {
        method: 'POST', // Adjust the method as needed (GET, POST, etc.)
        headers: {
          'Content-Type': 'application/json', // Specify content type
        },
        body: JSON.stringify(dataToSend), // Convert object to JSON string
      });

      // Checking if the request was successful (status code 200)
      if (response.ok) {
        const responseData = await response.json(); // Parse response JSON
        console.log('Response from backend:', responseData);

        setUserInfo(responseData);

        const modifiedData = {
          ...responseData,
          invoiceHistories: responseData.invoiceHistories.map(invoice => ({
            ...invoice,
            date: invoice.buyDate,
          })),
        };

        const mergedArray = [
          ...modifiedData.dueReceived,
          ...modifiedData.invoiceHistories,
        ];

        setUserDueAndInvoiceHistory(
          mergedArray.sort((a, b) => new Date(b.date) - new Date(a.date)),
        );

        // Handle the response data as needed

        callFetchParent();
        setUserAmount('');

        Keyboard.dismiss();
        setBtnDisable(false);

        // Assuming "successful" means some condition based on the response
        // Show a success notification here

        alert('Data sent successfully!');
      } else {
        console.error('Failed to fetch:', response.status);
        // Handle error responses
        alert('Failed to send data. Please try again later.');
        setBtnDisable(true);
      }
    } catch (error) {
      console.error('Error sending data to backend:', error);
      // Handle errors
      alert('Error sending data to backend. Please try again later.');
      setBtnDisable(true);
    }
  };

  // Check if individualUserDue.user is undefined or null
  // if (!userInfo.user) {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         alignItems: 'center',
  //         justifyContent: 'center',
  //         backgroundColor: '#F0F2F5',
  //       }}>
  //       <Text style={{fontSize: 18, color: '#333'}}>
  //         User details not available
  //       </Text>
  //     </View>
  //   );
  // }

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

  const printDue = async ({due}) => {
    // Convert the date string to a Date object
    const date = new Date(due.date);

    // Format the date
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    try {
      // Print the information
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER,
      );
      await BluetoothEscposPrinter.setBlob(1);
      await BluetoothEscposPrinter.printText("Hasan's Store\n\r", {
        encoding: 'GBK',
        codepage: 0,
        widthtimes: 0,
        heigthtimes: 0,
        fonttype: 0,
      });
      await BluetoothEscposPrinter.setBlob(0);
      await BluetoothEscposPrinter.printText(
        'New Sonakanda, BussStand\n\r',
        {},
      );
      await BluetoothEscposPrinter.printText(
        'Ruhitpur, Keranigonj, Dhaka\n\r',
        {
          encoding: 'GBK',
          codepage: 0,
          widthtimes: 0,
          heigthtimes: 0,
          fonttype: 0,
        },
      );
      await BluetoothEscposPrinter.printText('01813048283\n\r', {
        encoding: 'GBK',
        codepage: 0,
        widthtimes: 0,
        heigthtimes: 0,
        fonttype: 0,
      });
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.LEFT,
      );
      await BluetoothEscposPrinter.printText(`Date: ${formattedDate}\n\r`, {});
      await BluetoothEscposPrinter.printText(
        `Due Receive No: ${due.receive_id}\n\r`,
        {},
      );
      await BluetoothEscposPrinter.printText(
        `Customer: ${due.customerName}\n\r`,
        {},
      );
      await BluetoothEscposPrinter.printText(
        `Mobile: ${due.customerPhone}\n\r`,
        {},
      );
      await BluetoothEscposPrinter.printText(
        '--------------------------------\n\r',
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Received Amount', `${due.received_amount.toFixed(2)}`],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Due History', `-${due.due_history === null ? 0 : due.due_history}`],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        [
          'Previous Due',
          `-${due.previous_due === null ? 0 : due.previous_due}`,
        ],
        {},
      );
      await BluetoothEscposPrinter.printText(
        'Thank you for shopping with us!\r\n',
        {},
      );
      await BluetoothEscposPrinter.printText('Powered By:\r\n', {});
      await BluetoothEscposPrinter.printText('LogicLark. 01927574610\r\n', {});
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.printText('\n\r', {});
    } catch (error) {
      console.error('Error printing due:', error);
    }
  };

  const printInvoice = async ({due}) => {
    // Fixing date formatting issue
    const date = new Date(due.buyDate);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    const printItemDetails = async () => {
      // Iterate over due.details instead of due.products
      for (const dt of due.details) {
        await BluetoothEscposPrinter.printColumn(
          columnWidths,
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.CENTER,
            BluetoothEscposPrinter.ALIGN.CENTER,
            BluetoothEscposPrinter.ALIGN.RIGHT,
          ],
          [
            `${dt.name}`,
            `${dt.qty}`,
            `${parseInt(dt.price).toFixed(2)}`,
            `${parseInt(dt.total).toFixed(2)}`,
          ],
          {},
        );
      }
    };

    // ? ===== start ============
    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.CENTER,
    );
    await BluetoothEscposPrinter.setBlob(1);
    await BluetoothEscposPrinter.printText("Hasan's Store\n\r", {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 0,
      heigthtimes: 0,
      fonttype: 0,
    });
    await BluetoothEscposPrinter.setBlob(0);
    await BluetoothEscposPrinter.printText('New Sonakanda, BussStand\n\r', {});
    await BluetoothEscposPrinter.printText('Ruhitpur, Keranigonj, Dhaka\n\r', {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 0,
      heigthtimes: 0,
      fonttype: 0,
    });
    await BluetoothEscposPrinter.printText('01813048283\n\r', {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 0,
      heigthtimes: 0,
      fonttype: 0,
    });
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.LEFT,
    );

    await BluetoothEscposPrinter.printText(`Date: ${formattedDate}\n\r`, {});
    await BluetoothEscposPrinter.printText(`Invoice No: ${due.inId}\n\r`, {});
    await BluetoothEscposPrinter.printText(
      `Customer: ${due.customerName}\n\r`,
      {},
    );
    await BluetoothEscposPrinter.printText(
      `Mobile: ${due.customerPhone}\n\r`,
      {},
    );

    // await BluetoothEscposPrinter.printText('Salesperson: 18664896621\n\r', {});
    await BluetoothEscposPrinter.printText(
      '--------------------------------\n\r',
      {},
    );
    let columnWidths = [12, 6, 6, 8];
    await BluetoothEscposPrinter.printColumn(
      columnWidths,
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      ['Product', 'Qty', 'U P', 'Amount'],
      {},
    );
    await BluetoothEscposPrinter.printText(
      '--------------------------------\n\r',
      {},
    );

    await printItemDetails();

    await BluetoothEscposPrinter.printText(
      '--------------------------------\n\r',
      {},
    );
    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Subtotal', `${due.subTotal.toFixed(2)}`],
      {},
    );
    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Discount', `-${due.discount === null ? 0 : due.discount}`],
      {},
    );

    await BluetoothEscposPrinter.printText(
      '--------------------------------\n\r',
      {},
    );

    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Grand Total', `${due.total.toFixed(2)}`],
      {},
    );
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Paid Amount', `${due.receivedAmount.toFixed(2)}`],
      {},
    );
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Due Amount', `${due.due.toFixed(2)}`],
      {},
    );
    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Previous Due', `${due.due_history.toFixed(2)}`],
      {},
    );

    await BluetoothEscposPrinter.printText('\n\r', {});

    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.CENTER,
    );
    await BluetoothEscposPrinter.printText(
      'Thank you for shopping with us!\r\n',
      {},
    );
    await BluetoothEscposPrinter.printText('Powered By:\r\n', {});
    await BluetoothEscposPrinter.printText('LogicLark. 01927574610\r\n', {});
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printText('\n\r', {});
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
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
            {userInfo?.user?.user_name ? userInfo?.user?.user_name : 'N/A'}
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
            {userInfo?.user?.user_phone ? userInfo?.user?.user_phone : 'N/A'}
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
          <Text style={{flex: 2, color: '#333'}}>
            {userInfo?.user?.due_amount ? userInfo?.user?.due_amount : 'N/A'}{' '}
            {userAmount && '-'} {userAmount} {userAmount && '='}{' '}
            {userAmount && userInfo?.user?.due_amount - userAmount}
          </Text>
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
              color: '#000', // Setting text color to black
            }}
            placeholder="Enter received amount"
            keyboardType="numeric"
            value={userAmount}
            onChangeText={handleAmountChange}
          />
        </View>

        {btnDisable ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ActivityIndicator size="large" color="#333" />
          </View>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: '#4F8EF7',
              paddingVertical: 10,
              borderRadius: 5,
              alignItems: 'center',
            }}
            onPress={() => {
              userAmount && sendDataToBackend();
            }}>
            <Text style={{color: '#FFF', fontWeight: 'bold'}}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
      {(!userInfo || Object.keys(userInfo).length === 0) && (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      )}

      {userDueAndInvoiceHistory.map(dt => console.log('this is roni'))}

      {userDueAndInvoiceHistory &&
        userDueAndInvoiceHistory.map((due, index) =>
          due.receive_id ? (
            <View
              style={{
                marginBottom: 20,
                backgroundColor: '#C8E6C9', // Lighter green background
                borderRadius: 10,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 3,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: 'bold',
                    color: '#000',
                  }}>
                  Due Received
                </Text>
                <TouchableOpacity onPress={() => printDue(due)}>
                  <Text
                    style={{fontSize: 22, fontWeight: 'bold', color: '#000'}}>
                    🖨️
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{marginTop: 10}}>
                {/* Add spacing between sections */}
                <Text style={{fontWeight: 'bold', color: '#000', fontSize: 16}}>
                  Details:
                </Text>
                <View style={{marginBottom: 5}}>
                  <Text style={{color: '#000'}}>
                    <Text style={{fontWeight: 'bold'}}>Receive ID:</Text>{' '}
                    {due.receive_id}
                  </Text>
                </View>
                <View style={{marginBottom: 5}}>
                  <Text style={{color: '#000'}}>
                    <Text style={{fontWeight: 'bold'}}>Received Amount:</Text> ৳{' '}
                    {due.received_amount}
                  </Text>
                </View>
                <View style={{marginBottom: 5}}>
                  <Text style={{color: '#000'}}>
                    <Text style={{fontWeight: 'bold'}}>Due History:</Text> ৳{' '}
                    {due.due_history}
                  </Text>
                </View>
                <View style={{marginBottom: 5}}>
                  <Text style={{color: '#000'}}>
                    <Text style={{fontWeight: 'bold'}}>Previous Due:</Text> ৳{' '}
                    {due.previous_due}
                  </Text>
                </View>
                <View style={{marginBottom: 5}}>
                  <Text style={{color: '#000'}}>
                    <Text style={{fontWeight: 'bold'}}>Date:</Text>{' '}
                    {formatDate(due.date)}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
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
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginBottom: 5,
                  //  paddingHorizontal: 10, // Added padding for better spacing
                }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: 'bold',
                    color: '#4F8EF7',
                  }}>
                  Invoice Id:
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    printInvoice(due);
                  }}>
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
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: 'grey',
                  marginBottom: 10,
                }}>
                {due.inId}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginBottom: 5,
                }}>
                <Text
                  style={{fontSize: 22, fontWeight: 'bold', color: '#4F8EF7'}}>
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
                    style={{
                      color: '#333',
                      fontWeight: 'bold',
                      marginBottom: 5,
                    }}>
                    Subtotal:
                  </Text>
                  <Text
                    style={{
                      color: '#333',
                      fontWeight: 'bold',
                      marginBottom: 5,
                    }}>
                    Discount:
                  </Text>
                  <Text
                    style={{
                      color: '#333',
                      fontWeight: 'bold',
                      marginBottom: 5,
                    }}>
                    Total:
                  </Text>
                  <Text
                    style={{
                      color: '#333',
                      fontWeight: 'bold',
                      marginBottom: 5,
                    }}>
                    Account Received:
                  </Text>
                  <Text
                    style={{
                      color: '#333',
                      fontWeight: 'bold',
                      marginBottom: 5,
                    }}>
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
          ),
        )}
    </ScrollView>
  );
};

export default DueHistoryDetails;
