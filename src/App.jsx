import React, { useEffect, useState } from "react";
import Editor from "./components/Editor.jsx";
import LandingPage from "./components/LandingPage.jsx";
import { templates } from "./data/templates.js";

function readRoute() {
  const params = new URLSearchParams(window.location.search);
  return window.location.pathname === "/create"
    ? { page: "editor", templateId: params.get("template") || templates[5].id }
    : { page: "home", templateId: "" };
}

export default function App() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onPopState = () => setRoute(readRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openEditor = (templateId = templates[5].id) => {
    const nextUrl = `/create?template=${encodeURIComponent(templateId)}`;
    window.history.pushState({}, "", nextUrl);
    setRoute({ page: "editor", templateId });
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const goHome = () => {
    window.history.pushState({}, "", "/");
    setRoute({ page: "home", templateId: "" });
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  if (route.page === "editor") {
    return <Editor templateId={route.templateId} onBack={goHome} />;
  }

  return (
    <LandingPage
      templates={templates}
      onCreate={() => openEditor(templates[5].id)}
      onChooseTemplate={(item) => openEditor(item.id)}
    />
  );
}
