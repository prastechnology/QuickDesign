import React, { useEffect, useState } from "react";
import Editor from "./components/Editor.jsx";
import LandingPage from "./components/LandingPage.jsx";
import { templates } from "./data/templates.js";
import { createProjectId } from "./design/localProjects.js";

function readRoute() {
  const params = new URLSearchParams(window.location.search);
  return window.location.pathname === "/create"
    ? { page: "editor", templateId: params.get("template") || templates[5].id, projectId: params.get("project") }
    : { page: "home", templateId: "", projectId: "" };
}

export default function App() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onPopState = () => setRoute(readRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openEditor = (templateId = templates[5].id, projectId = createProjectId()) => {
    const nextUrl = `/create?template=${encodeURIComponent(templateId)}&project=${encodeURIComponent(projectId)}`;
    window.history.pushState({}, "", nextUrl);
    setRoute({ page: "editor", templateId, projectId });
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const goHome = () => {
    window.history.pushState({}, "", "/");
    setRoute({ page: "home", templateId: "" });
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  if (route.page === "editor") {
    return <Editor key={`${route.projectId || "new"}-${route.templateId}`} templateId={route.templateId} projectId={route.projectId} onBack={goHome} onNewTemplate={(nextTemplateId) => openEditor(nextTemplateId)} />;
  }

  return (
    <LandingPage
      templates={templates}
      onCreate={() => openEditor(templates[5].id)}
      onCreateBlank={() => openEditor("blank")}
      onChooseTemplate={(item) => openEditor(item.id)}
      onOpenProject={(project) => openEditor(project.templateId, project.id)}
    />
  );
}
