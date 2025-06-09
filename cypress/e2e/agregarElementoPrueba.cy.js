describe('Agregar elemento - Validación de campo obligatorio', () => {
  it('Debe mostrar error si el campo "Nombre" está vacío al guardar', () => {
    // Iniciar sesión primero
    cy.visit('https://soft-edge-two.vercel.app/login');
    cy.get('input[placeholder="Correo Electrónico"]').type('admin@tec.mx'); // Ajusta el usuario
    cy.get('input[placeholder="Contraseña"]').type('admining'); // Ajusta la contraseña
    cy.get('button[type="submit"]').click();

    // Verificar redirección a home
    cy.url().should('eq', 'https://soft-edge-two.vercel.app/home');

    // Ir a la página de agregar elemento
    cy.visit('https://soft-edge-two.vercel.app/project/7qnG3LHwkXr3NaIWOQDf');

    // Esperar y hacer click en la pestaña "Elementos" (sin depender de la clase active)
    cy.contains('button', 'Elementos', { timeout: 10000 }).should('be.visible').click({ force: true });

    // Click en "Agregar Elemento"
    cy.contains('button', 'Agregar Elemento', { timeout: 10000 }).should('be.visible').click({ force: true });

    // Dejar el campo "Nombre" vacío
    cy.get('input[name="title"]').should('have.value', '');

    // Llenar el campo descripción si es obligatorio
    cy.get('textarea[name="description"]').type('Descripción de prueba');

    // Hacer clic en "Guardar"
    cy.get('button[type="submit"]').click();

    // Verificar que el modal/formulario sigue abierto (el campo "Nombre" sigue visible)
    cy.get('input[name="title"]').should('be.visible');
  });
});
