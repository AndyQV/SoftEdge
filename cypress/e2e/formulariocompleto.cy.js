describe('TC - Verificación del formulario de creación de proyectos', () => {
    beforeEach(() => {
        cy.visit('https://soft-edge-two.vercel.app/')
        cy.get('[data-cy="email"], input[type="email"], input[name="email"]')
            .type('admin@tec.mx')
        cy.get('[data-cy="password"], input[type="password"], input[name="password"]')
            .type('admining')
        cy.get('[data-cy="login-btn"], button[type="submit"], button:contains("Login"), button:contains("Iniciar")')
            .click()
        

        cy.url().should('not.include', '/login')

        cy.get('body').then($body => {
            if ($body.text().includes('contraseña incorrecta') || $body.text().includes('usuario')) {
                cy.log('¡Login fallido! Cambia las credenciales.');
            }
        });
    })

    it('Debe mostrar el formulario de creación de proyectos con todos los campos requeridos', () => {

        cy.contains('NUEVO').parent().click()


        cy.url().should('include', '/generate')

       
        cy.get('form').should('exist')
        
     
        cy.get('textarea[placeholder*="Describe tu proyecto aquí"]')
            .should('exist')
            .and('be.visible')

        cy.contains('button', 'Generar')
            .should('exist')
            .and('be.visible')
    })
})
