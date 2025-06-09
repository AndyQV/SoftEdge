describe('Registro de usuario - Validación de campos vacíos', () => {
  it('Debe mostrar mensaje de error si algún campo está vacío', () => {
    cy.visit('https://soft-edge-two.vercel.app/registro');

    // Llenar todos los campos excepto el apellido
    cy.get('input[placeholder="Nombre"]').type('Samuel');
    // cy.get('input[placeholder="Apellido"]').no type (dejar vacío)
    cy.get('input[placeholder="Correo Electrónico"]').type(`samuel${Date.now()}@test.com`);
    cy.get('input[placeholder="Número de Teléfono"]').type('5551234567');
    cy.get('input[placeholder="Contraseña"]').type('Password123!');
    cy.get('input[placeholder="Confirma tu Contraseña"]').type('Password123!');

    // Hacer click en aceptar
    cy.get('button[type="submit"].main-button').click();

    // Verificar mensaje de error
    cy.contains('Favor de llenar todos los campos').should('be.visible');
  });
});
