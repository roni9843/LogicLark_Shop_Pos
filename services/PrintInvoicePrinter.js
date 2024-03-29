import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

const PrintInvoicePrinter = ({finalPrint}) => {
  const nameDD = ['name', 'low', 'height'];

  return (
    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
      <TouchableOpacity
        style={{
          padding: 15,
          marginVertical: 10,
          backgroundColor: '#1ACAF7',
          justifyContent: 'flex-end',
          borderRadius: 10,
          marginBottom: 50,
        }}
        //   onPress={() => pSaveAndPrint()}

        onPress={() => finalPrint()}>
        <Text style={{color: 'white', fontSize: 15}}>Print</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PrintInvoicePrinter;
