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
    cy.get(".edit-info-button").click();
    cy.get(":nth-child(1) > input").clear().type("Adminer");
    cy.get(".perfil-info > :nth-child(2) > input").clear().type("Tec3");
    cy.get(":nth-child(4) > input").clear().type("8123928827");
    cy.get(".save-button").click();
    cy.get(".success-popup-continue"); // Si sale el popup, se hizo correctamente
  });
});
//
