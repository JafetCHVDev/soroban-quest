import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMissionById } from "../systems/missionLoader";
import { loadProgress } from "../systems/storage";
import { useToast } from "../systems/ToastContext";
import { MissionErrorBoundary } from "../components/ErrorBoundary";
import CodeRecorder from "../systems/codeRecorder";
import useDocumentTitle from "../systems/useDocumentTitle";

import MissionDetailSkeleton from "../components/MissionDetailSkeleton";
import CodeReplayPlayer from "../components/CodeReplayPlayer";
import MissionStoryPanel from "../components/MissionStoryPanel";
import EditorToolbar from "../components/EditorToolbar";
import CodeEditor from "../components/CodeEditor";
import LiveValidationBar from "../components/LiveValidationBar";
import TestTerminal from "../components/TestTerminal";
import VictoryModal from "../components/VictoryModal";
import MissionReplayPanel from "../components/MissionReplayPanel";

import { useMissionState } from "../hooks/useMissionState";
import { useLiveValidation } from "../hooks/useLiveValidation";
import { useMissionActions } from "../hooks/useMissionActions";

import "../components/MissionComponents.css";