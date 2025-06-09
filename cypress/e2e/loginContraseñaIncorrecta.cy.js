describe('TC02 - Login con contraseña incorrecta', () => {
  it('Mostrar mensaje de error si la contraseña es incorrecta', () => {
    // 1. Visitar la URL de login
    cy.visit('https://soft-edge-two.vercel.app/')
    
    // 2. Ingresar correo válido
    cy.get('[data-cy="email"], input[type="email"], input[name="email"]')
      .type('a00837024@tec.mx')
    
    // 3. Ingresar contraseña incorrecta
    cy.get('[data-cy="password"], input[type="password"], input[name="password"]')
      .type('contraseñaIncorrecta123')
    
    // 4. Hacer clic en el botón de login
    cy.get('[data-cy="login-btn"], button[type="submit"], button:contains("Login"), button:contains("Iniciar")').click()
    
    // Verificar que se muestra el mensaje de error
    cy.contains('Usuario o contraseña inválidos').should('be.visible')
  })
})
