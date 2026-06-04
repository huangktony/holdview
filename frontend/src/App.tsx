import { useState, useEffect } from 'react'

function App(){
  const[message, updateMessage] = useState("")

  useEffect(() => {
    fetch('http://localhost:8000/')
    .then(response => response.json())
    .then(data => updateMessage(data.message))
  }, [])

  return(
    <div>
      {message}
    </div>
  )

}

export default App