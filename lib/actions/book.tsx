import axios from 'axios';
import { useToast } from '@/hooks/use-toast';


export const fetchBooks = async () => {
  try {
    // const response = await axios.post(
    //   `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
    //   { operation: "fetchBooks" },
    //   { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    // );
    // setBooks(response.data);

    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/books.php`, {
      params: {
        operation: "fetchBooks",
      }
    })
    return response.data;
  } catch (error) {
    // toast({
    //   title: "Error",
    //   description: "Failed to fetch books.",
    //   variant: "destructive",
    // });
  }
};



// export default addBook;