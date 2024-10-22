import { Genre } from "./genre-types";
export interface BookProvider {
  ProviderID?: number;
  ContactID: number;
  AddressID: number;
  ProviderName: string;
  Phone: string;
  Email: string;
  Street: string;
  City: string;
  State: string;
  Country: string;
  PostalCode: string;
}



export interface ProviderBookList {
  BookID: number
  Title: string
  ISBN: string
  Genres: string | string[]
  PublicationDate: string
  AuthorName: string
  Description: string
  PublisherName: string
}