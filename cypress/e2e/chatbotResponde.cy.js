describe('TC19 - Interfaz de chatbot', () => {
  it('Validar que el chatbot responde a preguntas simples', () => {
    // Iniciar sesión primero
    cy.visit('https://soft-edge-two.vercel.app/')
    
    cy.get('[data-cy="email"], input[type="email"], input[name="email"]')
      .type('a00837024@tec.mx')
    
    cy.get('[data-cy="password"], input[type="password"], input[name="password"]')
      .type('Rodrigo')
    
    cy.get('[data-cy="login-btn"], button[type="submit"], button:contains("Login"), button:contains("Iniciar")').click()
    
    // Verificar que se carga la página de home
    cy.url().should('include', '/home')
    
    // Navegar al chatbot
    cy.get('.avatar-ia-image').click()
    
    // Hacer clic en el botón de chat
    cy.get('.ia-popup-buttons > :nth-child(2)').click()
    
    // 1. Ingresar una pregunta simple
    cy.get('[data-cy="chat-input"], input[placeholder*="mensaje"], input[placeholder*="pregunta"], textarea')
      .type('Hola')
    
    // 2. Enviar el mensaje
    cy.get('.chat-send-button').click()
  })
})
