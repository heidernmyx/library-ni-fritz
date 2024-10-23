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
  alert(response.data.message)
  // return response.data
}

export const updateUser = async (data: any) => {
  const formData = new FormData();
  formData.append("operation", "update_profile")
  formData.append("json", JSON.stringify(data));
  const response = await axios({
    url: `${process.env.NEXT_PUBLIC_API_URL}/users.php`,
    method: "POST",
    data: formData
  })
  
  alert(response.data.message)
  // return response.data;
}

export const archiveUser = async (data: any) => {

  const formData = new FormData();
  formData.append('operation', 'archive_user');
  formData.append('json', JSON.stringify({ UserID: data }));

  const result = await axios({
    url: `${process.env.NEXT_PUBLIC_API_URL}/users.php`,
    method: 'POST',
    data: formData
  })
  return result.data == 1 ? "User archived successfully." : "Failed to archive user."
}


export const restoreUser = async (data: any) => {

  const formData = new FormData();
  formData.append('operation', 'restore_user');
  formData.append('json', JSON.stringify({ UserID: data }));

  const result = await axios({
    url: `${process.env.NEXT_PUBLIC_API_URL}/users.php`,
    method: 'POST',
    data: formData
  })
  return result.data == 1 ? "User restored successfully." : "Failed to restore user."
}

export const deleteUser = async (data: any) => {

  const formData = new FormData();
  formData.append('operation', 'delete_user');
  formData.append('json', JSON.stringify({ UserID: data }));

  const result = await axios({
    url: `${process.env.NEXT_PUBLIC_API_URL}/users.php`,
    method: "POST",
    data: formData
  })
  alert(result.data == 1 ? "User deleted permanently." : "Failed to delete user.")
}

export const fetchUser = async (id: number) => {
  const response = await axios.get<UserProps>(`${process.env.NEXT_PUBLIC_API_URL}/users.php`,{
    params: {
      operation: "fetch_user",
      json: JSON.stringify({ UserID: id })
    }
  })
  console.log(response.data);
  // alert(response.data)
  // return response.data;
}