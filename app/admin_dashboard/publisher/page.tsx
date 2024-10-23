import PublisherManager from '@/components/librarian/publisherManagement'
import React from 'react'

const PublisherPage = () => {
  return (
     <div className="flex flex-col flex-1 mx-auto p-4 min-h-screen w-[90vw] max-w-7xl pl-[4vw] bg-background rounded-2xl border-black solid">
      <PublisherManager/>
      </div>
  )
}

export default PublisherPage