describe('TC - Edición de proyecto generado con IA', () => {
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

    it('Debe crear, editar y guardar un proyecto', () => {
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
        cy.contains('¡Éxito!', { timeout: 20000 }).should('be.visible')
        cy.contains('Proyecto generado exitosamente', { timeout: 20000 }).should('be.visible')
        cy.contains('Continuar', { timeout: 20000 }).should('be.visible').click()
        cy.url({ timeout: 10000 }).should('include', '/revisionIA')

        cy.contains('button', 'Confirmar').should('be.visible').click()

        cy.url({ timeout: 10000 }).should('include', '/project/')

        cy.contains('button', 'Editar Proyecto').should('be.visible').click()

        cy.get('textarea').clear().type('Proyecto editado por Cypress')

        cy.contains('button', 'Guardar').should('be.visible').click()

        cy.contains('Proyecto editado por Cypress', { timeout: 10000 }).should('exist')
    })
}) 