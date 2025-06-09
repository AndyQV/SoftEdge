describe('TC23 - Crear nuevo sprint', () => {
    it('Debe crear un nuevo sprint y mostrarlo en la lista', () => {
        cy.visit('https://soft-edge-two.vercel.app/')
        cy.get('[data-cy="email"], input[type="email"], input[name="email"]')
      .type('admin@tec.mx')
        cy.get('[data-cy="password"], input[type="password"], input[name="password"]')
      .type('admining')
        cy.get('[data-cy="login-btn"], button[type="submit"], button:contains("Login"), button:contains("Iniciar")').click()
        cy.get('.projects-grid > :nth-child(2)').click();
        cy.get('.dashboard-tabs > :nth-child(3)').click();
        cy.get('.add-sprint-card').click();
    
    });
  });