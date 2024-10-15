import axios from 'axios';
import { BookProvider } from '@/lib/types/book-provider-types';

export const fetchProviders = async () => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bookprovider.php`, {
    params: {
      operation: 'fetchBookProviders',
    }
  });
  return response.data;
}

export const addProvider = async (provider: BookProvider) => {
  // if (provider.ProviderID) {
  //   setProviders(providers.map(p => p.ProviderID === provider.ProviderID ? provider : p));
  // } else {
  //   const newProvider = { ...provider, ProviderID: Math.max(0, ...providers.map(p => p.ProviderID || 0)) + 1 };
  //   setProviders([...providers, newProvider]);
  // }
  // setIsManageDialogOpen(false);

  const formData = new FormData();
  formData.append('operation', 'addBookProvider');
  formData.append('json', JSON.stringify(provider));
  const response = await axios({
    url: `${process.env.NEXT_PUBLIC_API_URL}/bookprovider.php`,
    method: "POST",
    data: formData
  })

  return response.data;
};