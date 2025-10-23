import React from 'react'

const Home = ( { user } ) => {
  return (
    <div>{user.username}</div>
  )
}

export default Home