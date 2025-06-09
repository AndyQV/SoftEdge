describe("template spec", () => {
  let credentials;

  before(() => {
    // Cargar credenciales
    cy.fixture("credentials").then((data) => {
      credentials = data;
    });
  });

  it("Iniciando sesión", () => {
    cy.visit("https://soft-edge-two.vercel.app");
    cy.get('[placeholder="Correo Electrónico"]').type(credentials.username);
    cy.get('[placeholder="Contraseña"]').type(credentials.password);
    cy.get(".main-button").click();
    cy.get(".profile-avatar").click();
    cy.get(".profile-popup > :nth-child(1)").click();
    cy.get(".change-password-button").click();
    cy.get(".password-popup-container > :nth-child(2) > input")
      .clear()
      .type(credentials.password);
    cy.get(":nth-child(3) > input").clear().type(credentials.newPassword);
    cy.get(":nth-child(4) > input").clear().type(credentials.newPassword);
    cy.get(".save-button").click();
    cy.get(".error-popup-message").contains(
      "La nueva contraseña debe ser diferente a la contraseña actual"
    ); // Checar el mensaje
  });
});
//
