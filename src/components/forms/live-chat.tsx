import React from 'react'
import { EmojiIcon, LinkIcon, SendIcon } from '../svgs'

const LiveChatForm = () => {
  return (
    <form className=' w-full px-5 flex gap-2 items-center justify-between border border-ash py-1'>
      <div className=''>
        <span> <EmojiIcon className="text-2xl text-ash"/></span>
      </div>
<input className='w-3/4 py-2 px-2 flex-1 outline-none focus:outline-none text-lg' placeholder='Type here...' />
      <div>
        <span> <LinkIcon className="text-2xl text-ash"/></span>
      </div>
        <span className='bg-black p-2 rounded-full'> <SendIcon className="text-xl text-light"/></span>
    </form>
  )
}

export default LiveChatForm
