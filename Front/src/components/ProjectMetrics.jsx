import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

import "../css/ProjectMetrics.css";

Chart.register(ArcElement, Tooltip, Legend);

const ProjectMetrics = ({ ...props }) => {
  const { tasks, sprints } = props;
  // Adjusted logic for completed/pending
  const completedTasks = tasks.filter(
    (task) => task.estado === "Completado"
  ).length;

  const pendingTasks = tasks.length - completedTasks;

  const taskPieData = {
    labels: ["Completadas", "Pendientes"],
    datasets: [
      {
        data: [completedTasks, pendingTasks],
        backgroundColor: ["#c1a5d4", "#eddff6"],
        hoverBackgroundColor: ["#9e72be", "#ecd7f8"],
      },
    ],
  };

  const completedSprints = sprints.filter(
    (sprint) => sprint.status === "Completado"
  ).length;

  const pendingSprints = sprints.length - completedSprints;

  const sprintPieData = {
    labels: ["Completados", "Pendientes"],
    datasets: [
      {
        data: [completedSprints, pendingSprints],
        backgroundColor: ["#c1a5d4", "#eddff6"],
        hoverBackgroundColor: ["#9e72be", "#ecd7f8"],
      },
    ],
  };

  const sprintProgress = (sprint) => {
    const sprintTasks = sprint.tasks.length;

    const completedTasks = sprint.tasks.filter((task) => {
      const status = task.estado?.trim().toLowerCase();
      return status === "completado" || status === "completed";
    }).length;

    return sprintTasks > 0
      ? ((completedTasks / sprintTasks) * 100).toFixed(2)
      : 0;
  };

  return (
    <div className="grid">
      <div className="grid-row">
        <div className="task-chart">
          <div className="pie-text">
            <h2>Progreso de tareas</h2>
            <p>
              Total de tareas: <strong>{tasks.length}</strong>
            </p>
            <p>
              Tareas completadas: <strong>{completedTasks}</strong>
            </p>
            <p>
              Tareas pendientes: <strong>{pendingTasks}</strong>
            </p>
            <p>
              Porcentaje de progreso:{" "}
              <strong>
                {((completedTasks / tasks.length) * 100).toFixed(2)}%
              </strong>
            </p>
          </div>
          <div style={{ maxWidth: 350, margin: "0 auto" }}>
            <Pie data={taskPieData} />
          </div>
        </div>
        <div className="task-chart">
          <div className="pie-text">
            <h2>Progreso de Sprints</h2>
            <p>
              Total de sprints: <strong>{sprints.length}</strong>
            </p>
            <p>
              Sprints completados: <strong>{completedSprints}</strong>
            </p>
            <p>
              Sprints pendientes: <strong>{pendingSprints}</strong>
            </p>
            <p>
              Porcentaje de progreso:{" "}
              <strong>
                {((completedSprints / sprints.length) * 100).toFixed(2)}%
              </strong>
            </p>
          </div>
          <div style={{ maxWidth: 350, margin: "0 auto" }}>
            <Pie data={sprintPieData} />
          </div>
        </div>
      </div>
      <div className="grid-row">
        <div className="sprints-area">
          <h2>Resumen de los sprints:</h2>
          <div className="sprint-summary">
            {sprints.map((sprint, index) => (
              <div key={index} className="sprint-info">
                <h3>Sprint {sprint.number}</h3>
                <p>
                  Estado: <strong>{sprint.status}</strong>
                </p>
                <p>
                  Duración:{" "}
                  <strong>
                    {sprint.startDate} - {sprint.endDate}
                  </strong>
                </p>
                <p>
                  Número de tareas totales:{" "}
                  <strong>{sprint.tasks.length}</strong>
                </p>
                {sprint.tasks.length != 0 && (
                  <>
                    <p>
                      Tareas en progreso:{" "}
                      <strong>
                        {
                          sprint.tasks.filter((task) => {
                            const status = task.estado?.trim().toLowerCase();
                            return (
                              status === "en progreso" ||
                              status === "in progress"
                            );
                          }).length
                        }
                      </strong>
                    </p>
                    <p>
                      Tareas completadas:{" "}
                      <strong>
                        {
                          sprint.tasks.filter((task) => {
                            const status = task.estado?.trim().toLowerCase();
                            return (
                              status === "completado" || status === "completed"
                            );
                          }).length
                        }
                      </strong>
                    </p>
                  </>
                )}
                <p>
                  Progreso: <strong>{sprintProgress(sprint)}%</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMetrics;
