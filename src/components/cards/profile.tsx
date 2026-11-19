import React from 'react'
import { ChartIcon } from '../svgs'

const ProfileCard = () => {
  return (
    <div className='bg-dashboard_table py-5 flex flex-col'>
      <div className='flex gap-5'> 
        <span> <ChartIcon /></span>
        <p>Your Profile</p>
      </div>
      <div className='py-5 flex border-b border-light'>
<div></div>
<div>
          <p>Jonathan Deeman</p>
          <p>Jonathan@gmail.com</p>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard
