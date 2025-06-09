import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import ErrorPopup from "../components/ErrorPopup";
import SuccessPopup from "../components/SuccessPopup";
import TopAppBar from "../components/TopAppBar";
import EditMemberPopup from "../components/EditMemeberPopup";
import RenderRequirementsTab from "../components/RenderRequirementsTab";
import TeamEditPopup from "../components/TeamEditPopup";
import ModificationHistory from "../components/ModificationHistory";
import SprintDetails from "../components/SprintDetails";
import TaskReassignmentPopup from "../components/TaskReassignmentPopup";
import InsertElement from "../components/InsertElement";
import "../css/Dashboard.css";
import ProjectMetrics from "../components/ProjectMetrics";
import "../css/Spinner.css";

const Dashboard = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const role = localStorage.getItem("role");
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { userId } = useContext(UserContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeRequirement, setActiveRequirement] = useState("EP");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showTeamPopup, setShowTeamPopup] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

  const [sprintDuration, setSprintDuration] = useState(2);
  const [deletingSprint, setDeletingSprint] = useState(false);
  const [showInsertElementPopup, setShowInsertElementPopup] = useState(false);
  

  // Función para generar sprints dinámicamente
  const generateSprints = (
    sprintNumber,
    projectTasks = [],
    duration = 2,
    projectCreatedAt = null
  ) => {
    const sprints = [];
    const durationDays = duration * 7; // Convert weeks to days

    for (let i = 1; i <= sprintNumber; i++) {
      // Crear fecha en UTC para evitar problemas de zona horaria
      const startDate = new Date(projectCreatedAt || new Date());
      // Usar métodos UTC para todos los cálculos de fechas
      startDate.setUTCDate(startDate.getUTCDate() + (i - 1) * durationDays);
      const endDate = new Date(startDate);
      endDate.setUTCDate(endDate.getUTCDate() + durationDays - 1);

      // Determinar status del sprint
      let status;
      if (i === 1) {
        status = "En progreso";
      } else if (i === 2 && sprintNumber > 1) {
        status = "Planificado";
      } else {
        status = "Pendiente";
      }

      // Filtrar tareas para este sprint específico
      const sprintTasks = projectTasks
        .filter((task) => parseInt(task.sprint, 10) === i)
        .map((task) => ({
          title: task.titulo || task.title,
          description: task.descripcion || task.description,
          estado: task.estado || "Pendiente",
          priority: task.prioridad || task.priority,
          assignee: task.asignado || task.assignee,
        }));

      sprints.push({
        number: i,
        status: status,
        // Usar toISOString().split("T")[0] para mantener formato UTC
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        tasks: sprintTasks,
      });
    }
    return sprints;
  };

  // Sprint backlog states
  const [sprints, setSprints] = useState([
    {
      number: 1,
      status: "En progreso",
      startDate: "2024-04-01",
      endDate: "2024-04-14",
      tasks: [
        {
          title: "Implementar autenticación",
          description: "Crear sistema de login y registro",
          status: "En progreso",
        },
        {
          title: "Diseñar interfaz de usuario",
          description: "Crear wireframes y mockups",
          status: "Completado",
        },
      ],
    },
    {
      number: 2,
      status: "Planificado",
      startDate: "2024-04-15",
      endDate: "2024-04-28",
      tasks: [
        {
          title: "Desarrollar API",
          description: "Implementar endpoints principales",
          status: "Pendiente",
        },
        {
          title: "Configurar base de datos",
          description: "Crear esquema y migraciones",
          status: "Pendiente",
        },
      ],
    },
    {
      number: 3,
      status: "Pendiente",
      startDate: "2024-04-29",
      endDate: "2024-05-12",
      tasks: [
        {
          title: "Pruebas de integración",
          description: "Realizar pruebas de sistema completo",
          status: "Pendiente",
        },
      ],
    },
  ]);
  const [tasks, setTasks] = useState([]);

  const [selectedSprint, setSelectedSprint] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    nombreProyecto: "",
    descripcion: "",
  });
  const [requirementEditData, setRequirementEditData] = useState({
    title: "",
    description: "",
  });
  const [showMemberMenu, setShowMemberMenu] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [memberAction, setMemberAction] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    priority: "",
    assignee: "",
  });
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [taskToSelect, setTaskToSelect] = useState(null);
  const [showProjectDeleteConfirmation, setShowProjectDeleteConfirmation] =
    useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showDeleteSprintConfirmation, setShowDeleteSprintConfirmation] =
    useState(false);
  const [showTaskReassignmentPopup, setShowTaskReassignmentPopup] =
    useState(false);
  const [tasksToReassign, setTasksToReassign] = useState([]);
  const [sprintToDeleteDashboard, setSprintToDeleteDashboard] = useState(null);

  const [userTaskCounts, setUserTaskCounts] = useState([]);

  // Estado para manejar el número máximo de tareas
  const [nextTaskNumber, setNextTaskNumber] = useState(0);
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    // Verificar que el usuario sea visitante
    if (role == "user") {
      setActiveTab("project-metrics");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchProject();
      const projectMembers = await fetchTeamMembers();
      setLoading(false);
      await countTasks();
      await fetchAvailableUsers(projectMembers);
      await fetchAllTasks();
    };

    fetchData();
  }, [projectId]);

  // UseEffect para manejar el mensaje de exito
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (showProjectDeleteConfirmation) {
      let timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCountdown(3);
    }
  }, [showProjectDeleteConfirmation]);

  // Función para cargar el proyecto desde la API
  const fetchProject = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError(
        "No se encontró un token de autenticación. Por favor, inicia sesión."
      );
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch project");
      const data = await response.json();
      setProject(data);
      setEditData({
        nombreProyecto: data.nombreProyecto,
        descripcion: data.descripcion,
      });

      // Set sprint duration from project data
      setSprintDuration(data.sprintDuration || 2);

      // Fetch all tasks and generate sprints
      try {
        const tasksResponse = await fetch(
          `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let allTasks = [];
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          allTasks = tasksData.tasks || [];
        }

        // Generar sprints dinámicamente basado en sprintNumber del proyecto
        const sprintNumber = data.sprintNumber || 3;
        const duration = data.sprintDuration || 2;
        const generatedSprints = generateSprints(
          sprintNumber,
          allTasks,
          duration,
          data.fechaCreacion
        );
        setSprints(generatedSprints);
      } catch (taskError) {
        console.error("Error fetching tasks:", taskError);
        // Si falla al cargar tareas, generar sprints sin tareas
        const sprintNumber = data.sprintNumber || 3;
        const duration = data.sprintDuration || 2;
        const generatedSprints = generateSprints(
          sprintNumber,
          [],
          duration,
          data.fechaCreacion
        );
        setSprints(generatedSprints);
      }
    } catch (error) {
      setError("Error al cargar el proyecto. Por favor, inténtalo de nuevo.");
      console.error("Error fetching project:", error);
    }
  };

  // Cargar todas las tareas del proyecto al montar el componente
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Error al cargar las tareas");

        const { tasks: dbTasks } = await response.json();
        setTasks(dbTasks);
      } catch (error) {
        console.error("Error al cargar las tareas:", error);
        setError("No se pudieron cargar las tareas del proyecto.");
      }
    };

    fetchTasks();
  }, [projectId]);

  const handleSprintClick = (sprint) => {
    setSelectedSprint(sprint);
  };

  const handleInsertElement = async (payload) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró token de autenticación");
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/projectsFB/${projectId}/add-element`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al agregar el elemento");
      }

      setSuccessMessage("Elemento agregado exitosamente");
      setShowInsertElementPopup(false);
      await fetchProject();
    } catch (error) {
      console.error("Error adding element:", error);
      setError(
        error.message || "Error al agregar el elemento. Por favor, inténtalo de nuevo."
      );
    }
  };

  const handleCloseSprintDetails = () => {
    setSelectedSprint(null);
  };

  const countTasks = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/projectsFB/${projectId}/countTasks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to count tasks");
      }

      const data = await response.json();

      if (data.success) {
        setUserTaskCounts(data.userDetails);
      }
    } catch (error) {
      console.error("Error counting tasks: ", error);
      setError("Error al obtener el conteo de tareas.");
    }
  };

  // Función para obtener los usuarios disponibles que no son miembros del equipo
  const fetchAvailableUsers = async (projectMembers) => {
    try {
      const response = await fetch(`${BACKEND_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      if (data.success) {
        const mappedUsers = data.users.map((user) => ({
          id: user.UserID,
          name: user.username,
          lastname: user.lastname,
          role: user.role,
          email: user.email,
          initials: `${user.username[0] || ""}${
            user.lastname?.[0] || ""
          }`.toUpperCase(),
        }));

        const filteredUsers = mappedUsers.filter(
          (user) => !projectMembers.some((member) => member.id === user.id)
        );

        setAvailableMembers(filteredUsers);
      } else {
        console.error("Error fetching users:", data.message);
      }
    } catch (error) {
      console.error("Error fetching available users:", error);
    }
  };

  // Función para obtener los miembros del equipo del proyecto
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/projectsFB/${projectId}/team`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }

      const data = await response.json();

      if (data.success) {
        const mappedTeamMembers = data.teamMembers.map((member) => ({
          id: member.UserID,
          name: member.username,
          lastname: member.lastname,
          title: member.title,
          email: member.email,
          initials: `${member.username[0] || ""}${
            member.lastname?.[0] || ""
          }`.toUpperCase(),
        }));

        setTeamMembers(mappedTeamMembers);
        return mappedTeamMembers;
      } else {
        console.error("Error fetching team members:", data.message);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      setError("Error al cargar los miembros del equipo.");
    }
  };

  // Función para obtener todas las tareas del proyecto
  const fetchAllTasks = async () => {
    try {
      const resp = await fetch(
        `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!resp.ok) throw new Error("Failed to fetch all tasks");

      const { tasks: dbTasks } = await resp.json();
      setAllTasks(dbTasks);

      const nextTaskNumber = dbTasks.length;
      setNextTaskNumber(nextTaskNumber);

      // Regenerar los sprints para metricas
      if (project) {
        const sprintNumber = project.sprintNumber || 3;
        const duration = project.sprintDuration || 2;
        const regeneratedSprints = generateSprints(
          sprintNumber,
          dbTasks,
          duration,
          project.fechaCreacion
        );
        setSprints(regeneratedSprints);
      }
    } catch (error) {
      console.error("Error fetching all tasks:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error("Failed to update project");

      setProject((prev) => ({
        ...prev,
        ...editData,
      }));
      setIsEditing(false);
      setSuccessMessage("Proyecto actualizado exitosamente.");
    } catch (error) {
      console.error("Error updating project:", error);
      setError(
        "Error al actualizar el proyecto. Por favor, inténtalo de nuevo."
      );
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedItem || !project) return;

    try {
      setSaveStatus({ loading: true, error: null, success: false });

      const updatedProject = {
        ...project,
        [activeRequirement]: project[activeRequirement].map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                titulo: requirementEditData.title,
                data: requirementEditData.description,
              }
            : item
        ),
      };

      const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          nombreProyecto: updatedProject.nombreProyecto,
          descripcion: updatedProject.descripcion,
          [activeRequirement]: updatedProject[activeRequirement],
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "Error al guardar en el servidor"
        );
      }

      setProject(updatedProject);
      setSaveStatus({ loading: false, error: null, success: true });
      setSuccessMessage("Cambios guardados exitosamente");
      handleClosePopup(); // Asegurarse de cerrar el popup después de guardar
    } catch (error) {
      console.error("Error al guardar:", error);
      setSaveStatus({
        loading: false,
        error: error.message,
        success: false,
      });
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (editing) {
      setRequirementEditData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setEditData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const closeErrorPopup = () => {
    setError(null);
  };

  const closeSuccessPopup = () => {
    setSuccessMessage(null);
  };

  const handleItemClick = async (item) => {
    console.log("Active Requirement:", activeRequirement);
    setSelectedItem(item);
    setRequirementEditData({
      title: item.titulo,
      description: item.data,
    });
    setShowPopup(true);

    try {
      const resp = await fetch(
        `${BACKEND_URL}/projectsFB/${projectId}/tasks?requirementType=${activeRequirement}&elementId=${item.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!resp.ok) throw new Error("Failed to fetch tasks");
      const { tasks: dbTasks } = await resp.json();
      const mapped = dbTasks.map((t) => {
        const rawId = t.id.toString();
        const num = rawId.startsWith("T") ? rawId.slice(1) : rawId;
        const padded = num.padStart(2, "0");
        return {
          id: `T${padded}`,
          title: t.titulo,
          description: t.descripcion,
          priority: t.prioridad,
          assignee: teamMembers.find((m) => m.id === t.asignados)?.email || "",
          sprint: t.sprint,
          puntosHistoria: t.puntosHistoria || null,
        };
      });
      setTasks((prev) => ({ ...prev, [item.id]: mapped }));
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleStatCardClick = (requirementType) => {
    setActiveTab("requirements");
    setActiveRequirement(requirementType);
  };

  const handleEditTeam = () => {
    setShowTeamPopup(true);
  };

  const handleMemberSelect = (member) => {
    setSelectedMembers((prev) => {
      if (prev.some((m) => m.email === member.email)) {
        return prev.filter((m) => m.email !== member.email);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleSaveTeam = async (addedMembers, removedMembers, currentUser) => {
    try {
      // Ensure user information is complete
      const user = currentUser || {
        userId: userId || localStorage.getItem("userId"),
        name: localStorage.getItem("username"),
        lastname: localStorage.getItem("lastname"),
      };

      if (!user.userId || !user.name || !user.lastname) {
        console.error(
          "Información del usuario actual incompleta o no definida."
        );
        console.error("Datos faltantes:", {
          userId: user.userId,
          name: user.name,
          lastname: user.lastname,
        });
        setError("Error: Información del usuario actual incompleta.");
        return;
      }

      await Promise.all([
        ...addedMembers.map((member) =>
          fetch(`${BACKEND_URL}/projectsFB/linkUserToProject`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ userId: member.id, projectId }),
          })
        ),
        ...removedMembers.map((member) =>
          fetch(`${BACKEND_URL}/projectsFB/unlinkUserFromProject`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ userId: member.id, projectId }),
          })
        ),
      ]);

      await Promise.all([
        ...addedMembers.map((member) => {
          const url = `${BACKEND_URL}/projectsFB/${projectId}/history`;

          return fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              action: "MEMBER_ADDED",
              userId: user.userId,
              userName: user.name,
              userLastname: user.lastname,
              targetUserId: member.id,
              details: `Se agregó a ${member.name} ${member.lastname || ""} (${
                member.email
              }) al equipo del proyecto`,
              timestamp: new Date().toISOString(),
            }),
          }).catch((err) => {
            console.error("Error in MEMBER_ADDED request:", err);
          });
        }),
        ...removedMembers.map((member) => {
          const url = `${BACKEND_URL}/projectsFB/${projectId}/history`;

          return fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              action: "MEMBER_REMOVED",
              userId: user.userId,
              userName: user.name,
              userLastname: user.lastname,
              targetUserId: member.id,
              details: `Se removió a ${member.name} ${member.lastname || ""} (${
                member.email
              }) del equipo del proyecto`,
              timestamp: new Date().toISOString(),
            }),
          }).catch((err) => {
            console.error("Error in MEMBER_REMOVED request:", err);
          });
        }),
      ]);

      setTeamMembers((prev) => [
        ...prev.filter(
          (tm) => !removedMembers.some((rm) => rm.email === tm.email)
        ),
        ...addedMembers,
      ]);
      setAvailableMembers((prev) => [
        ...prev.filter((am) => !addedMembers.some((m) => m.email === am.email)),
        ...removedMembers,
      ]);
      setShowTeamPopup(false);
      setSuccessMessage("Equipo actualizado correctamente");
    } catch (err) {
      console.error("Error en handleSaveTeam:", err);
      setError("No se pudieron guardar los cambios de equipo");
    }
  };

  const handleCancelTeam = () => {
    setShowTeamPopup(false);
    setSelectedMembers([]);
  };

  const handleMemberMenuClick = (e, member) => {
    e.stopPropagation();
    setShowMemberMenu(showMemberMenu === member.email ? null : member.email);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setMemberAction("edit");
    setShowMemberMenu(null);
  };

  const handleRemoveMember = async (member) => {
    try {
      await fetch(`${BACKEND_URL}/projectsFB/unlinkUserFromProject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userId: member.id,
          projectId,
        }),
      });

      setTeamMembers((prev) =>
        prev.filter((teamMember) => teamMember.email !== member.email)
      );
      setAvailableMembers((prev) => [...prev, member]);
      setEditingMember(null);
      setMemberAction(null);
      setSuccessMessage("Miembro eliminado exitosamente.");
    } catch (error) {
      console.error("Error removing user from project:", error);
      setError("Error al eliminar miembro del proyecto.");
    }
  };

  const handleUpdateMember = (e) => {
    e.preventDefault();
    if (editingMember) {
      setTeamMembers((prev) =>
        prev.map((member) =>
          member.email === editingMember.email ? editingMember : member
        )
      );
      setEditingMember(null);
      setMemberAction(null);
    }
  };

  const handleConfirmRemove = () => {
    if (editingMember) {
      setTeamMembers((prev) =>
        prev.filter((member) => member.email !== editingMember.email)
      );
      setAvailableMembers((prev) => [...prev, editingMember]);
      setEditingMember(null);
      setMemberAction(null);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setShowTaskForm(false);
    setSelectedItem(null);
    setTaskFormData({
      title: "",
      description: "",
      priority: "",
      assignee: "",
    });
    setEditing(false);
    setDeleteMode(false);
    setRequirementEditData({
      title: "",
      description: "",
    });
    setSaveStatus({
      loading: false,
      error: null,
      success: false,
    });
    setIsEditing(false);
  };

  const handleDragStart = (e, taskId, index) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("index", index);
    e.currentTarget.classList.add("dragging");
    setDraggedTask({ id: taskId, index });
  };

  const handleDragEnd = (e) => {
    document.querySelectorAll(".dragging").forEach((element) => {
      element.classList.remove("dragging");
    });
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = async (e, targetIndex, elementId) => {
    e.preventDefault();
    if (!draggedTask || !elementId) return;
  
    // 1. Copia el array actual de tareas del HU
    const currentTasks = tasks[elementId] ? [...tasks[elementId]] : [];
    const fromIndex = draggedTask.index;
  
    // 2. Reordena el array localmente
    const [movedTask] = currentTasks.splice(fromIndex, 1);
    currentTasks.splice(targetIndex, 0, movedTask);
  
    setTasks((prev) => ({
      ...prev,
      [elementId]: currentTasks,
    }));
  
    // 3. Prepara el payload para el backend
    const payload = {
      requirementType: activeRequirement,
      elementId,
      tasks: currentTasks.map((task) => ({
        id: task.id.replace(/^T/, ""),
        titulo: task.title,
        descripcion: task.description,
        prioridad: task.priority,
        asignados: teamMembers.find((m) => m.email === task.assignee)?.id || null,
        sprint: task.sprint,
        puntosHistoria: task.puntosHistoria || null,
      })),
    };
  
    try {
      await fetch(`${BACKEND_URL}/projectsFB/${projectId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      setSuccessMessage("Orden de tareas actualizado.");
    } catch (error) {
      setError("Error al actualizar el orden de tareas.");
      console.error(error);
    }
    setDraggedTask(null);
  };

  const handleDeleteTask = async (taskId, elementId) => {
    const updatedTasksArr = (tasks[elementId] || []).filter(
      (task) => task.id !== taskId
    );
    setTasks((prev) => ({
      ...prev,
      [elementId]: updatedTasksArr,
    }));
    setSuccessMessage("Tarea eliminada exitosamente.");
    setShowDeleteConfirmation(false);
    setTaskToDelete(null);
    setDeleteMode(false);

    try {
      const payload = {
        requirementType: activeRequirement,
        elementId,
        tasks: updatedTasksArr.map((task) => ({
          id: task.id.toString(),
          titulo: task.title,
          descripcion: task.description,
          prioridad: task.priority,
          asignados:
            teamMembers.find((m) => m.email === task.assignee)?.id || null,
            sprint: task.sprint || null,
            puntosHistoria: task.puntosHistoria || null,
        })),
      };
      await fetch(`${BACKEND_URL}/projectsFB/${projectId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Error al eliminar tarea en servidor:", err);
      setError("Error al eliminar la tarea en el servidor.");
    }
  };

  // Función auxiliar para formatear fechas usando UTC
  const formatDateWithoutTimezone = (dateString) => {
    if (!dateString) return "";

    // Si la fecha ya está en formato YYYY-MM-DD, parsearla como UTC
    if (
      typeof dateString === "string" &&
      dateString.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      const dateParts = dateString.split("-");
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      const day = parseInt(dateParts[2]);

      return `${String(day).padStart(2, "0")}/${String(month).padStart(
        2,
        "0"
      )}/${year}`;
    }

    // Para fechas de Firebase o fechas completas, crear objeto Date y usar UTC
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();

    return `${String(day).padStart(2, "0")}/${String(month).padStart(
      2,
      "0"
    )}/${year}`;
  };

  const renderSprintBacklogTab = () => (
    <div>
      <div className="sprints-grid">
        {sprints.length > 0 ? (
          <>
            {sprints.map((sprint, index) => (
              <div
                key={index}
                className="sprint-card"
                onClick={() => handleSprintClick(sprint)}
              >
                <h3 className="sprint-title">SPRINT {sprint.number}</h3>
                <div className="sprint-status-container">
                  <span
                    className={`status-badge ${sprint.status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {sprint.status}
                  </span>
                </div>
                <div className="sprint-dates">
                  <div className="date-item">
                    <span className="calendar-icon">📅</span>
                    <span className="date-text">
                      {formatDateWithoutTimezone(sprint.startDate)}
                    </span>
                  </div>
                  <div className="date-separator">→</div>
                  <div className="date-item">
                    <span className="calendar-icon">📅</span>
                    <span className="date-text">
                      {formatDateWithoutTimezone(sprint.endDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {role === "admin" && (
              <div
                className="sprint-card add-sprint-card"
                onClick={handleAddSprint}
              >
                <div className="add-sprint-content">
                  <div className="add-sprint-icon">+</div>
                  <h3 className="add-sprint-title">Agregar Sprint</h3>
                  <p className="add-sprint-description">
                    Haz clic para añadir un nuevo sprint al proyecto
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-sprints">
            <p>No hay sprints disponibles</p>
          </div>
        )}
      </div>

      {role === "admin" && (
        <div className="sprint-configuration-section">
          <h3>Configuración de Sprints</h3>
          <div className="sprint-config-content">
            <div className="config-option">
              <label htmlFor="sprint-duration">Duración del Sprint:</label>
              <select
                id="sprint-duration"
                value={sprintDuration}
                onChange={(e) =>
                  handleSprintDurationChange(parseInt(e.target.value))
                }
                className="sprint-duration-select"
              >
                <option value={1}>1 semana</option>
                <option value={2}>2 semanas</option>
                <option value={3}>3 semanas</option>
                <option value={4}>4 semanas</option>
              </select>
            </div>
            <div className="config-option">
              <label>Eliminar último Sprint:</label>
              <button
                className="delete-sprint-button"
                onClick={() => setShowDeleteSprintConfirmation(true)}
                disabled={(project.sprintNumber || 3) <= 1}
                title={
                  (project.sprintNumber || 3) <= 1
                    ? "No se puede eliminar el único sprint"
                    : "Eliminar el último sprint"
                }
              >
                Eliminar Sprint
              </button>
            </div>
            <div className="config-info">
              <p>
                <strong>Información:</strong> Cambiar la duración afectará las
                fechas de todos los sprints.
              </p>
              {project.fechaCreacion && (
                <p>
                  <strong>Fecha de creación del proyecto:</strong>{" "}
                  {formatDateWithoutTimezone(project.fechaCreacion)}
                </p>
              )}
              <p>
                <strong>Sprints actuales:</strong> {project.sprintNumber || 3}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRequirementsTab = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          className="popup-button primary small-add-element"
          onClick={() => setShowInsertElementPopup(true)}
        >
          Agregar Elemento
        </button>
      </div>
      <RenderRequirementsTab
        project={project}
        activeRequirement={activeRequirement}
        setActiveRequirement={setActiveRequirement}
        handleItemClick={handleItemClick}
        showPopup={showPopup}
        selectedItem={selectedItem}
        handleClosePopup={handleClosePopup}
        tasks={tasks}
        setTasks={setTasks}
        teamMembers={teamMembers}
        setTaskToDelete={setTaskToDelete}
        deleteMode={deleteMode}
        setDeleteMode={setDeleteMode}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDragEnter={handleDragEnter}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        handleDragEnd={handleDragEnd}
        showTaskForm={showTaskForm}
        setShowTaskForm={setShowTaskForm}
        taskFormData={taskFormData}
        setTaskFormData={setTaskFormData}
        setSuccessMessage={setSuccessMessage}
        setShowDeleteConfirmation={setShowDeleteConfirmation}
        role={role}
        editing={editing}
        setEditing={setEditing}
        saveStatus={saveStatus}
        setSaveStatus={setSaveStatus}
        requirementEditData={requirementEditData}
        setRequirementEditData={setRequirementEditData}
        handleSaveEdit={handleSaveEdit}
        handleInputChange={handleInputChange}
        nextTaskNumber={nextTaskNumber}
        setNextTaskNumber={setNextTaskNumber}
        fetchAllTasks={fetchAllTasks}
      />
    </div>
  );

  const renderMetricsTab = () => (
    <ProjectMetrics tasks={allTasks} sprints={sprints} />
  );

  const refreshSprintsAfterDurationChange = async (newDuration) => {
    try {
      const tasksResponse = await fetch(
        `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      let allTasks = [];
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        allTasks = tasksData.tasks || [];
      }

      const sprintNumber = project.sprintNumber || 3;
      const regeneratedSprints = generateSprints(
        sprintNumber,
        allTasks,
        newDuration,
        project.fechaCreacion
      );
      setSprints(regeneratedSprints);
    } catch (error) {
      console.error("Error refreshing sprints:", error);
    }
  };

  const handleSprintDurationChange = async (newDuration) => {
    try {
      const updateData = {
        nombreProyecto: project.nombreProyecto,
        descripcion: project.descripcion,
        sprintNumber: project.sprintNumber,
        sprintDuration: newDuration,
        estatus: project.estatus,
        fechaCreacion: project.fechaCreacion,
        // Include all the existing arrays
        EP: project.EP || [],
        RF: project.RF || [],
        RNF: project.RNF || [],
        HU: project.HU || [],
      };

      const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const updatedProject = { ...project, sprintDuration: newDuration };
      setProject(updatedProject);
      setSprintDuration(newDuration);

      const sprintNumber = project.sprintNumber || 3;

      try {
        const tasksResponse = await fetch(
          `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        let allTasks = [];
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          allTasks = tasksData.tasks || [];
        }

        const regeneratedSprints = generateSprints(
          sprintNumber,
          allTasks,
          newDuration,
          project.fechaCreacion
        );
        setSprints(regeneratedSprints);
      } catch (taskError) {
        console.error("Error fetching tasks:", taskError);
        const regeneratedSprints = generateSprints(
          sprintNumber,
          [],
          newDuration,
          project.fechaCreacion
        );
        setSprints(regeneratedSprints);
      }

      setSuccessMessage("Duración de sprints actualizada exitosamente.");

      await refreshSprintsAfterDurationChange(newDuration);
    } catch (error) {
      console.error("Error updating sprint duration:", error);
      setError(`Error al actualizar la duración de los sprints`);
    }
  };

  const handleAddSprint = async () => {
    try {
      const newSprintNumber = (project.sprintNumber || 3) + 1;

      const updateData = {
        sprintNumber: newSprintNumber,
      };

      const response = await fetch(
        `${BACKEND_URL}/projectsFB/${projectId}/updateSprintNumber`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update project with new sprint count");
      }

      const updatedProject = { ...project, sprintNumber: newSprintNumber };
      setProject(updatedProject);

      try {
        const tasksResponse = await fetch(
          `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        let allTasks = [];
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          allTasks = tasksData.tasks || [];
        }

        const regeneratedSprints = generateSprints(
          newSprintNumber,
          allTasks,
          project.sprintDuration || 2,
          project.fechaCreacion
        );
        setSprints(regeneratedSprints);
      } catch (taskError) {
        console.error("Error fetching tasks:", taskError);
        const regeneratedSprints = generateSprints(
          newSprintNumber,
          [],
          project.sprintDuration || 2,
          project.fechaCreacion
        );
        setSprints(regeneratedSprints);
      }

      setSuccessMessage("Sprint agregado exitosamente.");
    } catch (error) {
      console.error("Error adding new sprint:", error);
      setError(
        "Error al agregar el nuevo sprint. Por favor, inténtalo de nuevo."
      );
    }
  };

  const handleDeleteProject = async (projectId) => {
    setProjectToDelete(projectId);
    setShowProjectDeleteConfirmation(true);
  };

  const confirmDeleteProject = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete project");

      setSuccessMessage("Proyecto eliminado exitosamente.");
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Error al eliminar el proyecto. Por favor, inténtalo de nuevo.");
    } finally {
      setShowProjectDeleteConfirmation(false);
      setProjectToDelete(null);
    }
  };

  const handleDeleteLastSprint = async () => {
    try {
      const currentSprintCount = project.sprintNumber || 3;

      if (currentSprintCount <= 1) {
        setError(
          "No se puede eliminar el sprint. Debe haber al menos un sprint en el proyecto."
        );
        return;
      }

      setShowDeleteSprintConfirmation(false);

      const tasksResponse = await fetch(
        `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      let allTasks = [];
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        allTasks = tasksData.tasks || [];
      }

      const tasksInLastSprint = allTasks.filter(
        (task) => parseInt(task.sprint, 10) === currentSprintCount
      );

      setTasksToReassign(tasksInLastSprint);
      setSprintToDeleteDashboard(currentSprintCount);

      const availableSprints = sprints.filter(
        (sprint) => sprint.number !== currentSprintCount
      );

      if (tasksInLastSprint.length > 0 && availableSprints.length > 0) {
        setShowTaskReassignmentPopup(true);
      } else {
        setDeletingSprint(true);
        await performSprintDeletion(currentSprintCount, {});
      }
    } catch (error) {
      console.error("Error preparing sprint deletion:", error);
      setError("Error al preparar la eliminación del sprint.");
    }
  };

  const performSprintDeletion = async (sprintNumber, taskAssignments) => {
    try {
      setDeletingSprint(true); // Show spinner
      const newSprintNumber = sprintNumber - 1;

      if (Object.keys(taskAssignments).length > 0) {
        const tasksResponse = await fetch(
          `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          const allTasks = tasksData.tasks || [];

          const updatedTasks = allTasks
            .map((task) => {
              if (taskAssignments[task.id]) {
                return {
                  ...task,
                  sprint: taskAssignments[task.id],
                };
              }
              return task;
            })
            .filter((task) => task.sprint !== sprintNumber);

          const tasksByElement = {};
          updatedTasks.forEach((task) => {
            const key = `${task.requirementType}_${task.elementId}`;
            if (!tasksByElement[key]) {
              tasksByElement[key] = {
                requirementType: task.requirementType,
                elementId: task.elementId,
                tasks: [],
              };
            }
            tasksByElement[key].tasks.push({
              id: task.id,
              titulo: task.titulo,
              descripcion: task.descripcion,
              prioridad: task.prioridad,
              asignados: task.asignados,
              sprint: task.sprint,
              estado: task.estado || "Pendiente",
            });
          });

          for (const elementData of Object.values(tasksByElement)) {
            await fetch(`${BACKEND_URL}/projectsFB/${projectId}/tasks`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                requirementType: elementData.requirementType,
                elementId: elementData.elementId,
                tasks: elementData.tasks,
              }),
            });
          }

          setAllTasks(updatedTasks);
        }
      }

      const updateData = {
        sprintNumber: newSprintNumber,
      };

      const response = await fetch(
        `${BACKEND_URL}/projectsFB/${projectId}/updateSprintNumber`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update project with new sprint count");
      }

      const updatedProject = { ...project, sprintNumber: newSprintNumber };
      setProject(updatedProject);

      try {
        const tasksResponse = await fetch(
          `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        let allTasks = [];
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          allTasks = tasksData.tasks || [];
        }

        const regeneratedSprints = generateSprints(
          newSprintNumber,
          allTasks,
          project.sprintDuration || 2,
          project.fechaCreacion
        );
        setSprints(regeneratedSprints);
      } catch (taskError) {
        console.error("Error fetching tasks:", taskError);
        const regeneratedSprints = generateSprints(
          newSprintNumber,
          [],
          project.sprintDuration || 2,
          project.fechaCreacion
        );
        setSprints(regeneratedSprints);
      }

      setSuccessMessage("Sprint eliminado exitosamente.");
    } catch (error) {
      console.error("Error deleting sprint:", error);
      setError("Error al eliminar el sprint. Por favor, inténtalo de nuevo.");
    } finally {
      setDeletingSprint(false); // Hide spinner
    }
  };

  const handleTaskReassignmentConfirm = async (taskAssignments) => {
    setShowTaskReassignmentPopup(false);
    setDeletingSprint(true);
    await performSprintDeletion(sprintToDeleteDashboard, taskAssignments);
    setTasksToReassign([]);
    setSprintToDeleteDashboard(null);
  };

  const handleTaskReassignmentCancel = () => {
    setShowTaskReassignmentPopup(false);
    setTasksToReassign([]);
    setSprintToDeleteDashboard(null);
  };

  const refreshSprintsData = async () => {
    try {
      const tasksResponse = await fetch(
        `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        const allTasks = tasksData.tasks || [];

        // Regenerate sprints with updated task data
        const sprintNumber = project.sprintNumber || 3;
        const generatedSprints = generateSprints(
          sprintNumber,
          allTasks,
          sprintDuration,
          project.fechaCreacion
        );
        setSprints(generatedSprints);

        // Update the selected sprint with fresh data
        if (selectedSprint) {
          const updatedSelectedSprint = generatedSprints.find(
            (sprint) => sprint.number === selectedSprint.number
          );
          setSelectedSprint(updatedSelectedSprint);
        }
      }
    } catch (error) {
      console.error("Error refreshing sprints:", error);
    }
  };

  const renderSprintDetails = (selectedSprint) => {
    return (
      <SprintDetails
        sprint={selectedSprint}
        sprintTasks={allTasks.filter((task) => {
          return parseInt(task.sprint, 10) === selectedSprint.number;
        })}
        setAllTasks={setAllTasks}
        onClose={handleCloseSprintDetails}
        projectId={projectId}
        refreshSprintsData={refreshSprintsData}
      />
    );
  };

  if (loading) {
    return (
      <div className="white-container">
        <TopAppBar />
        <div className="home-container">
          <div className="main-title">
            <h1>Dashboard</h1>
          </div>
          <div className="loading-popup">
            <div className="spinner"></div>
            <p className="loading-text">Cargando proyecto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="white-container">
        <TopAppBar />
        <div className="home-container">
          <div className="main-title">
            <h1>Dashboard</h1>
          </div>
          <div className="dashboard-error">
            <h2>Proyecto no encontrado</h2>
            <button onClick={() => navigate("/home")}>Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="overview-section">
      <div className="project-header">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editData.nombreProyecto}
              onChange={(e) =>
                setEditData({ ...editData, nombreProyecto: e.target.value })
              }
              className="edit-input title"
            />
            <textarea
              value={editData.descripcion}
              onChange={(e) =>
                setEditData({ ...editData, descripcion: e.target.value })
              }
              className="edit-input description"
            />
            <div className="edit-actions">
              <button className="save-button" onClick={handleSave}>
                Guardar
              </button>
              <button
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <h1>{project.nombreProyecto}</h1>
            <p style={{ marginBottom: "10px", fontSize: "16px" }}>
              {project.descripcion}
            </p>
            {(role === "admin" || role === "editor") && (
              <div className="button-container">
                <button
                  className="popup-button delete equal-width-btn"
                  onClick={() => handleDeleteProject(projectId)}
                >
                  Eliminar Proyecto
                </button>
                <button
                  className="popup-button primary small-add-element equal-width-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Editar Proyecto
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="stats-grid">
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("EP")}
        >
          <h3>Épicas</h3>
          <p className="stat-number">{project.EP?.length || 0}</p>
        </div>
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("RF")}
        >
          <h3>Requerimientos Funcionales</h3>
          <p className="stat-number">{project.RF?.length || 0}</p>
        </div>
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("RNF")}
        >
          <h3>Requerimientos No Funcionales</h3>
          <p className="stat-number">{project.RNF?.length || 0}</p>
        </div>
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("HU")}
        >
          <h3>Historias de Usuario</h3>
          <p className="stat-number">{project.HU?.length || 0}</p>
        </div>
      </div>

      <div className="modification-history-section">
        <ModificationHistory projectId={projectId} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="white-container">
        <TopAppBar />
        <div className="home-container">
          <div className="main-title">
            <h1>Dashboard</h1>
          </div>
          <div className="loading-popup">
            <div className="spinner"></div>
            <p className="loading-text">Cargando proyecto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="white-container">
        <TopAppBar />
        <div className="home-container">
          <div className="main-title">
            <h1>Dashboard</h1>
          </div>
          <div className="dashboard-error">
            <h2>Proyecto no encontrado</h2>
            <button onClick={() => navigate("/home")}>Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <TopAppBar />
      <div className="main-title">
        <h1>
          {project && project.nombreProyecto
            ? `${project.nombreProyecto} - Dashboard`
            : "Dashboard"}
        </h1>
      </div>
      <div className="dashboard-content">
        <div className="main-dashboard-content">
          <div className="dashboard-header-row">
            <button className="back-button" onClick={() => navigate("/home")}>
              ←
            </button>
          </div>
          <div className="dashboard-tabs">
            {(role == "admin" || role == "editor") && (
              <>
                <button
                  className={`tab-button ${
                    activeTab === "overview" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  Vista General
                </button>
                <button
                  className={`tab-button ${
                    activeTab === "requirements" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("requirements")}
                >
                  Elementos
                </button>
                <button
                  className={`tab-button ${
                    activeTab === "sprint-backlog" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("sprint-backlog")}
                >
                  Sprint Backlog
                </button>
              </>
            )}
            <button
              className={`tab-button ${
                activeTab === "project-metrics" ? "active" : ""
              }`}
              onClick={() => setActiveTab("project-metrics")}
            >
              Métricas del Proyecto
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "overview"
              ? renderOverviewTab()
              : activeTab === "requirements"
              ? renderRequirementsTab()
              : activeTab === "project-metrics"
              ? renderMetricsTab()
              : renderSprintBacklogTab()}
          </div>
        </div>

        <div className="team-members-container">
          <h2 className="team-members-title">Equipo del Proyecto</h2>
          <div className="team-members-content">
            {teamMembers.map((member, index) => {
              const userTaskData = userTaskCounts.find(
                (user) => user.userId === member.id
              );
              const taskCount = userTaskData ? userTaskData.taskCount : 0;
              return (
                <div key={index} className="team-member-card">
                  <div className="member-profile">{member.initials}</div>
                  <div className="member-info">
                    <div className="member-name" style={{ fontSize: "16px" }}>
                      {member.name}
                    </div>
                    <div className="member-role" style={{ fontSize: "16px" }}>
                      {member.title}
                    </div>
                    <div className="member-email" style={{ fontSize: "16px" }}>
                      {member.email}
                    </div>
                    {activeTab === "project-metrics" && (
                      <div className="task-count" style={{ fontSize: "16px" }}>
                        Tareas asignadas: {taskCount}
                      </div>
                    )}
                  </div>
                  {(role === "editor" ||
                    role === "admin" ||
                    activeTab !== "project-metrics") && (
                    <div className="member-actions">
                      {showMemberMenu === member.email && (
                        <div className="member-menu">
                          {role === "admin" && (
                            <button onClick={() => handleEditMember(member)}>
                              Editar
                            </button>
                          )}
                          <button onClick={() => handleRemoveMember(member)}>
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {(role === "admin" || role === "editor") &&
            activeTab !== "project-metrics" && (
              <button className="edit-team-button" onClick={handleEditTeam}>
                Gestionar Equipo
              </button>
            )}
        </div>
      </div>

      {editingMember && (
        <EditMemberPopup
          editingMember={editingMember}
          setEditingMember={setEditingMember}
          memberAction={memberAction}
          setMemberAction={setMemberAction}
          setTeamMembers={setTeamMembers}
          setAvailableMembers={setAvailableMembers}
        />
      )}

      {showTeamPopup && (
        <TeamEditPopup
          availableMembers={availableMembers}
          teamMembers={teamMembers}
          handleSaveTeam={handleSaveTeam}
          handleCancelTeam={handleCancelTeam}
          setError={setError}
        />
      )}

      {selectedSprint && renderSprintDetails(selectedSprint)}

      {showInsertElementPopup && (
        <InsertElement
          onClose={() => setShowInsertElementPopup(false)}
          projectId={projectId}
          setSuccessMessage={setSuccessMessage}
          setError={setError}
          onInsert={handleInsertElement}
          activeRequirement={activeRequirement}
        />
      )}

      <ErrorPopup message={error} onClose={closeErrorPopup} />
      <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />

      {showDeleteConfirmation && taskToDelete && (
        <div
          className="popup-overlay"
          onClick={() => setShowDeleteConfirmation(false)}
        >
          <div
            className="popup-content confirmation-popup"
            onClick={(e) => e.stopPropagation()}
            style={{ minWidth: "500px", textAlign: "center" }}
          >
            <button
              className="popup-close"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              ×
            </button>
            <h3>Confirmar eliminación</h3>
            <p>
              ¿Estás seguro que deseas eliminar la tarea "{taskToDelete.title}"?
            </p>
            <p>Esta acción no se puede deshacer.</p>
            <div className="confirmation-actions">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancelar
              </button>
              <button
                className="delete-button"
                onClick={() =>
                  handleDeleteTask(taskToDelete.id, taskToDelete.elementId)
                }
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showProjectDeleteConfirmation && (
        <div
          className="popup-overlay"
          onClick={() => setShowProjectDeleteConfirmation(false)}
        >
          <div
            className="popup-content confirmation-popup"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px", textAlign: "center" }}
          >
            <h3>Confirmar eliminación</h3>
            <p>
              ¿Estás seguro que deseas eliminar el proyecto? Esta acción no se
              puede deshacer.
            </p>
            <div className="confirmation-actions">
              <button
                className="cancel-button"
                onClick={() => setShowProjectDeleteConfirmation(false)}
              >
                Cancelar
              </button>
              <button
                className="delete-button"
                id="project-delete-button"
                disabled={countdown > 0}
                onClick={confirmDeleteProject}
              >
                {countdown > 0 ? `Eliminar (${countdown})` : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Reassignment Popup */}
      {showTaskReassignmentPopup && (
        <TaskReassignmentPopup
          sprintToDelete={sprintToDeleteDashboard}
          tasksToReassign={tasksToReassign}
          availableSprints={sprints.filter(
            (sprint) => sprint.number !== sprintToDeleteDashboard
          )}
          onConfirm={handleTaskReassignmentConfirm}
          onCancel={handleTaskReassignmentCancel}
        />
      )}

      {/* Delete Sprint Confirmation Dialog */}
      {showDeleteSprintConfirmation && (
        <div
          className="popup-overlay"
          onClick={() => setShowDeleteSprintConfirmation(false)}
        >
          <div
            className="popup-content confirmation-popup"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px", textAlign: "center" }}
          >
            <h3>Confirmar eliminación de Sprint</h3>
            <p>
              ¿Estás seguro que deseas eliminar el último sprint (Sprint{" "}
              {project.sprintNumber || 3})?
            </p>
            <div className="confirmation-actions">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteSprintConfirmation(false)}
              >
                Cancelar
              </button>
              <button
                className="delete-button"
                onClick={handleDeleteLastSprint}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      

      {deletingSprint && (
        <div className="spinner-overlay">
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p style={{ color: "#fff", fontSize: "18px", marginTop: "10px" }}>
              Eliminando Sprint...
            </p>
          </div>
        </div>
      )}
      {/* Popup de error */}
      <ErrorPopup message={error} onClose={closeErrorPopup} />

      {/* Popup de éxito */}
      <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />
      
      
    </div>
  );
};

export default Dashboard;
