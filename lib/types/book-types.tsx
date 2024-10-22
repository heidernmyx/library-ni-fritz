
export type BookFormField = {
  title: string;
  author: string;
  genres: [];
  isbn: string;
  publicationDate: string;
  providerId: string;
  copies: number;
}



export type BookProvider = {
  ProviderID: number;
  ContactID: number;
  AddressID: number;
  ProviderName: string;
  Phone: string;
  Email: string;
  PostalCode: string;
  City: string;
  Country: string;
  State: string;
  Street: string;
};


export type Book = {
  BookID: number;
  Title: string;
  AuthorName: string;
  Genres: string | string[];
  ISBN: string;
  ProviderName: string | null;
  PublicationDate: string;
  TotalCopies?: number;
};
