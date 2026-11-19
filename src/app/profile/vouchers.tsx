import { Button } from '@/components/button/button'
import { VoucherIcon } from '@/components/svgs'
import React from 'react'

const VoucherPage = () => {
  return (
    <div className="w-full bg-light ">
      <div className="flex-col flex">
        <div className='py-5 w-full border-y-[#CCCCCC4D] border-y'>
        <h1 className="px-5 md:pl-10 text-2xl">Voucher</h1>
        </div>
        <div className='w-full gap-6 flex flex-col pt-10 items-center min-h-[500px]'>
          <div className='rounded-full bg-light-grey p-10 flex items-center justify-center'>
 <VoucherIcon className="text-9xl "/>
          </div>
          <p className='text-xl font-bold'>You currently have no voucher</p>
<Button variant={"default"} size={"card"} href="/shop">
            GO BACK TO SHOPPING
          </Button>
        </div>
    </div>
    </div>
  )
}

export default VoucherPage; 
