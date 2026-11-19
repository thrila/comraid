import ChatBubble from '@/components/chat'
import LiveChatForm from '@/components/forms/live-chat'
import React from 'react'

const LiveChatPage = () => {
  return (
    <div className="w-full bg-light ">
      <div className="flex-col flex">
        <div className='py-5 w-full border-y-[#CCCCCC4D] border-y'>
        <h1 className="px-5 md:pl-10 text-2xl">Live Chat</h1>
        </div>
        <div className='w-full gap-2 py-5 flex flex-col px-5 min-h-[500px] justify-between'>
         <ChatBubble /> 
          <LiveChatForm />
        </div>
    </div>
    </div>
  )
}

export default LiveChatPage
