import axios from "axios";


const fetchGenres = async () => {
  try {
    // const formData = new FormData();
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/books.php`, {
      params: {
        operation: "fetchGenres",
      },
    });
      // { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    
    // setGenres(response.data);
    return response.data;
  } catch (error) {
    // toast({
    //   title: "Error",
    //   description: "Failed to fetch genres.",
    //   variant: "destructive",
    // });
  }
};

export default fetchGenres