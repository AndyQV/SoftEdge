describe('Registro de usuario - Contraseñas no coinciden', () => {
  it('Debe mostrar error si las contraseñas no coinciden y no permitir registro', () => {
    cy.visit('https://soft-edge-two.vercel.app/registro');

    cy.get('input[placeholder="Nombre"]').type('Samuel');
    cy.get('input[placeholder="Apellido"]').type('Pérez');
    cy.get('input[placeholder="Correo Electrónico"]').type(`samuel${Date.now()}@test.com`);
    cy.get('input[placeholder="Número de Teléfono"]').type('5551234567');
    cy.get('input[placeholder="Contraseña"]').type('Password123!');
    cy.get('input[placeholder="Confirma tu Contraseña"]').type('Password456!'); // Contraseña diferente

    cy.get('button[type="submit"].main-button').click();

    cy.contains('Las contraseñas no coinciden').should('be.visible');
    cy.url().should('include', '/registro'); // Debe permanecer en la página de registro
  });
});
