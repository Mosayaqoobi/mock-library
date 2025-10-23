import React from 'react'

const Home = ( {user, error} ) => {
  return (
    <div>{user.username}</div>
  )
}

export default Home