import { useState } from 'react'
import './App.css'
import '/public/css/main.css'


import Header from './components/header.jsx'
import Auth from './components/auth.jsx'
import Journal from './components/journal.jsx'
import { addGoal, loadGoals, addMilestone, renderMilestone, updateGoalProgress, displayAISteps, loadCardBack } from './js/milestones.js'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
      <Header />
      <Auth />
      <div id="app-content" style={{display:"none"}}>
        <main>
          {/* <!-- Goal Creation --> */}
      <section id="goal-creator">
        <h2>Write a New Goal</h2>
        <div className="note-pad">
          <textarea id="goal-input" placeholder="Write your sticky goal here..."></textarea>
        </div>
        <button onclick={addGoal}>📌 Pin Goal</button>
      </section>

      {/* <!-- Goal Display --> */}
      <section id="goal-board">
        <h2>Pinned Goals</h2>
        <div id="sticky-board"></div>
      </section>

      {/* <!-- AI Suggestions --> */}
      <section id="suggestions">
        <h2>AI Suggested Steps</h2>
        <div id="suggested-goals"></div>
      </section>
        </main>
      </div>
      
      <Journal/>
    </div>
  )
}

export default App
