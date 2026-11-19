import React from 'react'

const Orders = () => {
  return (
    <div className='w-full bg-dashboard_table px-10 flex gap-5 flex-col py-5'>
<div className='flex justify-between'>
        <p className='text-light text-xl font-bold'>Orders Overview</p>
        <button className='text-light bg-dashboard_table border border-light rounded-xl py-1 px-2'>View all</button>
      </div>
<table className='flex flex-col border border-light rounded-xl overflow-hidden'>
        <thead>
<tr className='justify-between flex py-5 px-5 border-light border-b'>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Date</p></td>
          <td><p className='text-light font-bold'>Time</p></td>
          <td><p className='text-light font-bold'>Item</p></td>
          <td><p className='text-light font-bold'>Cost</p></td>
          <td><p className='text-light font-bold'>Remark</p></td>
        </tr>
        </thead>
<tbody>

<tr className='justify-between flex py-5 px-5 border-light bg-dashboard_table_sec border-b'>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
        </tr>
<tr className='justify-between flex py-5 px-5 border-light border-b'>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
        </tr>

<tr className='justify-between flex py-5 px-5 border-light bg-dashboard_table_sec'>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
          <td><p className='text-light font-bold'>Name</p></td>
        </tr>
        </tbody>
      </table>
      </div>
  )
}

export default Orders
