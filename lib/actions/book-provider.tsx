import axios from 'axios';
import { BookProvider, ProviderBookList } from '@/lib/types/book-provider-types';

export const fetchProviders = async () => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bookprovider.php`, {
    params: {
      operation: 'fetchBookProviders',
    }
  });
  return response.data;
}

export const addProvider = async (provider: BookProvider) => {
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

export const updateProvider = async (provider: BookProvider) => {
  const formData = new FormData();
  formData.append('operation', 'updateBookProvider')
  formData.append('json', JSON.stringify(provider));
  const response = await axios({
    url: `${process.env.NEXT_PUBLIC_API_URL}/bookprovider.php`,
    method: "POST",
    data: formData
  });

  return response.data; 
}

export const handleViewDialog = (setIsViewDialogOpen: any) => {
  return setIsViewDialogOpen(true);
}

  export const fetchBooksProvided = async (providerID: number) => {
  const response = await axios.get<ProviderBookList[]>(`${process.env.NEXT_PUBLIC_API_URL}/bookprovider.php`, {
    params: {
      operation: "fetchBookProvided",
      json: JSON.stringify({ ProviderID : providerID})
    }
  })
  return response.data;
}