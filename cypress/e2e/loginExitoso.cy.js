describe('TC03 - Login exitoso', () => {
  it('Permitir login exitoso con credenciales correctas', () => {
    // 1. Visitar la URL de login
    cy.visit('https://soft-edge-two.vercel.app/')
    
    // 2. Ingresar correo y contraseña válidos
    cy.get('[data-cy="email"], input[type="email"], input[name="email"]')
      .type('a00837024@tec.mx')
    
    cy.get('[data-cy="password"], input[type="password"], input[name="password"]')
      .type('Rodrigo')
    
    // 3. Hacer clic en el botón de login
    cy.get('[data-cy="login-btn"], button[type="submit"], button:contains("Login"), button:contains("Iniciar")').click()
    
    // Verificar que se carga la página de /home
    cy.url().should('include', '/home')
  })
})
