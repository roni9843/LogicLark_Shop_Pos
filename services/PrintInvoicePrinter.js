import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {activeBtnColor} from '../ColorSchema';

const PrintInvoicePrinter = ({finalPrint}) => {
  return (
    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
      <TouchableOpacity
        style={{
          padding: 15,
          marginVertical: 10,
          backgroundColor: activeBtnColor,
          justifyContent: 'flex-end',
          borderRadius: 10,
          marginBottom: 50,
          paddingHorizontal: 30,
        }}
        //   onPress={() => pSaveAndPrint()}

        onPress={() => finalPrint()}>
        <Text style={{color: 'white', fontSize: 15}}>Print</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PrintInvoicePrinter;
