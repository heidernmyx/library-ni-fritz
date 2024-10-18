"use client"
import React from 'react'
import { useParams } from 'next/navigation'

const ProvidedBooksPage = () => {

  const { id } = useParams();

  return (
    <>
      <div>ProvidedBooksPage</div>
      <>{id}</>
    </>
  )
}

export default ProvidedBooksPage