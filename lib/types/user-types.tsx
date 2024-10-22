export interface UserFormProps {
  UserID: number
  Fname: string
  Mname: string
  Lname: string
  Email: string
  Phone: string
  RoleID: number
  // RoleName: string
  GenderID: number
  // GenderName: string
}

export type UserProps = {
  UserID: number
  Fname: string
  Mname: string
  Lname: string
  Email: string
  Phone: string
  RoleName: string
  // RoleID: number
  GenderName: string
  Status: number
  // GenderID: number
}


// "json": {
//         "Name": "user",
//         "Email": "user@user.com",
//         "Phone": "1234567890",
//         "Password": "user",
//         "Role_id": "3"
//     }