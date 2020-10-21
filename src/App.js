import React, { useState } from 'react'
import axios from 'axios'
import Plot from 'react-plotly.js'
import randomColor from 'randomcolor'

// Handles plotting the user data. Dataset and the truth value of its presence are given for the function.
const PlottedRepoData = (props) => {
  if (props.dataAvailable) {
    const creationDates = props.apiData.map(repo => repo.created_at)

    const ballSizes = props.apiData.map(repo => {
      const s = repo.size
      if (s < 100) {
        return 20
      } else if (s < 1000) {
        return 25
      } else if (s < 10000) {
        return 30
      } else {
        return 35
      }
    }
    )

    // Howering mouse over the plot shows repository name and size.
    const names = props.apiData.map(repo => repo.name + '<br>size: ' + repo.size)

    //We create as many values of y axis as there are repositories.
    const y = Array.from({ length: creationDates.length }, (v, k) => k + 1)
    const colorList = randomColor({ count: creationDates.length })

    var trace1 = {
      x: creationDates,
      y: y,
      text: names,
      mode: 'markers',
      marker: {
        color: colorList,
        size: ballSizes
      }
    }

    var data = [trace1]

    return (
      <div>
        <Plot
          data={data}
          layout={{
            autosize: true,
            title: 'User GitHub activity',
            yaxis: {
              title: 'repositories',
              ticks: '',
              showticklabels: false
            },
            xaxis: {
              title: 'Creation dates'
            }
          }}
          useResizeHandler={true}
          style={{
            width: "100%",
            height: "100%"
          }}
        />
        <p>Creation dates:</p>
        {creationDates.map(day => <li key={day}>{day}</li>)}
      </div>
    )
  } else {
    return (
      <div>
      </div>
    )
  }

}

const App = () => {

  const [gitUser, setGitUser] = useState('')
  const [apiData, setApiData] = useState([])
  const [dataAvailable, setDataAvailable] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')



  const baseUrl = `https://api.github.com/users/`

  // Function takes care of pulling data from GitHub API. Needs to be refactored asap...
  async function getOne(name) {
    try {
      const response = await axios.get(baseUrl + name + '/repos')
      const sortedData = response.data.sort((a, b) => parseFloat(a.created_at) - parseFloat(b.created_at))
      setApiData(sortedData)
      setDataAvailable(true)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage('Error occured. Is the username correct?')
      console.error(error)
      setDataAvailable(false)
    }
  }

  // Activates the getOne function when "search activity" button is pressed.
  const searchUser = (event) => {
    event.preventDefault()
    getOne(gitUser)
  }

  // Updates the gitUser variable when text is typed to the search field.
  const handleUserChange = (event) => {
    setGitUser(event.target.value)
  }

  return (
    <div >
      <h2>Activity view for GitHub</h2>
      <p>Start by searching with a GitHub username </p>     
       <form onSubmit={searchUser}>
        <input value={gitUser} onChange={handleUserChange} />
        <button type="submit">Search activity!</button>
      </form>
      {errorMessage}

      <PlottedRepoData apiData={apiData} dataAvailable={dataAvailable}/>

    </div>
  )
}

export default App
