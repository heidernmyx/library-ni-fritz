export interface UserFormProps {
  UserID: number
  Name: string
  username: string
  password: string
}

export type UserProps = {
  UserID: number
  Name: string
  Email: string
  Phone: string
  RoleName: string
}


// "json": {
//         "Name": "user",
//         "Email": "user@user.com",
//         "Phone": "1234567890",
//         "Password": "user",
//         "Role_id": "3"
//     }