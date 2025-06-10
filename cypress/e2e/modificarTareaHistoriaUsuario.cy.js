describe('Modificar tarea de historia de usuario', () => {
  it('Debe permitir modificar la descripción y estado de una tarea', () => {
    // 1. Iniciar sesión y acceder al dashboard del proyecto
    cy.visit('https://soft-edge-two.vercel.app/login');
    cy.get('input[placeholder="Correo Electrónico"]').type('admin@tec.mx');
    cy.get('input[placeholder="Contraseña"]').type('admining');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/home');
    cy.visit('https://soft-edge-two.vercel.app/project/7qnG3LHwkXr3NaIWOQDf');

    // 2. Click en la pestaña "Elementos"
    cy.contains('button', 'Elementos', { timeout: 10000 }).should('be.visible').click({ force: true });
    // 3. Click en el tab "HU - Historias de usuario"
    cy.contains('button,span', 'HU - Historias de usuario', { timeout: 10000 }).should('be.visible').click({ force: true });
    // 4. Click en la primera historia de usuario de la tabla
    cy.get('table tbody tr').first().click();

    // 5. Click en "Editar Tareas" en el modal
    cy.contains('button', 'Editar Tareas', { timeout: 10000 }).should('be.visible').click({ force: true });

    // Espera a que el modal de tareas esté visible
    cy.contains('Tareas relacionadas:').should('be.visible');

    // Edita la descripción de la primera tarea
    cy.get('textarea').first().should('be.visible').clear().type('Descripción modificada por Cypress');

    // Cambia la prioridad de la primera tarea
    cy.get('select').first().select('Alta');

    // 7. Guardar los cambios
    cy.contains('button', 'Guardar Tareas').click();

    // 8. Verificar que los cambios se guardaron correctamente
    cy.contains('Descripción modificada por Cypress').should('be.visible');
  });
}); 