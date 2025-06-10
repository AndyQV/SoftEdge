describe('TC - Creación exitosa de proyecto con IA', () => {
    beforeEach(() => {
        cy.visit('https://soft-edge-two.vercel.app/')
        cy.get('[data-cy="email"], input[type="email"], input[name="email"]')
            .type('admin@tec.mx')
        cy.get('[data-cy="password"], input[type="password"], input[name="password"]')
            .type('admining')
        cy.get('[data-cy="login-btn"], button[type="submit"], button:contains("Login"), button:contains("Iniciar")')
            .click()
        cy.url().should('not.include', '/login')
    })

    it('Debe crear un proyecto exitosamente y redirigir a la página de revisión', () => {
        cy.contains('NUEVO').parent().click()
        cy.url().should('include', '/generate')

        cy.get('textarea[placeholder*="Describe tu proyecto aquí"]')
            .should('exist')
            .and('be.visible')
            .type('Hazme un proyecto default')

        cy.contains('button', 'Generar')
            .should('exist')
            .and('be.visible')
            .click()

        cy.url({ timeout: 30000 }).should('include', '/revisionIA')

        cy.contains('Hazme un proyecto default', { timeout: 10000 })
            .should('exist')
    })
}) 