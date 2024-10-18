import React, { Provider } from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { BookProvider, ProviderBookList } from '@/lib/types/book-provider-types';
import { fetchBooksProvided } from '@/lib/actions/book-provider';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Genre } from '@/lib/types/genre-types';


interface ViewProvidedBookDialog {
  isOpen: boolean,
  onClose: () => void,
  provider: BookProvider | null;
}

const ViewProvidedBookDialog = ({isOpen, onClose, provider}: ViewProvidedBookDialog) => {

  
  const [providerData, setProviderData] = React.useState<BookProvider>({
    ProviderID: 0,
    ContactID: 0,
    AddressID: 0,
    ProviderName: '',
    Phone: '',
    Email: '',
    Street: '',
    City: '',
    State: '',
    Country: '',
    PostalCode: '',
  });
  
  const [ providerBookList, setProviderBookList ] = React.useState<ProviderBookList[]>([]);

  React.useEffect(() => {
    if (provider) {
      setProviderData(provider);
    } else {  
      setProviderData({
        ProviderID: 0,
        ContactID: 0,
        AddressID: 0,
        ProviderName: '',
        Phone: '',
        Email: '',
        Street: '',
        City: '',
        State: '',
        Country: '',
        PostalCode: '',
      });
    }
  }, [provider]);

  React.useEffect(() => {
    const fetchProviderBooksList = async () => {
      if (provider) {
        setProviderBookList(await fetchBooksProvided(provider.ProviderID ?? 0));
      }
    };
    fetchProviderBooksList();
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='w-full max-w-[66vw] '>
        <DialogHeader>
          <DialogTitle className='text-xl'>
            Provider Name: { providerData.ProviderName }
          </DialogTitle>
            <pre className='flex flex-col'>
              <div className='flex'>
                Contact #: <div className='hover:underline'>{ providerData.Phone }</div>
              </div>
              <div className='flex'>
                Email: <div className='hover:underline'>{ providerData.Email }</div>
              </div>
            </pre>
          <DialogDescription className='text-base'>These are the list of books provided by { providerData.ProviderName }</DialogDescription>
        </DialogHeader>
        <div className="max-h-[54vh] overflow-y-auto">
          <Table>
            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Book ID#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Publisher</TableHead>
                <TableHead>Date Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providerBookList.map((books: ProviderBookList) => (
                <TableRow key={books.BookID}>
                  <TableCell className="font-medium">{books.BookID}</TableCell>
                  <TableCell className="font-medium">{books.Title}</TableCell>
                  <TableCell>{books.ISBN}</TableCell>
                  <TableCell className='max-w-[10vw]'>
                    {Array.isArray(books.Genres) ? books.Genres.map((genre) => (
                      <Badge variant={'default'} key={genre}>{genre}</Badge>
                    )) : null}
                  </TableCell>
                  <TableCell className="">{books.PublisherName}</TableCell>
                  <TableCell className="">{books.PublicationDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total # of Books Provided</TableCell>
                <TableCell className="text-right">{providerBookList.length}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button className='border-black' variant={'outline'}>Close</Button>
          </DialogClose>
          {/* <Link href={`/librarian/book-provider/provided-books/${provider?.ProviderID}`} target='_blank'> */}
          <Link href={`/librarian/book-provider/provided-books/${provider?.ProviderID}?name=${provider?.ProviderName}&email=${provider?.Email}&contact=${provider?.Phone}`} 
            target='_blank'
          >
            <Button className='border-black border border-solid rounded-md' variant={"link"}>View in page</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ViewProvidedBookDialog