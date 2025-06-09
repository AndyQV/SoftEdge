describe('TC01 - Login con campo vacío', () => {
  it('Validar que no se permite login si un campo está vacío', () => {
    // 1. Visitar la URL de login
    cy.visit('https://soft-edge-two.vercel.app/')
    
    // 2. Ingresar solo el correo (dejando password vacío)
    cy.get('[data-cy="email"], input[type="email"], input[name="email"]')
      .type('usuario@ejemplo.com')
    
    // 3. Hacer clic en el botón de login
    cy.get('[data-cy="login-btn"], button[type="submit"], button:contains("Login"), button:contains("Iniciar")').click()
    
    // Verificar que se muestra el mensaje de error
    cy.contains('Favor de llenar todos los campos.').should('be.visible')
  })
})
