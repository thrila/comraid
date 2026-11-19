import React from 'react'
import { BinIcon } from '../svgs'
import ReviewStars from '../review-stars'

const SavedItemsCard = () => {
  return (
    <div className='w-full flex flex-row py-5 px-8  gap-5'>
<div className='w-[180px] h-[150px] bg-light-grey relative'></div>
<div className='flex flex-col justify-between w-full py-2 gap-2'>
        <div className='w-full flex justify-between items-center'>
<p className='text-black text-2xl'>Ladies Denim Trousers</p>
<p className='italic text-sm'>see details</p>
        </div>
        <div className='flex flex-col gap-[3px]'>
<p className='text-ash text-sm'>Size: M </p>
<p className='text-ash text-sm'>Color: white </p>
        </div>
        <div className='flex flex-col gap-[1px]'>
<p className='text-black text-xl font-bold'>$2000</p>
      <ReviewStars num={4}/>  
        </div>
        <div className='w-full flex justify-end'>
<button className='text-lg py-2 bg-black text-light px-4 inline-flex gap-2 items-center '> <BinIcon className="text-light text-xl"/>Remove</button>
        </div>
      </div>
    </div>
  )
}

export default SavedItemsCard
