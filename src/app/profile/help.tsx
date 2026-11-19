import HelpCard from '@/components/cards/help-card'
import React from 'react'

const HelpPage = () => {
  return (
    <div className="w-full bg-light ">
      <div className="flex-col flex">
        <div className='py-5 w-full border-y-[#CCCCCC4D] border-y'>
        <h1 className="px-5 md:pl-10 text-2xl">Help</h1>
        </div>
        <div className='w-full gap-2 py-5 flex flex-col '>
          <HelpCard />
          <HelpCard />
          <HelpCard />
          <HelpCard />
        </div>
    </div>
    </div>
  )
}

export default HelpPage
