/**
 * Bad Component with Intentional Issues
 * This component demonstrates problematic code patterns that ALICE will detect
 */

import React, { useState, useEffect } from 'react'

// Hardcoded API key (CRITICAL)
const API_KEY = 'sk-1234567890abcdefghijklmnopqrstuvwxyz'

function BadComponent() {
  const [data, setData] = useState([])
  const [count, setCount] = useState(0)
  const [htmlContent, setHtmlContent] = useState('<div>Initial content</div>')

  // CRITICAL: Infinite loop - useEffect without dependency array that updates state
  useEffect(() => {
    setCount(count + 1)
  })

  // HIGH: Missing error handling in async operation
  const fetchData = async () => {
    const response = await fetch('https://api.example.com/data', {
      headers: {
        'Authorization': `Bearer ${API_KEY}` // Using hardcoded key
      }
    })
    const json = await response.json()
    setData(json)
  }

  // MEDIUM: Expensive operation in render without memoization
  const sortedData = data.sort((a, b) => {
    // Complex sorting logic that runs on every render
    for (let i = 0; i < 1000; i++) {
      // Unnecessary computation
      Math.random()
    }
    return a.value - b.value
  })

  const filteredData = sortedData.filter(item => {
    // Another expensive operation in render
    return item.active === true
  })

  return (
    <div>
      {/* MEDIUM: Missing accessibility - button without aria-label */}
      <button onClick={fetchData}>
        <svg>...</svg>
      </button>

      {/* CRITICAL: XSS vulnerability - dangerouslySetInnerHTML without sanitization */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

      {/* MEDIUM: Missing alt text on image */}
      <img src="logo.png" />

      {/* MEDIUM: Missing key prop in mapped list */}
      {filteredData.map(item => (
        <div>{item.name}</div>
      ))}

      {/* This is a very long component with high complexity */}
      {/* Over 300 lines of code would go here */}
      {/* Multiple nested conditions and loops */}
      {data.length > 0 && (
        <div>
          {data.map((item, index) => {
            if (item.type === 'A') {
              if (item.status === 'active') {
                if (item.priority > 5) {
                  return <div>{item.name}</div>
                } else if (item.priority > 3) {
                  return <div>{item.name} - Medium</div>
                } else {
                  return <div>{item.name} - Low</div>
                }
              } else {
                return <div>{item.name} - Inactive</div>
              }
            } else if (item.type === 'B') {
              // More nested logic...
              if (item.category === 'premium') {
                return <div className="premium">{item.name}</div>
              } else {
                return <div>{item.name}</div>
              }
            } else {
              return null
            }
          })}
        </div>
      )}

      {/* Spelling error in comment: This is a seperate section for recieving data */}
      <div className="data-section">
        <p>Count: {count}</p>
      </div>
    </div>
  )
}

export default BadComponent
