import { useState} from 'react';

export const useSearch = () => {

  const [ search, setSearch] = useState<string>('');
  
  const = (e: React.ChangeEvent<HTMLInputElement>) => {

    setSearch(e.target.value);
  }
}