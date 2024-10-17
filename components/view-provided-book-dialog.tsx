import React, { Provider } from 'react'

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { BookProvider } from '@/lib/types/book-types';
import { fetchBooksProvided } from '@/lib/actions/book-provider';
import Link from 'next/link';

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


  const [ bookList, setBookList ] = React.useState({});


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='w-full max-w-[50vw]'>
        <DialogHeader>
          <DialogTitle>
            { providerData.ProviderName }
          </DialogTitle>
          <DialogDescription>These are the list of books provided by { providerData.ProviderName}</DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button className='border-black' variant={'outline'}>Close</Button>
          </DialogClose>
        <Link href={'/librarian/book-provider/provided-books'} target='_blank'>
          <Button className='border-black border border-solid rounded-md' variant={"link"}>View in page</Button>
        </Link>
          
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ViewProvidedBookDialog