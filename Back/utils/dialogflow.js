import { db } from "../utils/firebase.js";

export class DialogflowService {
  static async getProjectDetails(projectName) {
    // Intento exacto
    let snapshot = await db
      .collection("proyectos")
      .where("nombreProyecto", "==", projectName)
      .limit(1)
      .get();

    // Intento inexacto
    if (snapshot.empty) {
      const allProjects = await db.collection("proyectos").get();

      const matchedDoc = allProjects.docs.find(
        (doc) =>
          doc.data().nombreProyecto.toLowerCase() === projectName.toLowerCase()
      );

      if (!matchedDoc) {
        throw new Error("Project not found");
      }

      return matchedDoc.data();
    }

    return snapshot.docs[0].data();
  }

  static async listActiveProjects() {
    const snapshot = await db
      .collection("proyectos")
      .where("estatus", "==", "Abierto")
      .get();
    return snapshot.docs.map((doc) => doc.data());
  }
}
