describe('Registro de usuario - Alta', () => {
  it('Debe permitir que un usuario nuevo se registre y haga login automático', () => {
    // 1. Ir a la pantalla de registro
    cy.visit('https://soft-edge-two.vercel.app/registro'); // Ajusta la ruta si es diferente

    // 2. Llenar todos los campos con datos válidos
    cy.get('input[placeholder="Nombre"]').type('Samuel');
    cy.get('input[placeholder="Apellido"]').type('Pérez');
    cy.get('input[placeholder="Correo Electrónico"]').type(`samuel${Date.now()}@test.com`);
    cy.get('input[placeholder="Número de Teléfono"]').type('5551234567');
    cy.get('input[placeholder="Contraseña"]').type('Password123!');
    cy.get('input[placeholder="Confirma tu Contraseña"]').type('Password123!');
    // ...agrega otros campos requeridos si existen...

    // 3. Hacer click en aceptar
    cy.get('button[type="submit"].main-button').click();

    // El sistema crea la cuenta, muestra msj de exito y hace login automatico
    cy.contains('¡Registro exitoso! Redirigiendo al inicio de sesión...').should('be.visible'); // Ajusta el texto según el mensaje real
  });
});
