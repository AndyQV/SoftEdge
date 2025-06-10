describe('Agregar tarea a historia de usuario', () => {
  it('Debe permitir agregar una nueva tarea a una historia de usuario', () => {
    // 1. Iniciar sesión
    cy.visit('https://soft-edge-two.vercel.app/login');
    cy.get('input[placeholder="Correo Electrónico"]').type('admin@tec.mx');
    cy.get('input[placeholder="Contraseña"]').type('admining');
    cy.get('button[type="submit"]').click();

    // Espera a que la URL incluya '/home' (más flexible y con timeout mayor)
    cy.url({ timeout: 10000 }).should('include', '/home');

    // 3. Ir a la página del proyecto
    cy.visit('https://soft-edge-two.vercel.app/project/7qnG3LHwkXr3NaIWOQDf');

    // 4. Click en la pestaña "Elementos"
    cy.contains('button', 'Elementos', { timeout: 10000 }).should('be.visible').click({ force: true });

    // 5. Click en el tab "HU - Historias de usuario"
    cy.contains('button,span', 'HU - Historias de usuario', { timeout: 10000 }).should('be.visible').click({ force: true });

    // 6. Click en la primera historia de usuario de la tabla
    cy.get('table tbody tr').first().click();

    // 7. Click en "Nueva Tarea" en el modal
    cy.contains('button', 'Nueva Tarea', { timeout: 10000 }).should('be.visible').click({ force: true });

    // 8. Llenar los campos del formulario
    cy.get('input[placeholder="Título de la tarea"]').type('Tarea de prueba');
    cy.get('textarea[placeholder="Descripción de la tarea"]').type('Descripción de la tarea de prueba');
    cy.get('select').eq(0).select('Alta'); // Prioridad
    cy.get('select').eq(1).select('admin@tec.mx'); // Asignar a

    // Seleccionar Sprint (elige el primer valor distinto de N/A)
    cy.get('select').eq(2).find('option').then(options => {
      const validOption = [...options].find(opt => opt.value && opt.value !== 'N/A');
      if (validOption) {
        cy.get('select').eq(2).select(validOption.value);
      }
    });

    // 9. Click en "Crear Tarea"
    cy.contains('button', 'Crear Tarea').click();

    // 10. Verificar que la tarea se agregó correctamente
    cy.contains('td', 'Tarea de prueba').should('be.visible');
  });
}); 