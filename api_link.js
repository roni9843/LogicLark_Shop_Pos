import {getUserApi} from './services/SetUserActivate';

const getData = async () => {
  const data = await getUserApi();

  console.log('566655555555555555 ', data);

  return data;
};

//export const API_URL = 'https://logic-lark-shop-pos-backend.vercel.app';
//export const API_URL = 'https://192.168.0.108';

// Exporting the promise
export const API_URL = getData();
