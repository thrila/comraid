import React from 'react'
import { ChevronDown } from '../svgs'

const HelpCard = () => {
  return (
    <div className='px-10 py-5 flex items-center justify-between max-w-[700px]'>
<p className='text-xl'>Can i pay with Bitcoin</p>
      <span> <ChevronDown className="text-2xl"/></span>
    </div>
  )
}

export default HelpCard
