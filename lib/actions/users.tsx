import axios from 'axios';
import { UserProps, UserFormProps } from '@/lib/types/user-types';


export const list_users = async (id: number) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users.php`,
      {
        params: { 
          operation: "list_users",
          json: JSON.stringify({ admin_user_id: id })
        }
      }    
    )
    return response.data.users;
  } catch (err) {
    alert("Current Role is unauthorized")
    // return empty array since state vars accept it
    return [];
  }
}

export const addUser = async (data: any) => {

  const formData = new FormData();
  formData.append('operation', 'register');
  formData.append('json', JSON.stringify(data));
  const response = await axios({
    url: `${process.env.NEXT_PUBLIC_API_URL}/users.php`,
    method: "POST",
    data: formData
  })
  return response.data
}

export const updateUser = async (data: any) => {

}
