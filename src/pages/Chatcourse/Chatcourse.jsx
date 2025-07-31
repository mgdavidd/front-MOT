import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatCourse.module.css'; // Asegúrate de tener este archivo

export default function ChatCourse() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newMessage = {
      user: 'Yo',
      content: trimmed,
      date: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.returnContainer}>
        <button className={styles.returnButton} onClick={() => window.history.back()}>
          ⬅
        </button>
      </div>

      <section className={styles.chatSection}>
        <div className={styles.header}>
          <div className={styles.info}>
            <h1>Chat del Curso</h1>
          </div>
          <small>ID: sin conexión</small>
        </div>

        <ul className={styles.messageList} ref={messagesRef}>
          {messages.map(({ content, user, date }, index) => (
            <li key={index} className={user === 'Yo' ? styles.myMessage : styles.otherMessage}>
              <small>{user}</small>
              <p>{content}</p>
              <p className={styles.date}>{new Date(date).toLocaleString()}</p>
            </li>
          ))}
        </ul>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            name="message"
            className={styles.input}
            placeholder="Escribe tu mensaje"
            autoComplete="off"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
          />
          <button type="submit" className={styles.sendButton}>
            Enviar
          </button>
        </form>
      </section>
    </div>
  );
}
