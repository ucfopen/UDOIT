import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Message from './Message'

import './MessageTray.css'

export default function MessageTray ({
  t,
  settings,
  nextMessage
}) {

  const [messages, setMessages] = useState([])
  const [messageTimers, setMessageTimers] = useState([])
  const [timerCounter, setTimerCounter] = useState(1)
  const positions = useRef(new Map())
  const containerRef = useRef(null)

  const createMessage = (newMessage) => {
    if(!newMessage.message) {
      return
    }
    const id = Date.now() + Math.random().toString().slice(2)
    newMessage.id = id
    setMessages(previousMessages => [...previousMessages, newMessage])
  }

  const removeMessage = (id) => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const el = container.querySelector(`[data-id="${id}"]`)
    if(el) {
      el.style.transform = "translateX(calc(100% + 30px))"
      el.style.transition = "transform 0.5s cubic-bezier(0.68, -0.55, 0.25, 1.35)"
    }
    setTimeout(() => {
      setMessages(existingMessages => existingMessages.filter(message => message.id !== id))
    }, 500)
  }

  /**
   * The messages in the message tray usually have a time-out based on user settings. However, if a user
   * moves the mouse over a message, the timer pauses and resets. HOWEVER, the setTimeout function will
   * continue to run unless a clearInterval function with the timeout id is called.
   * 
   * I tried that first, mapping each message to the timer id, but when the timer DIDN'T get paused, I
   * had an issue with React maintaining an internal state from when the timer was set, and wasn't able
   * to save the timer id and have it still exist when the function the timer itself was calling got run.
   * 
   * The easiest workaround was to just create a counter (timerCounter) that increments every time a new
   * timer is created. If a user mouses over and off a message multiple times, any number of timeouts may
   * be created, but the messageTimers object will remember the most recent timer that was set for each
   * message. All timeouts run to completion, but the message is only removed when the timer that finished
   * matches the most recent timer that was set for a given message.
   */
  const resumeTimer = (messageId) => {
    let tempTimerMs = settings?.user?.roles?.alert_timeout || "5000"
    if (tempTimerMs === 'none') {
      setMessageTimers(Object.assign({}, messageTimers, {[messageId]: null}) )
      return
    }

    let tempMessageTimers = messageTimers
    tempMessageTimers[messageId] = timerCounter
    setMessageTimers(tempMessageTimers)
    setTimeout(() => {
      attemptClose(messageId, timerCounter)
    }, tempTimerMs)
    setTimerCounter(timerCounter + 1)
  }

  const pauseTimer = (messageId) => {
    if(messageTimers[messageId] !== null) {
      clearTimeout(messageTimers[messageId])
    }
    let tempMessageTimers = messageTimers
    tempMessageTimers[messageId] = null
    setMessageTimers(tempMessageTimers)
  }

  const attemptClose = (messageId, timerId) => {
    if(messageTimers[messageId] !== timerId) {
      return
    }
    removeMessage(messageId)
  }

  useEffect(() => {
    createMessage(nextMessage)
  }, [nextMessage])

  // useLayoutEffect is for when you want to ensure the effect is processed BEFORE drawing to the screen.
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    // In order to animate the list growing and shrinking as messages are added and removed, we'll be
    // using the "FLIP" technique as explained here:
    // https://medium.com/partoo/a-powerful-technique-for-making-animations-in-react-e91bbda5efd7

    // FIRST: Get the starting ("first") positions of all relevant elements.
    // If any animations have played before, this will already be stored in the `positions` state.

    // LAST: Get the ending ("last") positions of all relevant elements.
    const newPositions = new Map()
    container.querySelectorAll("[data-id]").forEach(messageElement => {
      newPositions.set(messageElement.dataset.id, messageElement.getBoundingClientRect())
    })

    // INVERT: Force the elements to stick to their old ("first") positions by inverting the change
    // between the first and last positions.
    newPositions.forEach((newBoundingRect, id) => {
      const oldRect = positions.current.get(id)
      if (!oldRect) return

      const dy = oldRect.top - newBoundingRect.top

      if (dy !== 0) {
        const el = container.querySelector(`[data-id="${id}"]`)
        el.style.transform = `translateX(0px) translateY(${dy}px)`
        el.style.transition = "transform 0s"
      }
    })

    // PLAY: Animate from the forced old position to the new position by removing the inversion.
    requestAnimationFrame(() => {
      newPositions.forEach((_, id) => {
        const el = container.querySelector(`[data-id="${id}"]`)
        if (!el) return

        el.style.transition = "transform 300ms ease-in-out"
        el.style.transform = ""
      })
    })

    // Save new positions for next cycle
    positions.current = newPositions

  }, [messages])

  return (
    <div
      className='messageTrayContainer flex-column'
      ref={containerRef} >
        {messages.map((msg, i) => (
          <Message
            key={msg.id}
            t={t}
            settings={settings}
            messageObject={msg}
            pauseTimer={pauseTimer}
            resumeTimer={resumeTimer}
            removeMessage={removeMessage}
          />
        ))}
    </div>
  )
}